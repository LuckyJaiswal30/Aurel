import type { ReactNode } from "react";

type HelpSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function HelpSection({ id, title, children }: HelpSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-8">
      <h2 id={`${id}-heading`} className="font-serif text-2xl text-text">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
