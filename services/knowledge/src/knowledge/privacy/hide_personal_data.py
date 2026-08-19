import re
from functools import lru_cache

from presidio_analyzer import AnalyzerEngine, RecognizerRegistry, RecognizerResult
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_analyzer.predefined_recognizers import (
    InAadhaarRecognizer,
    InPanRecognizer,
    InPassportRecognizer,
    InVoterRecognizer,
)
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

from knowledge.privacy.indian_recognizers import build_indian_recognizers

PLACEHOLDERS = {
    "PHONE_NUMBER": "[PHONE]",
    "EMAIL_ADDRESS": "[EMAIL]",
    "IN_AADHAAR": "[AADHAAR]",
    "IN_PAN": "[PAN]",
    "IN_PASSPORT": "[PASSPORT]",
    "IN_VOTER": "[VOTER ID]",
    "IN_UPI": "[UPI]",
    "IN_BANK_ACCOUNT": "[BANK ACCOUNT]",
    "IN_IFSC": "[IFSC]",
    "CREDIT_CARD": "[CARD]",
    "IBAN_CODE": "[BANK ACCOUNT]",
    "PERSON": "[NAME]",
}
SCORE_THRESHOLD = 0.4
PERSONAL_CONTEXT = re.compile(
    r"\b(?:name\s*[:\-]|father|mother|guardian|roll\s*(?:no|number)|mobile|phone|d\.?o\.?b|"
    r"date of birth|born on|signature|s/o|d/o|w/o)",
    re.IGNORECASE,
)


@lru_cache(maxsize=1)
def get_analyzer() -> AnalyzerEngine:
    nlp_engine = NlpEngineProvider(
        nlp_configuration={
            "nlp_engine_name": "spacy",
            "models": [{"lang_code": "en", "model_name": "en_core_web_lg"}],
        }
    ).create_engine()
    registry = RecognizerRegistry()
    registry.load_predefined_recognizers(nlp_engine=nlp_engine)
    indian_recognizers = [
        InAadhaarRecognizer(),
        InPanRecognizer(),
        InPassportRecognizer(),
        InVoterRecognizer(),
        *build_indian_recognizers(),
    ]
    for recognizer in indian_recognizers:
        registry.add_recognizer(recognizer)
    return AnalyzerEngine(registry=registry, nlp_engine=nlp_engine)


@lru_cache(maxsize=1)
def get_anonymizer() -> AnonymizerEngine:
    return AnonymizerEngine()  # type: ignore[no-untyped-call]


def is_personal_name(text: str, result: RecognizerResult) -> bool:
    line_start = text.rfind("\n", 0, result.start) + 1
    line_end = text.find("\n", result.end)
    line = text[line_start : line_end if line_end != -1 else len(text)]
    return PERSONAL_CONTEXT.search(line) is not None


def find_personal_data(text: str) -> list[RecognizerResult]:
    results = get_analyzer().analyze(
        text=text,
        language="en",
        entities=list(PLACEHOLDERS),
        score_threshold=SCORE_THRESHOLD,
    )
    return [
        result
        for result in results
        if result.entity_type != "PERSON" or is_personal_name(text, result)
    ]


def hide_personal_data(text: str) -> str:
    findings = find_personal_data(text)
    if not findings:
        return text
    operators = {
        entity: OperatorConfig("replace", {"new_value": placeholder})
        for entity, placeholder in PLACEHOLDERS.items()
    }
    anonymized = get_anonymizer().anonymize(
        text=text,
        analyzer_results=findings,  # type: ignore[arg-type]
        operators=operators,
    )
    return anonymized.text
