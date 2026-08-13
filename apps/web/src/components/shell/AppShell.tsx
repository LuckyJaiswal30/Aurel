import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/wordmark";

type AppShellProps = {
  sidebar: ReactNode;
  mobileMenu: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, mobileMenu, children }: AppShellProps) {
  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh shrink-0 border-r border-line bg-sidebar md:block">
        {sidebar}
      </aside>
      <header className="flex h-12 items-center gap-2 px-3 md:hidden">
        {mobileMenu}
        <Wordmark />
      </header>
      <main className="flex min-h-[calc(100dvh-3rem)] min-w-0 flex-1 flex-col px-4 md:min-h-dvh md:px-10">
        {children}
      </main>
    </div>
  );
}
