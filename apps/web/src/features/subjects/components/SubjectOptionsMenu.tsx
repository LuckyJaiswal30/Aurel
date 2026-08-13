"use client";

import {
  CalendarDays,
  EllipsisVertical,
  PencilLine,
  Trash2,
} from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useRef } from "react";
import { menuItemClass, menuPanelClass } from "@/components/ui/menu-styles";
import { cn } from "@/lib/class-names";
import type { SubjectDialogName } from "./SubjectDialogs";

type SubjectOptionsMenuProps = {
  subjectName: string;
  onChoose: (dialog: SubjectDialogName) => void;
  onOpenChange?: (isOpen: boolean) => void;
  triggerClassName?: string;
};

export function SubjectOptionsMenu({
  subjectName,
  onChoose,
  onOpenChange,
  triggerClassName,
}: SubjectOptionsMenuProps) {
  const isOpeningDialog = useRef(false);

  function chooseDialog(dialog: SubjectDialogName) {
    isOpeningDialog.current = true;
    onChoose(dialog);
  }

  return (
    <DropdownMenu.Root onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger
        aria-label={`Options for ${subjectName}`}
        className={cn(
          "flex size-9 items-center justify-center rounded-control text-muted hover:bg-hover hover:text-text",
          triggerClassName,
        )}
      >
        <EllipsisVertical aria-hidden="true" className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          onCloseAutoFocus={(event) => {
            if (isOpeningDialog.current) event.preventDefault();
            isOpeningDialog.current = false;
          }}
          align="start"
          sideOffset={6}
          className={cn(menuPanelClass, "w-52")}
        >
          <DropdownMenu.Item
            className={menuItemClass}
            onSelect={() => chooseDialog("rename")}
          >
            <PencilLine aria-hidden="true" className="size-4 text-muted" />
            Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={menuItemClass}
            onSelect={() => chooseDialog("examDate")}
          >
            <CalendarDays aria-hidden="true" className="size-4 text-muted" />
            Exam date
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-line" />
          <DropdownMenu.Item
            className={cn(menuItemClass, "text-danger")}
            onSelect={() => chooseDialog("delete")}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete subject
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
