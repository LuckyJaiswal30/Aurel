import { cn } from "@/lib/class-names";

type FormMessageProps = {
  message?: string;
  tone?: "error" | "success";
};

export function FormMessage({ message, tone = "error" }: FormMessageProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "text-sm",
        !message && "sr-only",
        tone === "error" ? "text-danger" : "text-muted",
      )}
    >
      {message}
    </p>
  );
}
