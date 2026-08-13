"use client";

import type { ComponentProps } from "react";
import { FormDialog } from "@/components/ui/form-dialog";

type SubjectFormDialogProps = Omit<
  ComponentProps<typeof FormDialog>,
  "hiddenFields"
> & { subjectId: string };

export function SubjectFormDialog({
  subjectId,
  ...props
}: SubjectFormDialogProps) {
  return <FormDialog hiddenFields={{ subjectId }} {...props} />;
}
