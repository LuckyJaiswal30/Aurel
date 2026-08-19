from typing import Literal

from docling_core.types.doc.document import DoclingDocument
from docling_core.types.doc.items.code import CodeItem
from docling_core.types.doc.items.group import InlineGroup
from docling_core.types.doc.items.table.table import TableItem
from docling_core.types.doc.items.text import FormulaItem, SectionHeaderItem, TextItem, TitleItem
from docling_core.types.doc.labels import DocItemLabel
from pydantic import BaseModel

from knowledge.reading.inline_text import collect_heading_text, collect_inline_text

MAX_SECTION_CHARACTERS = 6000
MAX_BLOCK_CHARACTERS = 20000
SKIPPED_LABELS = {DocItemLabel.PAGE_HEADER, DocItemLabel.PAGE_FOOTER}

BlockKind = Literal["heading", "text", "table", "formula", "code"]


class Block(BaseModel):
    kind: BlockKind
    text: str
    page: int


class DraftSection(BaseModel):
    heading_path: list[str]
    blocks: list[Block] = []

    def add(self, kind: BlockKind, text: str, page: int) -> None:
        self.blocks.append(Block(kind=kind, text=text[:MAX_BLOCK_CHARACTERS], page=page))

    def size(self) -> int:
        return sum(len(block.text) for block in self.blocks)

    def text(self) -> str:
        return "\n\n".join(block.text for block in self.blocks)

    def page_start(self) -> int:
        return min((block.page for block in self.blocks), default=1)

    def page_end(self) -> int:
        return max((block.page for block in self.blocks), default=1)


def page_of(item: TextItem | TableItem) -> int:
    return item.prov[0].page_no if item.prov else 1


def heading_level(item: SectionHeaderItem | TitleItem) -> int:
    return 0 if isinstance(item, TitleItem) else max(item.level, 1)


def block_kind(item: TextItem) -> BlockKind:
    if isinstance(item, FormulaItem):
        return "formula"
    if isinstance(item, CodeItem):
        return "code"
    return "text"


def split_into_sections(document: DoclingDocument) -> list[DraftSection]:
    sections: list[DraftSection] = []
    headings: list[tuple[int, str]] = []
    current = DraftSection(heading_path=[])

    def start_section() -> None:
        nonlocal current
        if current.blocks:
            sections.append(current)
        current = DraftSection(heading_path=[text for _, text in headings])

    consumed: set[str] = set()
    for item, _depth in document.iterate_items(with_groups=True):
        if item.self_ref in consumed:
            continue
        if isinstance(item, (SectionHeaderItem, TitleItem)):
            inline = collect_heading_text(item, document)
            consumed.update(inline.references)
            text = item.text.strip() or inline.text
            level = heading_level(item)
            headings[:] = [entry for entry in headings if entry[0] < level]
            headings.append((level, text))
            start_section()
            current.add("heading", text, page_of(item))
            continue
        if current.size() > MAX_SECTION_CHARACTERS:
            start_section()
        if isinstance(item, InlineGroup):
            inline = collect_inline_text(item, document)
            consumed.update(inline.references)
            first = inline.first_item
            if first is not None and inline.text and first.label not in SKIPPED_LABELS:
                current.add("text", inline.text, page_of(first))
        elif isinstance(item, TableItem):
            current.add("table", item.export_to_markdown(document), page_of(item))
        elif isinstance(item, TextItem) and item.label not in SKIPPED_LABELS and item.text.strip():
            current.add(block_kind(item), item.text.strip(), page_of(item))
    if current.blocks:
        sections.append(current)
    return sections
