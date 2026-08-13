"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

type DialogShellProps = {
  trigger?: ReactNode;
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
};

export function DialogShell({
  trigger,
  title,
  description,
  isOpen,
  onOpenChange,
  children,
}: DialogShellProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Dialog.Content
          onOpenAutoFocus={focusFirstField}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-panel border border-line bg-surface p-6 shadow-[0_16px_48px_-16px_rgb(0_0_0/0.3)]"
        >
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="font-serif text-2xl text-text">
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="-m-2 rounded-control p-2 text-muted hover:bg-hover"
              aria-label="Close"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="mt-1 text-sm text-muted">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          <div className="mt-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const DialogClose = Dialog.Close;

function focusFirstField(event: Event) {
  const content = event.currentTarget;
  if (!(content instanceof HTMLElement)) return;
  const field = content.querySelector<HTMLElement>(
    "input:not([type=hidden]), textarea, select",
  );
  if (!field) return;
  event.preventDefault();
  field.focus();
}
