from functools import lru_cache
from threading import Lock

import torch
from sentence_transformers import CrossEncoder, SentenceTransformer

EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-0.6B"
RERANKER_MODEL = "Qwen/Qwen3-Reranker-0.6B"
MODEL_LOCK = Lock()


def pick_device() -> str:
    return "mps" if torch.backends.mps.is_available() else "cpu"


@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    return SentenceTransformer(EMBEDDING_MODEL, device=pick_device())


@lru_cache(maxsize=1)
def get_reranker() -> CrossEncoder:
    reranker: CrossEncoder = CrossEncoder(RERANKER_MODEL, device=pick_device())
    return reranker


def embed_documents(texts: list[str]) -> list[list[float]]:
    with MODEL_LOCK:
        vectors = get_embedder().encode_document(texts, batch_size=8, normalize_embeddings=True)
    return [[float(value) for value in vector] for vector in vectors]


def embed_queries(texts: list[str]) -> list[list[float]]:
    with MODEL_LOCK:
        vectors = get_embedder().encode_query(texts, normalize_embeddings=True)
    return [[float(value) for value in vector] for vector in vectors]


def rerank(query: str, documents: list[str], top_k: int) -> list[tuple[int, float]]:
    with MODEL_LOCK:
        rankings = get_reranker().rank(query, documents, top_k=top_k, batch_size=8)
    return [(int(entry["corpus_id"]), float(entry["score"])) for entry in rankings]


def warm_search_models() -> None:
    with MODEL_LOCK:
        get_embedder()
        get_reranker()
