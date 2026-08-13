"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/class-names";
import { useSubjectFilter } from "@/lib/navigation/subject-filter";
import type { SubjectSummary } from "@/lib/subjects/subject-summary";
import { SubjectDialogs, type SubjectDialogName } from "./SubjectDialogs";
import { SubjectOptionsMenu } from "./SubjectOptionsMenu";

type SubjectNavListProps = {
  subjects: SubjectSummary[];
};

type OpenDialog = { subject: SubjectSummary; dialog: SubjectDialogName };

function describeCountdown(daysUntilExam: number | null) {
  if (daysUntilExam === null || daysUntilExam < 0) return null;
  if (daysUntilExam === 0) return "today";
  return `${daysUntilExam}d`;
}

export function SubjectNavList({ subjects }: SubjectNavListProps) {
  const pathname = usePathname();
  const filter = useSubjectFilter();
  const [openDialog, setOpenDialog] = useState<OpenDialog | null>(null);
  const [menuSubjectId, setMenuSubjectId] = useState<string | null>(null);
  const query = filter.trim().toLowerCase();
  const visibleSubjects = query
    ? subjects.filter((subject) => subject.name.toLowerCase().includes(query))
    : subjects;

  return (
    <nav aria-labelledby="subject-nav-heading" className="flex flex-col gap-1">
      <h2 id="subject-nav-heading" className="px-2 text-xs text-muted">
        Your subjects
      </h2>
      {visibleSubjects.length === 0 ? (
        <p className="px-2 py-1 text-xs text-muted">
          {subjects.length === 0
            ? "No subjects yet."
            : "No subject matches that search."}
        </p>
      ) : (
        <ul className="flex flex-col gap-px">
          {visibleSubjects.map((subject) => {
            const href = `/subjects/${subject.id}`;
            const isCurrent =
              pathname === href || pathname.startsWith(`${href}/`);
            const isMenuOpen = menuSubjectId === subject.id;
            const countdown = describeCountdown(subject.daysUntilExam);
            return (
              <li
                key={subject.id}
                className={cn(
                  "group/subject relative flex h-8 items-center rounded-control hover:bg-hover",
                  (isCurrent || isMenuOpen) && "bg-hover",
                )}
              >
                <Link
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className="flex h-full min-w-0 flex-1 items-center rounded-control pr-9 pl-2 text-sm text-text [@media(hover:none)]:pr-16"
                >
                  <span className="truncate">{subject.name}</span>
                </Link>
                {countdown ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute right-2 text-xs text-muted group-focus-within/subject:invisible group-hover/subject:invisible [@media(hover:none)]:visible! [@media(hover:none)]:right-9",
                      isMenuOpen && "invisible",
                    )}
                  >
                    {countdown}
                  </span>
                ) : null}
                <SubjectOptionsMenu
                  subjectName={subject.name}
                  onOpenChange={(isOpen) =>
                    setMenuSubjectId(isOpen ? subject.id : null)
                  }
                  onChoose={(dialog) => setOpenDialog({ subject, dialog })}
                  triggerClassName={cn(
                    "absolute right-0.5 size-7 opacity-0 group-focus-within/subject:opacity-100 group-hover/subject:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
                    isMenuOpen && "opacity-100",
                  )}
                />
              </li>
            );
          })}
        </ul>
      )}
      {openDialog ? (
        <SubjectDialogs
          key={openDialog.subject.id}
          subject={openDialog.subject}
          openDialog={openDialog.dialog}
          onClose={() => setOpenDialog(null)}
        />
      ) : null}
    </nav>
  );
}
