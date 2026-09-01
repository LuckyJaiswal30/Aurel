"use client";

import { Camera, FolderOpen, Paperclip, Plus } from "lucide-react";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { menuItemClass, menuPanelClass } from "@/components/ui/menu-styles";
import { cn } from "@/lib/class-names";

type AttachMenuProps = {
  subjectId: string;
  isDisabled: boolean;
  onAddNotes: () => void;
};

export function AttachMenu({
  subjectId,
  isDisabled,
  onAddNotes,
}: AttachMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        disabled={isDisabled}
        aria-label="Add to this chat"
        title={isDisabled ? "Open a subject to add notes" : "Add to this chat"}
        className="flex size-8 items-center justify-center rounded-control border border-line text-muted transition-colors hover:bg-hover hover:text-text disabled:opacity-50 data-[state=open]:bg-hover data-[state=open]:text-text"
      >
        <Plus aria-hidden="true" className="size-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          className={cn(menuPanelClass, "w-64")}
        >
          <DropdownMenu.Item className={menuItemClass} onSelect={onAddNotes}>
            <Paperclip aria-hidden="true" className="size-4 text-muted" />
            Add notes from files
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled className={menuItemClass}>
            <Camera aria-hidden="true" className="size-4 text-muted" />
            Photo of a question
            <span className="ml-auto text-xs text-muted">Soon</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-line" />
          <DropdownMenu.Item asChild className={menuItemClass}>
            <Link href={`/subjects/${subjectId}/notes`}>
              <FolderOpen aria-hidden="true" className="size-4 text-muted" />
              Manage notes
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
