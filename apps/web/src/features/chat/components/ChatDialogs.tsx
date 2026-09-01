"use client";

import { usePathname, useRouter } from "next/navigation";
import { FormDialog } from "@/components/ui/form-dialog";
import { TextField } from "@/components/ui/text-field";
import type { ConversationSummary } from "@/lib/db/conversations";
import type { FormState } from "@/lib/forms/form-state";
import { findChatPath } from "@/lib/navigation/chat-path";
import { deleteChat, renameChat } from "../chat-management-actions";
import type { ChatDialogName } from "./ChatOptionsMenu";

type ChatDialogsProps = {
  chat: ConversationSummary;
  openDialog: ChatDialogName | null;
  onClose: () => void;
};

export function ChatDialogs({ chat, openDialog, onClose }: ChatDialogsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dialogProps = (name: ChatDialogName) => ({
    hiddenFields: { conversationId: chat.id },
    isOpen: openDialog === name,
    onOpenChange: (isOpen: boolean) => {
      if (!isOpen) onClose();
    },
  });

  async function deleteAndLeave(previous: FormState, formData: FormData) {
    const result = await deleteChat(previous, formData);
    if (
      result.status === "success" &&
      pathname === findChatPath(chat.subjectId, chat.id)
    )
      router.push(chat.subjectId ? `/subjects/${chat.subjectId}` : "/");
    return result;
  }

  return (
    <>
      <FormDialog
        {...dialogProps("rename")}
        title="Rename chat"
        submitLabel="Save name"
        pendingLabel="Saving…"
        action={renameChat}
        renderFields={(state) => (
          <TextField
            label="Name"
            name="title"
            defaultValue={state.values?.title ?? chat.title}
            maxLength={120}
            required
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
            error={state.fieldErrors?.title?.[0]}
          />
        )}
      />
      <FormDialog
        {...dialogProps("delete")}
        title="Delete this chat?"
        description="Its questions and answers are deleted for good. This can't be undone."
        submitLabel="Delete chat"
        pendingLabel="Deleting…"
        variant="danger"
        action={deleteAndLeave}
      />
    </>
  );
}
