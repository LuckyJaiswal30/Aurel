import { AurelMark } from "@/components/ui/aurel-mark";
import type { ConversationSummary } from "@/lib/db/conversations";
import type { SubjectSummary } from "@/lib/subjects/subject-summary";
import { ChatListItem } from "./ChatListItem";

type ChatEmptyStateProps = {
  subject: SubjectSummary | null;
  notesCount: number;
  pastChats: ConversationSummary[];
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

function describeIntro(subject: SubjectSummary | null, notesCount: number) {
  if (!subject)
    return "Ask about any subject. Answers come from general knowledge and Wikipedia, not your notes, so they're quicker.";
  return notesCount === 0
    ? "Add notes first so answers can point to the page they came from."
    : "Ask about anything in your notes. Answers show the page they came from.";
}

export function ChatEmptyState({
  subject,
  notesCount,
  pastChats,
}: ChatEmptyStateProps) {
  return (
    <section
      aria-label="Conversation"
      className="flex flex-1 flex-col justify-center py-10"
    >
      <div className="mx-auto max-w-md text-center">
        <AurelMark className="mx-auto size-7" />
        <h2 className="mt-3 font-serif text-2xl text-text">
          {subject ? `Start studying ${subject.name}` : "Ask about anything"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {describeIntro(subject, notesCount)}
        </p>
      </div>
      {pastChats.length > 0 ? (
        <nav aria-labelledby="subject-chats-heading" className="mt-10">
          <h3 id="subject-chats-heading" className="px-2 text-xs text-muted">
            Chats in this subject
          </h3>
          <ul className="mt-1 flex flex-col gap-px">
            {pastChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                size="roomy"
                detail={dateFormat.format(new Date(chat.updatedAt))}
              />
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
