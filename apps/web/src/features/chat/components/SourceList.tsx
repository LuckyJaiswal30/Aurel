import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import type { StoredCitation } from "@/lib/db/conversations";

type SourceListProps = {
  messageId: string;
  subjectId: string | null;
  citations: StoredCitation[];
};

type SourceGroup = {
  label: string;
  detail: string;
  href: string;
  isExternal: boolean;
  numbers: number[];
};

function groupSources(citations: StoredCitation[], subjectId: string | null) {
  const groups = new Map<string, SourceGroup>();
  for (const citation of citations) {
    const isWikipedia = citation.kind === "wikipedia";
    const label = isWikipedia
      ? (citation.heading ?? "Wikipedia")
      : (citation.heading?.split(" > ").at(-1) ?? citation.fileName);
    const key = `${citation.documentId}:${label}:${citation.pageNumber}`;
    const group = groups.get(key);
    if (group) group.numbers.push(citation.number);
    else
      groups.set(key, {
        label,
        detail: isWikipedia
          ? "Wikipedia"
          : `${citation.fileName}, page ${citation.pageNumber}`,
        href:
          isWikipedia && citation.url
            ? citation.url
            : subjectId
              ? `/subjects/${subjectId}/notes`
              : "/subjects",
        isExternal: isWikipedia,
        numbers: [citation.number],
      });
  }
  return [...groups.values()];
}

function SourceRow({
  messageId,
  group,
}: {
  messageId: string;
  group: SourceGroup;
}) {
  const Icon = group.isExternal ? ExternalLink : FileText;
  const content = (
    <>
      <span className="flex shrink-0 gap-1">
        {group.numbers.map((number) => (
          <span
            key={number}
            id={`source-${messageId}-${number}`}
            className="flex size-5 scroll-mt-24 items-center justify-center rounded-full bg-ink/12 text-[0.6875rem] font-medium text-ink"
          >
            {number}
          </span>
        ))}
      </span>
      <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
      <span className="min-w-0 truncate">{group.label}</span>
      <span className="ml-auto shrink-0 text-xs text-muted">
        {group.detail}
      </span>
    </>
  );
  const className =
    "flex items-center gap-2 rounded-control px-2 py-1.5 text-sm text-text hover:bg-hover";
  return group.isExternal ? (
    <a
      href={group.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  ) : (
    <Link href={group.href} className={className}>
      {content}
    </Link>
  );
}

export function SourceList({
  messageId,
  subjectId,
  citations,
}: SourceListProps) {
  if (citations.length === 0) return null;
  const sections = [
    {
      title: "From your notes",
      groups: groupSources(
        citations.filter((item) => item.kind !== "wikipedia"),
        subjectId,
      ),
    },
    {
      title: "From Wikipedia",
      groups: groupSources(
        citations.filter((item) => item.kind === "wikipedia"),
        subjectId,
      ),
    },
  ].filter((section) => section.groups.length > 0);

  return (
    <div className="mt-4 flex flex-col gap-3">
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <h3 className="text-xs font-medium text-muted">{section.title}</h3>
          <ul className="mt-2 flex flex-col gap-1">
            {section.groups.map((group) => (
              <li key={group.numbers.join("-")}>
                <SourceRow messageId={messageId} group={group} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
