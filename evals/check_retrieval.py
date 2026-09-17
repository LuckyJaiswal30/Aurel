import argparse
import json
import re
from pathlib import Path

from knowledge.search.find_relevant_chunks import find_relevant_chunks

SECTION_NUMBER = re.compile(r"Unit (\d+)(?:\.(\d+))?")


def heading_marker(source_section: str) -> str | None:
    match = SECTION_NUMBER.search(source_section)
    if match is None:
        return None
    unit, part = match.groups()
    return f"> {unit}.{part} " if part else f"> Unit {unit}:"


def main() -> None:
    parser = argparse.ArgumentParser(description="Check search against the Phase 1 eval questions")
    parser.add_argument("questions", type=Path)
    parser.add_argument("ids", type=Path, help="JSON with studentId and subjects by slug")
    parser.add_argument("--limit", type=int, default=6)
    arguments = parser.parse_args()

    questions = json.loads(arguments.questions.read_text())["questions"]
    ids = json.loads(arguments.ids.read_text())
    ranks: list[int | None] = []
    for question in questions:
        marker = heading_marker(question["source_section"])
        if question["expected_source"] != "notes" or marker is None:
            continue
        results = find_relevant_chunks(
            ids["studentId"],
            ids["subjects"][question["subject"]],
            question["question"],
            [],
            arguments.limit,
        )
        rank = next(
            (
                position
                for position, result in enumerate(results, 1)
                if marker in f"{result.heading} "
            ),
            None,
        )
        ranks.append(rank)
        top = results[0].heading if results else "nothing"
        print(f"{question['id']:7} {question['language']:8} rank={rank} top={top}")

    for cutoff in (1, 3, arguments.limit):
        hits = sum(1 for rank in ranks if rank is not None and rank <= cutoff)
        print(f"found in top {cutoff}: {hits}/{len(ranks)}")


if __name__ == "__main__":
    main()
