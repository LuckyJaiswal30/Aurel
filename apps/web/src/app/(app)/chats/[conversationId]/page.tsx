import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { PagePlaceholder } from "@/components/ui/page-placeholder";
import { ChatWorkspace } from "@/features/chat/components/ChatWorkspace";
import {
  findConversation,
  listConversationMessages,
} from "@/lib/db/conversations";

export default function GeneralConversationPage({
  params,
}: PageProps<"/chats/[conversationId]">) {
  return (
    <Suspense fallback={<PagePlaceholder />}>
      <ConversationContent params={params} />
    </Suspense>
  );
}

async function ConversationContent({
  params,
}: Pick<PageProps<"/chats/[conversationId]">, "params">) {
  const { conversationId } = await params;
  const parsedId = z.uuid().safeParse(conversationId);
  if (!parsedId.success) notFound();
  const [conversation, messages] = await Promise.all([
    findConversation(parsedId.data),
    listConversationMessages(parsedId.data),
  ]);
  if (!conversation || conversation.subjectId !== null) notFound();
  return (
    <ChatWorkspace
      key={conversation.id}
      subject={null}
      conversationId={conversation.id}
      initialMessages={messages}
      answeringStep={conversation.answeringStep}
    />
  );
}
