import logging

from knowledge.embedding.search_models import embed_documents
from knowledge.store.chunk_store import StoredChunk, list_document_chunks, save_chunk_embedding
from knowledge.store.document_store import DocumentRecord, set_document_status

logger = logging.getLogger(__name__)
EMBEDDING_BATCH = 16


def text_for_embedding(chunk: StoredChunk) -> str:
    parts = [chunk.heading, chunk.context_note, chunk.content]
    return "\n\n".join(part for part in parts if part)


def embed_document_chunks(document: DocumentRecord) -> int:
    try:
        chunks = list_document_chunks(document.id)
        for start in range(0, len(chunks), EMBEDDING_BATCH):
            batch = chunks[start : start + EMBEDDING_BATCH]
            vectors = embed_documents([text_for_embedding(chunk) for chunk in batch])
            for chunk, vector in zip(batch, vectors, strict=True):
                save_chunk_embedding(chunk.id, vector)
        set_document_status(document.id, "ready", only_from="indexing")
        return len(chunks)
    except Exception:
        logger.exception("Embedding failed for document %s", document.id)
        set_document_status(document.id, "failed", "We couldn't prepare this file for search.")
        raise
