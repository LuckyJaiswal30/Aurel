import sys
from functools import lru_cache
from io import BytesIO

from docling.datamodel.base_models import DocumentStream, InputFormat
from docling.datamodel.pipeline_options import (
    OcrAutoOptions,
    OcrMacOptions,
    OcrOptions,
    PdfPipelineOptions,
)
from docling.document_converter import DocumentConverter, ImageFormatOption, PdfFormatOption
from docling_core.types.doc.document import DoclingDocument

from knowledge.reading.file_limits import MAX_FILE_BYTES, MAX_PAGES, check_file_limits

FILE_NAMES = {
    "application/pdf": "notes.pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "notes.docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "notes.pptx",
    "image/png": "notes.png",
    "image/jpeg": "notes.jpg",
    "image/webp": "notes.webp",
    "text/markdown": "notes.md",
    "text/plain": "notes.md",
}


def choose_ocr_options() -> OcrOptions:
    if sys.platform == "darwin":
        return OcrMacOptions(lang=["en-US", "hi-IN"])
    return OcrAutoOptions()


@lru_cache(maxsize=1)
def get_converter() -> DocumentConverter:
    pipeline_options = PdfPipelineOptions(
        do_ocr=True,
        do_table_structure=True,
        ocr_options=choose_ocr_options(),
        document_timeout=600,
    )
    return DocumentConverter(
        allowed_formats=[
            InputFormat.PDF,
            InputFormat.DOCX,
            InputFormat.PPTX,
            InputFormat.IMAGE,
            InputFormat.MD,
        ],
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options),
            InputFormat.IMAGE: ImageFormatOption(pipeline_options=pipeline_options),
        },
    )


def convert_to_docling(
    mime_type: str, content: bytes, last_page: int | None = None
) -> DoclingDocument:
    check_file_limits(mime_type, content)
    file_name = FILE_NAMES[mime_type]
    stream = DocumentStream(name=file_name, stream=BytesIO(content))
    converter = get_converter()
    if last_page is None:
        return converter.convert(
            stream, max_num_pages=MAX_PAGES, max_file_size=MAX_FILE_BYTES
        ).document
    return converter.convert(
        stream,
        max_num_pages=MAX_PAGES,
        max_file_size=MAX_FILE_BYTES,
        page_range=(1, last_page),
    ).document
