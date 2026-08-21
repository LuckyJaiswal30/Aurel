from functools import lru_cache
from typing import Any, Literal

from pydantic import BaseModel, TypeAdapter
from supabase import Client, ClientOptions, create_client

from knowledge.chunking.chunk_sections import DraftChunk
from knowledge.settings import get_settings

NoteStatus = Literal[
    "uploaded",
    "checking",
    "held_for_confirmation",
    "rejected",
    "reading",
    "indexing",
    "ready",
    "failed",
]

STUDY_FILES_BUCKET = "study-files"
ROWS = TypeAdapter(list[dict[str, Any]])
PAGE_SIZE = 1000


class DocumentRecord(BaseModel):
    id: str
    user_id: str
    subject_id: str
    file_name: str
    storage_path: str
    mime_type: str
    status: NoteStatus


class SectionRecord(BaseModel):
    position: int
    heading_path: list[str]
    content: str
    page_start: int
    page_end: int


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_secret_key.get_secret_value(),
        ClientOptions(auto_refresh_token=False, persist_session=False),
    )


def find_document(document_id: str) -> DocumentRecord | None:
    response = (
        get_supabase()
        .table("documents")
        .select("id, user_id, subject_id, file_name, storage_path, mime_type, status")
        .eq("id", document_id)
        .maybe_single()
        .execute()
    )
    if response is None or response.data is None:
        return None
    return DocumentRecord.model_validate(response.data)


def download_document(document: DocumentRecord) -> bytes:
    return get_supabase().storage.from_(STUDY_FILES_BUCKET).download(document.storage_path)


def set_document_status(
    document_id: str,
    status: NoteStatus,
    detail: str | None = None,
    only_from: NoteStatus | None = None,
) -> None:
    query = (
        get_supabase()
        .table("documents")
        .update({"status": status, "status_detail": detail})
        .eq("id", document_id)
    )
    if only_from is not None:
        query = query.eq("status", only_from)
    query.execute()


def insert_in_batches(table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    saved: list[dict[str, Any]] = []
    for start in range(0, len(rows), 200):
        response = get_supabase().table(table).insert(rows[start : start + 200]).execute()
        saved.extend(ROWS.validate_python(response.data))
    return saved


def save_document_contents(
    document: DocumentRecord,
    sections: list[SectionRecord],
    chunks: list[DraftChunk],
    page_count: int,
) -> None:
    client = get_supabase()
    client.table("document_sections").delete().eq("document_id", document.id).execute()
    saved_sections = insert_in_batches(
        "document_sections",
        [
            {"user_id": document.user_id, "document_id": document.id, **section.model_dump()}
            for section in sections
        ],
    )
    section_ids = {row["position"]: row["id"] for row in saved_sections}
    insert_in_batches(
        "document_chunks",
        [
            {
                "user_id": document.user_id,
                "subject_id": document.subject_id,
                "document_id": document.id,
                "section_id": section_ids[chunk.section_position],
                **chunk.model_dump(exclude={"section_position"}),
            }
            for chunk in chunks
        ],
    )
    client.table("documents").update({"page_count": page_count}).eq("id", document.id).execute()


def load_file_names(student_id: str, document_ids: list[str]) -> dict[str, str]:
    response = (
        get_supabase()
        .table("documents")
        .select("id, file_name")
        .eq("user_id", student_id)
        .in_("id", document_ids)
        .execute()
    )
    return {str(row["id"]): str(row["file_name"]) for row in ROWS.validate_python(response.data)}
