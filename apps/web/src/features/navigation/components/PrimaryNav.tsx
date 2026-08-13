"use client";

import {
  CalendarDays,
  Layers,
  Library,
  ListChecks,
  SquarePen,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/class-names";

type NavItem = { label: string; icon: LucideIcon; href?: string };

const navItems: NavItem[] = [
  { label: "New question", icon: SquarePen, href: "/" },
  { label: "Subjects", icon: Library, href: "/subjects" },
  { label: "Flashcards", icon: Layers },
  { label: "Quizzes", icon: ListChecks },
  { label: "Study plan", icon: CalendarDays },
];

type PrimaryNavProps = {
  isCollapsed: boolean;
};

export function PrimaryNav({ isCollapsed }: PrimaryNavProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-px">
      {navItems.map(({ label, icon: Icon, href }) => {
        const content = (
          <>
            <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
            {isCollapsed ? (
              <span className="sr-only">{label}</span>
            ) : (
              <span className="truncate">{label}</span>
            )}
            {!href && !isCollapsed ? (
              <span className="ml-auto text-xs text-muted">Soon</span>
            ) : null}
          </>
        );
        const itemClass = cn(
          "flex h-8 items-center gap-2.5 rounded-control px-2 text-sm text-text",
          isCollapsed && "justify-center",
        );
        return (
          <li key={label}>
            {href ? (
              <Link
                href={href}
                title={isCollapsed ? label : undefined}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  itemClass,
                  "hover:bg-hover",
                  pathname === href && "bg-hover",
                )}
              >
                {content}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                title={`${label} is coming soon`}
                className={cn(itemClass, "opacity-55")}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
