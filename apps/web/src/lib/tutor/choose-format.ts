import type { AnswerFormat } from "./plan-question";

const formatRules: [RegExp, AnswerFormat][] = [
  [/\b(10|ten)[\s-]*marks?\b/i, "exam_10"],
  [/\b(5|five)[\s-]*marks?\b/i, "exam_5"],
  [/\b(2|two)[\s-]*marks?\b/i, "exam_2"],
  [/\b(quiz|test) me\b|\bmcqs?\b/i, "quiz"],
  [
    /\b(sample|practice|example|new|own|original)\s+(question|problem|numerical|exercise|sum)s?\b|\b(make|create|frame|set|give)\s+(me\s+)?(a|an|one)\s+(\w+\s+)?(question|problem|numerical|sum)\b/i,
    "practice",
  ],
  [
    /\b(differen(ce|tiate)|compare|comparison|versus|vs\.?|distinguish|antar|fark|farak)\b|अंतर|फर्क|तुलना/i,
    "compare",
  ],
  [
    /\b(calculate|compute|find the|solve|derive|prove|trace|run .{1,40} on|how many|what is the value)\b|=\s*\d|\d\s*[+\-*/×^]\s*\d/i,
    "steps",
  ],
];

export function chooseFormat(question: string, plannedFormat: AnswerFormat) {
  return (
    formatRules.find(([pattern]) => pattern.test(question))?.[1] ??
    plannedFormat
  );
}
