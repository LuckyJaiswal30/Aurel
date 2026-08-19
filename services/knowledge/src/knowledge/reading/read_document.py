import logging

from knowledge.chunking.chunk_sections import chunk_sections
from knowledge.privacy.hide_personal_data import hide_personal_data
from knowledge.reading.converter import convert_to_docling
from knowledge.reading.file_limits import FileLimitError
from knowledge.reading.sections import Block, DraftSection, split_into_sections
from knowledge.store.document_store import (
    DocumentRecord,
    SectionRecord,
    download_document,
    save_document_contents,
    set_document_status,
)

logger = logging.getLogger(__name__)


def hide_section_personal_data(section: DraftSection) -> DraftSection:
    return DraftSection(
        heading_path=[hide_personal_data(heading) for heading in section.heading_path],
        blocks=[
            Block(kind=block.kind, text=hide_personal_data(block.text), page=block.page)
            for block in section.blocks
        ],
    )


def to_section_record(position: int, section: DraftSection) -> SectionRecord:
    return SectionRecord(
        position=position,
        heading_path=section.heading_path,
        content=section.text(),
        page_start=section.page_start(),
        page_end=section.page_end(),
    )


def read_document_into_chunks(document: DocumentRecord) -> int:
    try:
        set_document_status(document.id, "reading")
        docling_document = convert_to_docling(document.mime_type, download_document(document))
        sections = [
            hide_section_personal_data(draft) for draft in split_into_sections(docling_document)
        ]
        chunks = chunk_sections(sections)
        if not chunks:
            set_document_status(document.id, "failed", "We couldn't find any text in this file.")
            return 0
        page_count = docling_document.num_pages()  # type: ignore[no-untyped-call]
        save_document_contents(
            document,
            [to_section_record(position, section) for position, section in enumerate(sections)],
            chunks,
            max(page_count, 1),
        )
        set_document_status(document.id, "indexing", only_from="reading")
        return len(chunks)
    except FileLimitError as error:
        set_document_status(document.id, "failed", error.message)
        return 0
    except Exception:
        logger.exception("Reading failed for document %s", document.id)
        set_document_status(document.id, "failed", "We couldn't read this file. Try again.")
        raise
