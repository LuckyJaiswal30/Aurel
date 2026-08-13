import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/class-names";
import { Select } from "./select";

type SelectFieldProps = ComponentProps<"select"> & {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
};

export function SelectField({
  label,
  hint,
  error,
  options,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const noteId = `${selectId}-note`;
  const note = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={selectId} className="text-sm font-medium text-text">
        {label}
      </label>
      <Select
        id={selectId}
        options={options}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
        {...props}
      />
      {note ? (
        <p
          id={noteId}
          className={cn("text-sm", error ? "text-danger" : "text-muted")}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}
