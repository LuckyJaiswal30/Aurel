import re

from pydantic import BaseModel

from knowledge.reading.sections import Block, DraftSection

TARGET_CHUNK_CHARACTERS = 1200
MAX_CHUNK_CHARACTERS = 2400
MAX_STORED_CHARACTERS = 8000
MAX_HEADING_CHARACTERS = 300
SENTENCE_END = re.compile(r"(?<=[.!?।])\s+")


class DraftChunk(BaseModel):
    section_position: int
    position: int = 0
    heading: str | None
    content: str
    page_number: int


def heading_of(section: DraftSection) -> str | None:
    heading = " > ".join(section.heading_path)
    return heading[:MAX_HEADING_CHARACTERS] or None


def split_text(text: str) -> list[str]:
    pieces: list[str] = []
    current = ""
    for sentence in SENTENCE_END.split(text):
        if current and len(current) + len(sentence) + 1 > TARGET_CHUNK_CHARACTERS:
            pieces.append(current)
            current = ""
        current = f"{current} {sentence}".strip()
        while len(current) > MAX_CHUNK_CHARACTERS:
            pieces.append(current[:MAX_CHUNK_CHARACTERS])
            current = current[MAX_CHUNK_CHARACTERS:]
    if current:
        pieces.append(current)
    return pieces


def split_table(table: str) -> list[str]:
    lines = table.splitlines()
    header, rows = lines[:2], lines[2:]
    pieces: list[str] = []
    current = list(header)
    for row in rows:
        if len(current) > len(header) and len("\n".join([*current, row])) > MAX_CHUNK_CHARACTERS:
            pieces.append("\n".join(current))
            current = list(header)
        current.append(row)
    pieces.append("\n".join(current))
    return [piece[:MAX_STORED_CHARACTERS] for piece in pieces]


def split_block(block: Block) -> list[Block]:
    if len(block.text) <= MAX_CHUNK_CHARACTERS:
        return [block]
    if block.kind == "table":
        pieces = split_table(block.text)
    elif block.kind in {"formula", "code"}:
        pieces = [block.text[:MAX_STORED_CHARACTERS]]
    else:
        pieces = split_text(block.text)
    return [Block(kind=block.kind, text=piece, page=block.page) for piece in pieces]


def chunk_section(position: int, section: DraftSection) -> list[DraftChunk]:
    heading = heading_of(section)
    blocks = [
        piece for block in section.blocks if block.kind != "heading" for piece in split_block(block)
    ]
    chunks: list[DraftChunk] = []
    current: list[Block] = []
    size = 0

    def close_chunk() -> None:
        nonlocal size
        if current:
            content = "\n\n".join(block.text for block in current)
            chunks.append(
                DraftChunk(
                    section_position=position,
                    heading=heading,
                    content=content,
                    page_number=current[0].page,
                )
            )
            current.clear()
            size = 0

    for block in blocks:
        if current and size + len(block.text) > MAX_CHUNK_CHARACTERS:
            close_chunk()
        current.append(block)
        size += len(block.text)
        if size >= TARGET_CHUNK_CHARACTERS:
            close_chunk()
    close_chunk()
    return chunks


def chunk_sections(sections: list[DraftSection]) -> list[DraftChunk]:
    chunks = [
        chunk
        for position, section in enumerate(sections)
        for chunk in chunk_section(position, section)
    ]
    for position, chunk in enumerate(chunks):
        chunk.position = position
    return chunks
