from knowledge.search.merge_rankings import merge_rankings


def test_items_found_by_several_queries_rank_first() -> None:
    merged = merge_rankings([["a", "b", "c"], ["c", "d"], ["c", "a"]], keep=3)
    assert merged[0] == "c"
    assert merged[1] == "a"
    assert len(merged) == 3


def test_empty_rankings_give_nothing() -> None:
    assert merge_rankings([[], []], keep=5) == []
