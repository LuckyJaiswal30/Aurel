from knowledge.reading.preview import preview_text


def test_text_preview_is_limited_to_the_first_characters() -> None:
    preview = preview_text(("Gradient descent. " * 400).encode())
    assert preview.page_count == 1
    assert len(preview.sample_text) == 3000
