from knowledge.reading.converter import convert_to_docling
from knowledge.reading.file_limits import check_file_limits
from knowledge.reading.preview import (
    PREVIEW_CHARACTERS,
    PREVIEW_PAGES,
    DocumentPreview,
    preview_pdf,
    preview_text,
)
from knowledge.store.document_store import DocumentRecord

TEXT_TYPES = {"text/plain", "text/markdown"}


def preview_with_docling(mime_type: str, content: bytes) -> DocumentPreview:
    document = convert_to_docling(mime_type, content, last_page=PREVIEW_PAGES)
    page_count = document.num_pages()  # type: ignore[no-untyped-call]
    return DocumentPreview(
        page_count=max(page_count, 1),
        sample_text=document.export_to_text()[:PREVIEW_CHARACTERS],
    )


def preview_document(document: DocumentRecord, content: bytes) -> DocumentPreview:
    check_file_limits(document.mime_type, content)
    if document.mime_type == "application/pdf":
        preview = preview_pdf(content)
        if preview.sample_text.strip():
            return preview
        return preview_with_docling(document.mime_type, content)
    if document.mime_type in TEXT_TYPES:
        return preview_text(content)
    return preview_with_docling(document.mime_type, content)
