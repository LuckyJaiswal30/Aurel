import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/class-names";
import { controlClass } from "./control-styles";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const noteId = `${inputId}-note`;
  const note = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
        className={controlClass}
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
