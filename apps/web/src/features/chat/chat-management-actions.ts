"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireStudentId } from "@/lib/auth/current-student";
import { removeConversation, renameConversation } from "@/lib/db/conversations";
import {
  readFormText,
  readFormValues,
  type FormState,
} from "@/lib/forms/form-state";

const conversationIdSchema = z.uuid();
const chatTitleSchema = z
  .string()
  .trim()
  .min(1, "Give the chat a name.")
  .max(120, "Keep the name under 120 characters.");

export async function renameChat(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStudentId();
  const values = readFormValues(formData, ["title"]);
  const conversationId = conversationIdSchema.safeParse(
    readFormText(formData, "conversationId"),
  );
  const title = chatTitleSchema.safeParse(values.title);
  if (!conversationId.success)
    return { status: "error", message: "That chat doesn't exist.", values };
  if (!title.success)
    return {
      status: "error",
      fieldErrors: { title: [title.error.issues[0]?.message ?? ""] },
      values,
    };
  const result = await renameConversation(conversationId.data, title.data);
  if (!result.isRenamed)
    return {
      status: "error",
      message: "We couldn't rename the chat. Try again.",
      values,
    };
  refresh();
  return { status: "success" };
}

export async function deleteChat(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStudentId();
  const conversationId = conversationIdSchema.safeParse(
    readFormText(formData, "conversationId"),
  );
  if (!conversationId.success)
    return { status: "error", message: "That chat doesn't exist." };
  const result = await removeConversation(conversationId.data);
  if (!result.isRemoved)
    return {
      status: "error",
      message: "We couldn't delete the chat. Try again.",
    };
  refresh();
  return { status: "success" };
}
