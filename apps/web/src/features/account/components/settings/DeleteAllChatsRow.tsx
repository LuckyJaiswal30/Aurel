"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/ui/form-dialog";
import { deleteAllChats } from "../../chat-history-actions";
import { SettingsRow } from "./SettingsRow";

export function DeleteAllChatsRow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function deleteEverything() {
    const result = await deleteAllChats();
    if (result.status === "success") {
      setIsDone(true);
      if (pathname.includes("/chats")) router.push("/");
    }
    return result;
  }

  return (
    <SettingsRow
      label="Delete all chats"
      description={
        isDone
          ? "All your chats are deleted."
          : "Removes every chat in every subject and the general chats. Your notes stay."
      }
    >
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete all chats
      </Button>
      <FormDialog
        hiddenFields={{}}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Delete all chats?"
        description="Every question and answer is deleted for good. Your subjects and notes are kept. This can't be undone."
        submitLabel="Delete all chats"
        pendingLabel="Deleting…"
        variant="danger"
        action={deleteEverything}
      />
    </SettingsRow>
  );
}
