"use client";

import { todayInIndia } from "@/lib/dates/days-until";
import { TextField } from "@/components/ui/text-field";
import {
  changeExamDate,
  deleteSubject,
  renameSubject,
} from "../subject-actions";
import type { SubjectSummary } from "@/lib/subjects/subject-summary";
import { SubjectFormDialog } from "./SubjectFormDialog";

export type SubjectDialogName = "rename" | "examDate" | "delete";

type SubjectDialogsProps = {
  subject: SubjectSummary;
  openDialog: SubjectDialogName | null;
  onClose: () => void;
};

export function SubjectDialogs({
  subject,
  openDialog,
  onClose,
}: SubjectDialogsProps) {
  const dialogProps = (name: SubjectDialogName) => ({
    subjectId: subject.id,
    isOpen: openDialog === name,
    onOpenChange: (isOpen: boolean) => {
      if (!isOpen) onClose();
    },
  });

  return (
    <>
      <SubjectFormDialog
        {...dialogProps("rename")}
        title="Rename subject"
        submitLabel="Save name"
        pendingLabel="Saving…"
        action={renameSubject}
        renderFields={(state) => (
          <TextField
            label="Name"
            name="name"
            defaultValue={state.values?.name ?? subject.name}
            maxLength={80}
            required
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
            error={state.fieldErrors?.name?.[0]}
          />
        )}
      />
      <SubjectFormDialog
        {...dialogProps("examDate")}
        title="Exam date"
        description="Leave it empty if you don't know it yet."
        submitLabel="Save date"
        pendingLabel="Saving…"
        action={changeExamDate}
        renderFields={(state) => (
          <TextField
            label="Exam date"
            name="examDate"
            type="date"
            min={todayInIndia()}
            max="2100-12-31"
            defaultValue={state.values?.examDate ?? subject.examDate ?? ""}
            error={state.fieldErrors?.examDate?.[0]}
          />
        )}
      />
      <SubjectFormDialog
        {...dialogProps("delete")}
        title={`Delete ${subject.name}?`}
        description="Its notes, chats and revision are deleted for good. This can't be undone."
        submitLabel="Delete subject"
        pendingLabel="Deleting…"
        variant="danger"
        action={deleteSubject}
      />
    </>
  );
}
