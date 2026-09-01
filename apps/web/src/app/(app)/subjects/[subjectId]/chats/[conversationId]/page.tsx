import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { PagePlaceholder } from "@/components/ui/page-placeholder";
import { ChatWorkspace } from "@/features/chat/components/ChatWorkspace";
import { loadSubjectWithNotes } from "@/features/subjects/load-subject";
import {
  findConversation,
  listConversationMessages,
} from "@/lib/db/conversations";

export default function ConversationPage({
  params,
}: PageProps<"/subjects/[subjectId]/chats/[conversationId]">) {
  return (
    <Suspense fallback={<PagePlaceholder />}>
      <ConversationContent params={params} />
    </Suspense>
  );
}

async function ConversationContent({
  params,
}: Pick<PageProps<"/subjects/[subjectId]/chats/[conversationId]">, "params">) {
  const { conversationId } = await params;
  const parsedId = z.uuid().safeParse(conversationId);
  if (!parsedId.success) notFound();
  const [{ subject, notes }, conversation, messages] = await Promise.all([
    loadSubjectWithNotes(params),
    findConversation(parsedId.data),
    listConversationMessages(parsedId.data),
  ]);
  if (conversation?.subjectId !== subject.id) notFound();
  return (
    <ChatWorkspace
      key={conversation.id}
      subject={subject}
      notes={notes}
      conversationId={conversation.id}
      initialMessages={messages}
      answeringStep={conversation.answeringStep}
    />
  );
}
