RANK_OFFSET = 60


def merge_rankings(rankings: list[list[str]], keep: int) -> list[str]:
    scores: dict[str, float] = {}
    for ranking in rankings:
        for rank, item in enumerate(ranking, start=1):
            scores[item] = scores.get(item, 0.0) + 1.0 / (RANK_OFFSET + rank)
    return sorted(scores, key=lambda item: scores[item], reverse=True)[:keep]
