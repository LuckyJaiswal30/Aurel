import { FileText } from "lucide-react";
import { cn } from "@/lib/class-names";
import {
  describeExamDate,
  type SubjectSummary,
} from "@/lib/subjects/subject-summary";

type ChatHeaderProps = {
  subject: SubjectSummary | null;
  notesCount: number;
  isContextOpen: boolean;
  contextPanelId: string;
  onToggleContext: () => void;
};

export function ChatHeader({
  subject,
  notesCount,
  isContextOpen,
  contextPanelId,
  onToggleContext,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 -mx-4 flex h-14 items-center justify-between gap-3 bg-canvas px-4 md:-mx-10 md:px-6">
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="truncate text-base font-medium text-text">
          {subject?.name ?? "General chat"}
        </h1>
        <p className="hidden shrink-0 text-xs text-muted sm:block">
          {subject
            ? describeExamDate(subject.examDate, subject.daysUntilExam)
            : "Any subject, answered without your notes"}
        </p>
      </div>
      {subject ? (
        <button
          type="button"
          onClick={onToggleContext}
          aria-expanded={isContextOpen}
          aria-controls={contextPanelId}
          aria-label={`Study context: ${notesCount} ${notesCount === 1 ? "note" : "notes"}`}
          className={cn(
            "flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-line px-2.5 text-sm text-text hover:bg-hover",
            isContextOpen && "bg-hover",
          )}
        >
          <FileText aria-hidden="true" className="size-4 text-muted" />
          <span className="tabular-nums">{notesCount}</span>
        </button>
      ) : null}
    </header>
  );
}
