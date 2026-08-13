"use server";

import { refresh } from "next/cache";
import { requireStudentId } from "@/lib/auth/current-student";
import { removeAllConversations } from "@/lib/db/conversations";
import type { FormState } from "@/lib/forms/form-state";

export async function deleteAllChats(): Promise<FormState> {
  const studentId = await requireStudentId();
  const result = await removeAllConversations(studentId);
  if (!result.isRemoved)
    return {
      status: "error",
      message: "We couldn't delete your chats. Try again.",
    };
  refresh();
  return { status: "success", message: "All chats deleted." };
}
