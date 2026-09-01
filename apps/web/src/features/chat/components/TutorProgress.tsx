import { AurelMark } from "@/components/ui/aurel-mark";
import type { ChatStep } from "../ask-tutor";
import { chatStepLabels } from "../chat-progress";
import { ThinkingDots } from "./ThinkingDots";

type TutorProgressProps = {
  step: ChatStep;
};

export function TutorProgress({ step }: TutorProgressProps) {
  return (
    <div role="status" className="flex items-center gap-2.5 text-sm text-muted">
      <AurelMark className="size-5" isThinking />
      <span key={step} className="animate-fade-in">
        {chatStepLabels[step]}
      </span>
      <ThinkingDots />
    </div>
  );
}
