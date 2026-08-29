export type TutorListener = {
  signal?: AbortSignal;
  onNote?: (text: string) => void;
  onReasoning?: (text: string) => void;
  onDraft?: (text: string, isVisible: boolean) => void;
};
