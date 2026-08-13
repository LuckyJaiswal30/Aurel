"use client";

import { useActionState, type ReactNode } from "react";
import { DialogShell } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormMessage } from "@/components/ui/form-message";
import { idleFormState, type FormState } from "@/lib/forms/form-state";

export type FormDialogAction = (
  previous: FormState,
  formData: FormData,
) => Promise<FormState>;

type FormDialogProps = {
  hiddenFields: Record<string, string>;
  title: string;
  description?: string;
  submitLabel: string;
  pendingLabel: string;
  variant?: "primary" | "danger";
  action: FormDialogAction;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  renderFields?: (state: FormState) => ReactNode;
};

export function FormDialog({
  hiddenFields,
  title,
  description,
  submitLabel,
  pendingLabel,
  variant,
  action,
  isOpen,
  onOpenChange,
  renderFields,
}: FormDialogProps) {
  const [state, formAction, isPending] = useActionState(
    async (previous: FormState, formData: FormData) => {
      const result = await action(previous, formData);
      if (result.status === "success") onOpenChange(false);
      return result;
    },
    idleFormState,
  );

  return (
    <DialogShell
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {renderFields?.(state)}
        <FormMessage message={state.fieldErrors ? undefined : state.message} />
        <DialogActions
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          isPending={isPending}
          variant={variant}
        />
      </form>
    </DialogShell>
  );
}
