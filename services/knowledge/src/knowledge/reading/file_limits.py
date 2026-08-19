import zipfile
from io import BytesIO

import pypdfium2 as pdfium
from PIL import Image

MAX_FILE_BYTES = 25 * 1024 * 1024
MAX_TEXT_BYTES = 5 * 1024 * 1024
MAX_PAGES = 400
MAX_ZIP_ENTRIES = 2000
MAX_UNZIPPED_BYTES = 200 * 1024 * 1024
MAX_COMPRESSION_RATIO = 100
MAX_IMAGE_PIXELS = 40_000_000

ZIPPED_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}
IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}
TEXT_TYPES = {"text/plain", "text/markdown"}


class FileLimitError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def check_pdf(content: bytes) -> None:
    try:
        pdf = pdfium.PdfDocument(BytesIO(content))
    except pdfium.PdfiumError as error:
        raise FileLimitError("This PDF looks damaged. Try saving it again.") from error
    try:
        if len(pdf) > MAX_PAGES:
            raise FileLimitError(f"PDFs can have up to {MAX_PAGES} pages. Split this one up.")
    finally:
        pdf.close()


def check_zipped(content: bytes) -> None:
    try:
        with zipfile.ZipFile(BytesIO(content)) as archive:
            entries = archive.infolist()
    except zipfile.BadZipFile as error:
        raise FileLimitError("This file looks damaged. Try saving it again.") from error
    unzipped = sum(entry.file_size for entry in entries)
    is_bomb = any(
        entry.file_size > MAX_COMPRESSION_RATIO * max(entry.compress_size, 1)
        and entry.file_size > 1024 * 1024
        for entry in entries
    )
    if len(entries) > MAX_ZIP_ENTRIES or unzipped > MAX_UNZIPPED_BYTES or is_bomb:
        raise FileLimitError("This file is too large or complex to read. Split it up.")


def check_image(content: bytes) -> None:
    try:
        with Image.open(BytesIO(content)) as image:
            width, height = image.size
    except (OSError, Image.DecompressionBombError) as error:
        raise FileLimitError("This image couldn't be opened. Try another copy.") from error
    if width * height > MAX_IMAGE_PIXELS:
        raise FileLimitError("This image is too large. Use a smaller photo or screenshot.")


def check_file_limits(mime_type: str, content: bytes) -> None:
    if len(content) > MAX_FILE_BYTES:
        raise FileLimitError("Files can be up to 25 MB.")
    if mime_type == "application/pdf":
        check_pdf(content)
    elif mime_type in ZIPPED_TYPES:
        check_zipped(content)
    elif mime_type in IMAGE_TYPES:
        check_image(content)
    elif mime_type in TEXT_TYPES and len(content) > MAX_TEXT_BYTES:
        raise FileLimitError("Text files can be up to 5 MB.")
