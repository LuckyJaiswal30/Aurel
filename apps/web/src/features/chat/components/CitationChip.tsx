import type { StoredCitation } from "@/lib/db/conversations";

type CitationChipProps = {
  messageId: string;
  citation: StoredCitation | undefined;
  number: string;
};

export function CitationChip({
  messageId,
  citation,
  number,
}: CitationChipProps) {
  const label = !citation
    ? `Source ${number}`
    : citation.kind === "wikipedia"
      ? `Wikipedia: ${citation.heading ?? ""}`
      : `${citation.heading?.split(" > ").at(-1) ?? citation.fileName}, page ${citation.pageNumber}`;
  return (
    <a
      href={`#source-${messageId}-${number}`}
      title={label}
      aria-label={`Source ${number}: ${label}`}
      className="mx-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] -translate-y-px items-center justify-center rounded-full bg-ink/12 px-1 align-middle font-sans text-[0.6875rem] font-medium text-ink no-underline hover:bg-ink/20"
    >
      {number}
    </a>
  );
}
