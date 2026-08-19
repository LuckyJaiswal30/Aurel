from presidio_analyzer import Pattern, PatternRecognizer

UPI_PATTERN = r"\b[a-zA-Z0-9._-]{2,256}@(?!gmail|yahoo|outlook|hotmail)[a-zA-Z]{3,64}\b"
MOBILE_PATTERN = r"(?<![\w.])(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}\b"


def build_upi_recognizer() -> PatternRecognizer:
    return PatternRecognizer(
        supported_entity="IN_UPI",
        patterns=[Pattern("UPI ID", UPI_PATTERN, 0.5)],
        context=["upi", "vpa", "gpay", "phonepe", "paytm", "bhim", "pay"],
    )


def build_bank_account_recognizer() -> PatternRecognizer:
    return PatternRecognizer(
        supported_entity="IN_BANK_ACCOUNT",
        patterns=[Pattern("Bank account number", r"\b\d{9,18}\b", 0.05)],
        context=["a/c", "acct", "ifsc", "bank"],
    )


def build_ifsc_recognizer() -> PatternRecognizer:
    return PatternRecognizer(
        supported_entity="IN_IFSC",
        patterns=[Pattern("IFSC code", r"\b[A-Z]{4}0[A-Z0-9]{6}\b", 0.6)],
        context=["ifsc", "bank", "branch"],
    )


def build_indian_mobile_recognizer() -> PatternRecognizer:
    return PatternRecognizer(
        supported_entity="PHONE_NUMBER",
        patterns=[Pattern("Indian mobile", MOBILE_PATTERN, 0.5)],
        context=["phone", "mobile", "mob", "contact", "call", "whatsapp", "tel"],
    )


def build_indian_recognizers() -> list[PatternRecognizer]:
    return [
        build_upi_recognizer(),
        build_bank_account_recognizer(),
        build_ifsc_recognizer(),
        build_indian_mobile_recognizer(),
    ]
