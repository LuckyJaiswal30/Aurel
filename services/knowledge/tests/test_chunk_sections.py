from knowledge.chunking.chunk_sections import (
    MAX_CHUNK_CHARACTERS,
    chunk_sections,
)
from knowledge.reading.sections import DraftSection


def make_section(*blocks: tuple[str, str, int]) -> DraftSection:
    section = DraftSection(heading_path=["Machine Learning", "Unit 3: Linear Regression"])
    for kind, text, page in blocks:
        section.add(kind, text, page)  # type: ignore[arg-type]
    return section


def test_short_section_becomes_one_chunk_with_its_heading() -> None:
    section = make_section(
        ("heading", "Unit 3: Linear Regression", 4),
        ("text", "Linear regression fits a straight line.", 4),
        ("text", "The slope is found by least squares.", 5),
    )
    [chunk] = chunk_sections([section])
    assert chunk.heading == "Machine Learning > Unit 3: Linear Regression"
    assert chunk.content.startswith("Linear regression")
    assert "Unit 3" not in chunk.content
    assert chunk.page_number == 4


def test_heading_only_section_makes_no_chunk() -> None:
    assert chunk_sections([make_section(("heading", "Unit 3", 1))]) == []


def test_long_text_splits_on_sentences_and_keeps_pages() -> None:
    sentence = "Gradient descent takes a small step against the slope of the loss. "
    section = make_section(("text", sentence * 60, 2), ("text", "Next page starts here.", 3))
    chunks = chunk_sections([section])
    assert len(chunks) > 1
    assert all(len(chunk.content) <= MAX_CHUNK_CHARACTERS for chunk in chunks)
    assert all(chunk.content.endswith(".") for chunk in chunks)
    assert chunks[-1].page_number in {2, 3}


def test_formula_is_never_split() -> None:
    formula = "y = " + " + ".join(f"w_{index} x_{index}" for index in range(400))
    [chunk] = chunk_sections([make_section(("formula", formula, 7))])
    assert chunk.content == formula


def test_large_table_splits_by_rows_and_repeats_its_header() -> None:
    header = "| Model | Accuracy |\n| --- | --- |"
    rows = "\n".join(
        f"| model {index} with a long descriptive name | 0.{index:02d} |" for index in range(120)
    )
    chunks = chunk_sections([make_section(("table", f"{header}\n{rows}", 9))])
    assert len(chunks) > 1
    assert all(chunk.content.startswith(header) for chunk in chunks)
    assert sum(chunk.content.count("model ") for chunk in chunks) == 120
