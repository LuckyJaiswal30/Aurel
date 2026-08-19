from dataclasses import dataclass

from docling_core.types.doc.document import DoclingDocument
from docling_core.types.doc.items.group import InlineGroup
from docling_core.types.doc.items.node import NodeItem
from docling_core.types.doc.items.text import TextItem


@dataclass
class InlineText:
    text: str
    first_item: TextItem | None
    references: set[str]


def collect_inline_text(node: NodeItem, document: DoclingDocument) -> InlineText:
    descendants = [
        item
        for item, _level in document.iterate_items(root=node, with_groups=True)
        if item.self_ref != node.self_ref
    ]
    text_items = [item for item in descendants if isinstance(item, TextItem)]
    return InlineText(
        text=" ".join(item.text.strip() for item in text_items if item.text.strip()),
        first_item=text_items[0] if text_items else None,
        references={item.self_ref for item in descendants},
    )


def collect_heading_text(heading: TextItem, document: DoclingDocument) -> InlineText:
    for reference in heading.children:
        child = reference.resolve(document)
        if isinstance(child, InlineGroup):
            inline = collect_inline_text(child, document)
            inline.references.add(child.self_ref)
            return inline
    return InlineText(text="", first_item=None, references=set())
