from knowledge.api_model import CamelModel
from knowledge.embedding.search_models import embed_queries, rerank
from knowledge.search.merge_rankings import merge_rankings
from knowledge.store.chunk_store import (
    StoredChunk,
    load_chunks,
    load_sections,
    search_chunk_ids,
)
from knowledge.store.document_store import load_file_names

MATCHES_PER_QUERY = 20
CANDIDATES_TO_RERANK = 15
RERANK_CHARACTERS = 1000


class SearchResult(CamelModel):
    chunk_id: str
    document_id: str
    file_name: str
    page_number: int
    heading: str | None
    content: str
    score: float
    section_id: str
    section_content: str
    section_page_start: int
    section_page_end: int


def text_for_reranking(chunk: StoredChunk) -> str:
    text = f"{chunk.heading}\n\n{chunk.content}" if chunk.heading else chunk.content
    return text[:RERANK_CHARACTERS]


def find_relevant_chunks(
    student_id: str, subject_id: str, question: str, queries: list[str], limit: int
) -> list[SearchResult]:
    search_texts = list(dict.fromkeys([question, *queries]))
    embeddings = embed_queries(search_texts)
    rankings = [
        search_chunk_ids(student_id, subject_id, embedding, text, MATCHES_PER_QUERY)
        for text, embedding in zip(search_texts, embeddings, strict=True)
    ]
    candidate_ids = merge_rankings(rankings, CANDIDATES_TO_RERANK)
    if not candidate_ids:
        return []
    chunks = {chunk.id: chunk for chunk in load_chunks(student_id, candidate_ids)}
    candidates = [chunks[chunk_id] for chunk_id in candidate_ids if chunk_id in chunks]
    ranked = rerank(question, [text_for_reranking(chunk) for chunk in candidates], limit)
    best = [(candidates[index], score) for index, score in ranked]

    sections = {
        section.id: section
        for section in load_sections(student_id, list({chunk.section_id for chunk, _ in best}))
    }
    file_names = load_file_names(student_id, list({chunk.document_id for chunk, _ in best}))
    return [
        SearchResult(
            chunk_id=chunk.id,
            document_id=chunk.document_id,
            file_name=file_names.get(chunk.document_id, ""),
            page_number=chunk.page_number,
            heading=chunk.heading,
            content=chunk.content,
            score=score,
            section_id=chunk.section_id,
            section_content=sections[chunk.section_id].content,
            section_page_start=sections[chunk.section_id].page_start,
            section_page_end=sections[chunk.section_id].page_end,
        )
        for chunk, score in best
        if chunk.section_id in sections
    ]
