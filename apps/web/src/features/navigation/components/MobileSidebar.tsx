"use client";

import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState, type MouseEvent, type ReactNode } from "react";

type MobileSidebarProps = {
  children: ReactNode;
};

export function MobileSidebar({ children }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeAfterNavigation(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("a"))
      setIsOpen(false);
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger
        className="-ml-2 rounded-control p-2 text-text hover:bg-hover"
        aria-label="Open menu"
      >
        <Menu aria-hidden="true" className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          onClick={closeAfterNavigation}
          className="fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] bg-sidebar data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <Dialog.Close
            className="absolute top-2 right-2 flex size-10 items-center justify-center rounded-control text-muted hover:bg-hover"
            aria-label="Close menu"
          >
            <X aria-hidden="true" className="size-5" />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
