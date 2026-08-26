from functools import lru_cache
from threading import Lock

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, PreTrainedTokenizerBase

from knowledge.embedding.search_models import pick_device
from knowledge.settings import get_settings

PROMPT_GUARD_MODEL = "meta-llama/Llama-Prompt-Guard-2-86M"
WINDOW_TOKENS = 512
WINDOW_STRIDE = 384
MALICIOUS_LABEL = 1
BATCH_WINDOWS = 16
GUARD_LOCK = Lock()
LOAD_LOCK = Lock()


def get_prompt_guard() -> tuple[PreTrainedTokenizerBase, torch.nn.Module]:
    with LOAD_LOCK:
        return load_prompt_guard()


@lru_cache(maxsize=1)
def load_prompt_guard() -> tuple[PreTrainedTokenizerBase, torch.nn.Module]:
    token = get_settings().hugging_face_token
    secret = token.get_secret_value() if token else None
    tokenizer = AutoTokenizer.from_pretrained(PROMPT_GUARD_MODEL, token=secret)
    model = AutoModelForSequenceClassification.from_pretrained(PROMPT_GUARD_MODEL, token=secret)
    model.to(pick_device()).eval()
    return tokenizer, model


def split_into_windows(tokenizer: PreTrainedTokenizerBase, text: str) -> list[str]:
    token_ids = list(tokenizer(text, add_special_tokens=False)["input_ids"])
    limit = WINDOW_TOKENS - 2
    if len(token_ids) <= limit:
        return [text]
    windows: list[str] = []
    for start in range(0, len(token_ids), WINDOW_STRIDE):
        decoded = tokenizer.decode(token_ids[start : start + limit])
        windows.append(decoded if isinstance(decoded, str) else " ".join(decoded))
    return windows


def score_prompt_attack(texts: list[str]) -> float:
    tokenizer, model = get_prompt_guard()
    windows = list(
        dict.fromkeys(
            window
            for text in texts
            if text.strip()
            for window in split_into_windows(tokenizer, text)
        )
    )
    if not windows:
        return 0.0
    highest = 0.0
    for start in range(0, len(windows), BATCH_WINDOWS):
        with GUARD_LOCK, torch.no_grad():
            inputs = tokenizer(
                windows[start : start + BATCH_WINDOWS],
                return_tensors="pt",
                truncation=True,
                max_length=WINDOW_TOKENS,
                padding=True,
            ).to(model.device)
            probabilities = torch.softmax(model(**inputs).logits, dim=-1)
        highest = max(highest, float(probabilities[:, MALICIOUS_LABEL].max()))
    return highest
