from io import BytesIO

import pypdfium2 as pdfium
from pydantic import BaseModel

PREVIEW_CHARACTERS = 3000
PREVIEW_PAGES = 2


class DocumentPreview(BaseModel):
    page_count: int
    sample_text: str


def preview_pdf(content: bytes) -> DocumentPreview:
    pdf = pdfium.PdfDocument(BytesIO(content))
    try:
        page_count = len(pdf)
        texts: list[str] = []
        for index in range(min(page_count, PREVIEW_PAGES)):
            text_page = pdf[index].get_textpage()
            texts.append(text_page.get_text_range())
            text_page.close()
        return DocumentPreview(
            page_count=page_count, sample_text="\n".join(texts)[:PREVIEW_CHARACTERS]
        )
    finally:
        pdf.close()


def preview_text(content: bytes) -> DocumentPreview:
    text = content.decode("utf-8", errors="replace")
    return DocumentPreview(page_count=1, sample_text=text[:PREVIEW_CHARACTERS])
