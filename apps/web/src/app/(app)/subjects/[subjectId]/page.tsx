import { Suspense } from "react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";
import { ChatWorkspace } from "@/features/chat/components/ChatWorkspace";
import { loadSubjectWithNotes } from "@/features/subjects/load-subject";
import { listSubjectConversations } from "@/lib/db/conversations";

export default function SubjectPage({
  params,
}: PageProps<"/subjects/[subjectId]">) {
  return (
    <Suspense fallback={<PagePlaceholder />}>
      <SubjectContent params={params} />
    </Suspense>
  );
}

async function SubjectContent({
  params,
}: Pick<PageProps<"/subjects/[subjectId]">, "params">) {
  const { subject, notes } = await loadSubjectWithNotes(params);
  const pastChats = await listSubjectConversations(subject.id);
  return (
    <ChatWorkspace subject={subject} notes={notes} pastChats={pastChats} />
  );
}
