"use client";

import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Suspense, useRef, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/ui/wordmark";
import { cn } from "@/lib/class-names";
import { SubjectFilterContext } from "@/lib/navigation/subject-filter";
import { PrimaryNav } from "./PrimaryNav";

type SidebarProps = {
  subjectList: ReactNode;
  recentChats: ReactNode;
  accountMenu: ReactNode;
  isCollapsible?: boolean;
};

export function Sidebar({
  subjectList,
  recentChats,
  accountMenu,
  isCollapsible = true,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filter, setFilter] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group flex h-full flex-col gap-3 overflow-hidden p-2 transition-[width] duration-300 ease-glide",
        isCollapsed ? "w-14" : isCollapsible ? "w-60" : "w-full",
      )}
    >
      <div
        className={cn(
          "flex h-10 items-center",
          isCollapsed ? "justify-center" : "justify-between pl-2",
        )}
      >
        {isCollapsed ? null : (
          <span className="animate-fade-in whitespace-nowrap">
            <Wordmark />
          </span>
        )}
        {isCollapsible ? (
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            className="rounded-control p-1.5 text-muted hover:bg-hover hover:text-text"
          >
            <ToggleIcon aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      {isCollapsed ? (
        <button
          type="button"
          onClick={() => {
            setIsCollapsed(false);
            requestAnimationFrame(() => searchRef.current?.focus());
          }}
          title="Search subjects"
          aria-label="Search subjects"
          className="mx-auto flex size-8 items-center justify-center rounded-control text-muted hover:bg-hover hover:text-text"
        >
          <Search aria-hidden="true" className="size-4" />
        </button>
      ) : (
        <label className="flex h-8 min-w-56 animate-fade-in items-center gap-2.5 rounded-control border border-line bg-surface px-[calc(0.5rem-1px)] text-sm text-muted focus-within:border-muted/60">
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only">Search subjects</span>
          <input
            ref={searchRef}
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            maxLength={80}
            placeholder="Search subjects"
            className="h-full min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted"
          />
        </label>
      )}

      <nav aria-label="Main">
        <Suspense>
          <PrimaryNav isCollapsed={isCollapsed} />
        </Suspense>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isCollapsed ? null : (
          <div className="flex min-w-56 animate-fade-in flex-col gap-5 pt-2">
            <SubjectFilterContext value={filter}>
              <Suspense>{subjectList}</Suspense>
            </SubjectFilterContext>
            <Suspense>{recentChats}</Suspense>
          </div>
        )}
      </div>

      {accountMenu}
    </div>
  );
}
