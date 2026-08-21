from pydantic import BaseModel

from knowledge.store.document_store import PAGE_SIZE, ROWS, get_supabase


class StoredChunk(BaseModel):
    id: str
    document_id: str
    section_id: str
    heading: str | None
    content: str
    context_note: str | None
    page_number: int


class StoredSection(BaseModel):
    id: str
    content: str
    page_start: int
    page_end: int


CHUNK_COLUMNS = "id, document_id, section_id, heading, content, context_note, page_number"


def list_document_chunks(document_id: str) -> list[StoredChunk]:
    chunks: list[StoredChunk] = []
    while True:
        response = (
            get_supabase()
            .table("document_chunks")
            .select(CHUNK_COLUMNS)
            .eq("document_id", document_id)
            .order("position")
            .range(len(chunks), len(chunks) + PAGE_SIZE - 1)
            .execute()
        )
        chunks.extend(StoredChunk.model_validate(row) for row in response.data)
        if len(response.data) < PAGE_SIZE:
            return chunks


def save_chunk_embedding(chunk_id: str, embedding: list[float]) -> None:
    get_supabase().table("document_chunks").update({"embedding": str(embedding)}).eq(
        "id", chunk_id
    ).execute()


def search_chunk_ids(
    student_id: str, subject_id: str, embedding: list[float], query_text: str, count: int
) -> list[str]:
    response = (
        get_supabase()
        .rpc(
            "search_chunks",
            {
                "student_id": student_id,
                "subject_id": subject_id,
                "query_embedding": str(embedding),
                "query_text": query_text,
                "match_count": count,
            },
        )
        .execute()
    )
    return [str(row["chunk_id"]) for row in ROWS.validate_python(response.data or [])]


def load_chunks(student_id: str, chunk_ids: list[str]) -> list[StoredChunk]:
    response = (
        get_supabase()
        .table("document_chunks")
        .select(CHUNK_COLUMNS)
        .eq("user_id", student_id)
        .in_("id", chunk_ids)
        .execute()
    )
    return [StoredChunk.model_validate(row) for row in response.data]


def load_sections(student_id: str, section_ids: list[str]) -> list[StoredSection]:
    response = (
        get_supabase()
        .table("document_sections")
        .select("id, content, page_start, page_end")
        .eq("user_id", student_id)
        .in_("id", section_ids)
        .execute()
    )
    return [StoredSection.model_validate(row) for row in response.data]
