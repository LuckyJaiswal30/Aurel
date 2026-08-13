import type { ReactNode } from "react";

type AuthPanelProps = {
  title: string;
  lead?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPanel({ title, lead, children, footer }: AuthPanelProps) {
  return (
    <section className="mx-auto flex w-full max-w-[25rem] flex-col items-center pt-[8vh] text-center">
      <h1 className="font-serif text-3xl text-balance text-text">{title}</h1>
      {lead ? <p className="mt-3 text-lg text-muted">{lead}</p> : null}
      <div className="mt-8 w-full rounded-panel border border-line bg-surface p-6 text-left shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]">
        {children}
      </div>
      {footer ? (
        <div className="mt-6 text-base text-muted">{footer}</div>
      ) : null}
    </section>
  );
}
