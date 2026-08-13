import type { ReactNode } from "react";

type SettingsRowProps = {
  label: string;
  description?: string;
  error?: string;
  labelFor?: string;
  children?: ReactNode;
};

export function SettingsRow({
  label,
  description,
  error,
  labelFor,
  children,
}: SettingsRowProps) {
  const Label = labelFor ? "label" : "p";
  const note = error ?? description;
  return (
    <div className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <Label htmlFor={labelFor} className="block text-sm text-text">
          {label}
        </Label>
        {note ? (
          <p
            className={
              error ? "mt-1 text-xs text-danger" : "mt-1 text-xs text-muted"
            }
          >
            {note}
          </p>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}

type SettingsGroupProps = {
  title: string;
  children: ReactNode;
};

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <section className="mb-8 last:mb-0">
      <h3 className="border-b border-line pb-2 text-sm font-medium text-text">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}
