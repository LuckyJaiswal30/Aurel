import zipfile
from io import BytesIO

import pytest
from PIL import Image

from knowledge.reading.file_limits import FileLimitError, check_file_limits

DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def make_zip(files: dict[str, bytes]) -> bytes:
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, data in files.items():
            archive.writestr(name, data)
    return buffer.getvalue()


def test_accepts_a_normal_word_file() -> None:
    check_file_limits(DOCX, make_zip({"word/document.xml": b"<w:document>notes</w:document>"}))


def test_rejects_a_zip_bomb() -> None:
    bomb = make_zip({"word/document.xml": b"0" * (50 * 1024 * 1024)})
    with pytest.raises(FileLimitError):
        check_file_limits(DOCX, bomb)


def test_rejects_a_file_with_too_many_parts() -> None:
    many = make_zip({f"word/media/{index}.xml": b"x" for index in range(2001)})
    with pytest.raises(FileLimitError):
        check_file_limits(DOCX, many)


def test_rejects_a_huge_image() -> None:
    buffer = BytesIO()
    Image.new("1", (8000, 8000)).save(buffer, format="PNG")
    with pytest.raises(FileLimitError):
        check_file_limits("image/png", buffer.getvalue())


def test_rejects_a_damaged_pdf() -> None:
    with pytest.raises(FileLimitError):
        check_file_limits("application/pdf", b"%PDF-1.7 not really a pdf")


def test_rejects_very_large_text() -> None:
    with pytest.raises(FileLimitError):
        check_file_limits("text/plain", b"a" * (5 * 1024 * 1024 + 1))
