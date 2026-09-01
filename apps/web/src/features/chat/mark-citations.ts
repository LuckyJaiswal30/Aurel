const citationMark = /\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g;
const protectedPart = /(```[\s\S]*?```|`[^`\n]*`|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/;

export function markCitations(markdown: string, knownNumbers: number[]) {
  const known = new Set(knownNumbers);
  return markdown
    .split(protectedPart)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part.replace(citationMark, (mark, numbers: string) => {
            const valid = numbers
              .split(",")
              .map((value) => Number(value.trim()))
              .filter((number) => known.has(number));
            return valid.length === 0
              ? mark
              : valid
                  .map((number) => `<cite-ref n="${number}"></cite-ref>`)
                  .join("");
          }),
    )
    .join("");
}
