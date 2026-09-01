export type ChatOutputKind = "flashcards" | "quiz" | "summary" | "diagram";

export type ChatOutput = {
  id: string;
  kind: ChatOutputKind;
  title: string;
  createdAt: string;
};
