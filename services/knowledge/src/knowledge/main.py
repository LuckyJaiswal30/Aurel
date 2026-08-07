from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from threading import Thread
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field

from knowledge.api_model import CamelModel
from knowledge.embedding.embed_document import embed_document_chunks
from knowledge.embedding.search_models import warm_search_models
from knowledge.guard.prompt_guard import get_prompt_guard, score_prompt_attack
from knowledge.reading.file_limits import FileLimitError
from knowledge.reading.preview_document import preview_document
from knowledge.reading.read_document import read_document_into_chunks
from knowledge.search.find_relevant_chunks import SearchResult, find_relevant_chunks
from knowledge.security import require_service_token
from knowledge.settings import get_settings
from knowledge.store.document_store import DocumentRecord, download_document, find_document


class HealthResponse(BaseModel):
    status: str
    service: str


class PreviewResponse(CamelModel):
    page_count: int
    sample_text: str
    rejection: str | None = None


class ChunkCountResponse(CamelModel):
    chunk_count: int


class SearchRequest(CamelModel):
    student_id: str = Field(pattern=r"^[0-9a-f-]{36}$")
    subject_id: str = Field(pattern=r"^[0-9a-f-]{36}$")
    question: str = Field(min_length=1, max_length=4000)
    queries: list[str] = Field(default=[], max_length=4)
    limit: int = Field(default=6, ge=1, le=10)


class PromptAttackRequest(CamelModel):
    texts: list[str] = Field(min_length=1, max_length=8)


class PromptAttackResponse(CamelModel):
    malicious_score: float


class SearchResponse(CamelModel):
    results: list[SearchResult]


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    Thread(target=warm_search_models, daemon=True).start()
    Thread(target=get_prompt_guard, daemon=True).start()
    yield


app = FastAPI(title="Aurel knowledge service", lifespan=lifespan)
ServiceToken = Annotated[None, Depends(require_service_token)]


def get_document(document_id: str, _token: ServiceToken) -> DocumentRecord:
    document = find_document(document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown document")
    return document


KnownDocument = Annotated[DocumentRecord, Depends(get_document)]


@app.get("/health")
def read_health() -> HealthResponse:
    return HealthResponse(status="ok", service=get_settings().service_name)


@app.post("/documents/{document_id}/preview", response_model_by_alias=True)
def preview(document: KnownDocument) -> PreviewResponse:
    try:
        result = preview_document(document, download_document(document))
    except FileLimitError as error:
        return PreviewResponse(page_count=0, sample_text="", rejection=error.message)
    return PreviewResponse(page_count=result.page_count, sample_text=result.sample_text)


@app.post("/documents/{document_id}/read", response_model_by_alias=True)
def read(document: KnownDocument) -> ChunkCountResponse:
    return ChunkCountResponse(chunk_count=read_document_into_chunks(document))


@app.post("/documents/{document_id}/embed", response_model_by_alias=True)
def embed(document: KnownDocument) -> ChunkCountResponse:
    return ChunkCountResponse(chunk_count=embed_document_chunks(document))


@app.post("/search", response_model_by_alias=True)
def search(request: SearchRequest, _token: ServiceToken) -> SearchResponse:
    queries = [query.strip()[:500] for query in request.queries if query.strip()]
    results = find_relevant_chunks(
        request.student_id, request.subject_id, request.question, queries, request.limit
    )
    return SearchResponse(results=results)


@app.post("/guard/prompt-attack", response_model_by_alias=True)
def check_prompt_attack(request: PromptAttackRequest, _token: ServiceToken) -> PromptAttackResponse:
    texts = [text[:8000] for text in request.texts]
    return PromptAttackResponse(malicious_score=score_prompt_attack(texts))
