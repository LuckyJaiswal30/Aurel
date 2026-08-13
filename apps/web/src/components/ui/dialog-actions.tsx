import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

type DialogActionsProps = {
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  variant?: "primary" | "danger";
};

export function DialogActions({
  submitLabel,
  pendingLabel,
  isPending,
  variant = "primary",
}: DialogActionsProps) {
  return (
    <div className="mt-2 flex justify-end gap-2">
      <DialogClose asChild>
        <Button type="button" variant="ghost">
          Cancel
        </Button>
      </DialogClose>
      <Button type="submit" variant={variant} disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </div>
  );
}
