"use client";

import { todayInIndia } from "@/lib/dates/days-until";
import { Plus } from "lucide-react";
import { useActionState, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DialogShell } from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import { idleFormState } from "@/lib/forms/form-state";
import { createSubject } from "../subject-actions";
import { DialogActions } from "@/components/ui/dialog-actions";

type NewSubjectDialogProps = {
  trigger?: ReactNode;
};

export function NewSubjectDialog({ trigger }: NewSubjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createSubject,
    idleFormState,
  );

  return (
    <DialogShell
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="New subject"
      description="Each subject keeps its own notes, chats and revision."
      trigger={
        trigger ?? (
          <Button>
            <Plus aria-hidden="true" />
            New subject
          </Button>
        )
      }
    >
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Name"
          name="name"
          placeholder="DBMS, Physics 2, Engineering Maths"
          maxLength={80}
          defaultValue={state.values?.name}
          required
          autoFocus
          error={state.fieldErrors?.name?.[0]}
        />
        <TextField
          label="Exam date"
          name="examDate"
          type="date"
          min={todayInIndia()}
          max="2100-12-31"
          defaultValue={state.values?.examDate}
          hint="Optional. Revision plans count down to it."
          error={state.fieldErrors?.examDate?.[0]}
        />
        <FormMessage message={state.fieldErrors ? undefined : state.message} />
        <DialogActions
          submitLabel="Create subject"
          pendingLabel="Creating…"
          isPending={isPending}
        />
      </form>
    </DialogShell>
  );
}
