import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { test } from "vitest";
import { z } from "zod";
import type { AnswerLanguage } from "@/lib/db/profiles";
import { answerQuestion } from "./answer-question";

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      subject: z.string(),
      language: z.enum(["english", "hindi", "hinglish"]),
      question: z.string(),
    }),
  ),
});
const idsSchema = z.object({
  studentId: z.string(),
  subjects: z.record(z.string(), z.string()),
});

const resultsFolder = new URL("../../../../../evals/results/", import.meta.url);

const subjectNames: Record<string, string> = {
  "artificial-intelligence": "Artificial Intelligence",
  "machine-learning": "Machine Learning",
};

test("answers the eval questions", async () => {
  const questions = questionsSchema.parse(
    JSON.parse(
      readFileSync(
        new URL("../../../../../evals/questions.json", import.meta.url),
        "utf8",
      ),
    ),
  ).questions;
  const ids = idsSchema.parse(
    JSON.parse(
      readFileSync(
        process.env.EVAL_IDS ??
          new URL("../../../../../evals/.eval-ids.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  const wanted = (process.env.QUESTION_IDS ?? "").split(",").filter(Boolean);
  const chosen = wanted.length
    ? questions.filter((item) => wanted.includes(item.id))
    : questions;
  const report: string[] = [];
  const answersFile = new URL("answers.json", resultsFolder);
  const answers: Record<string, unknown>[] = existsSync(answersFile)
    ? (JSON.parse(readFileSync(answersFile, "utf8")) as Record<
        string,
        unknown
      >[])
    : [];
  const done = new Set(
    answers.filter((item) => item.kind !== "error").map((item) => item.id),
  );

  for (const item of chosen.filter((question) => !done.has(question.id))) {
    const started = Date.now();
    const answer = await answerQuestion({
      studentId: ids.studentId,
      subjectId: ids.subjects[item.subject] ?? "",
      question: item.question,
      scope: "study",
      context: {
        subjectName: subjectNames[item.subject] ?? item.subject,
        examDate: null,
        profile: {
          displayName: "Asha",
          course: "B.Tech CSE (AI)",
          studyYear: 3,
          preferredLanguage: item.language as AnswerLanguage,
          explanationLevel: "standard",
          avatarPath: null,
        },
      },
    }).catch((error: unknown) => ({
      kind: "clarify" as const,
      message: `error: ${error instanceof Error ? error.message : "unknown"}`,
    }));
    const seconds = Math.round((Date.now() - started) / 1000);
    report.push(
      `## ${item.id} (${seconds}s)\n\n**Q:** ${item.question}\n\n${JSON.stringify(answer.kind === "answer" ? { source: answer.source, format: answer.format, revised: answer.wasRevised, citations: answer.citations.map((c) => `${c.number}: ${c.heading} p${c.pageNumber}`), timings: answer.timings } : answer)}\n\n${answer.kind === "answer" ? answer.markdown : ""}\n`,
    );
    console.log(`${item.id} ${seconds}s ${answer.kind}`);
    const previous = answers.findIndex((saved) => saved.id === item.id);
    if (previous >= 0) answers.splice(previous, 1);
    answers.push({
      id: item.id,
      seconds,
      kind:
        answer.kind === "clarify" && answer.message.startsWith("error:")
          ? "error"
          : answer.kind,
      source: answer.kind === "answer" ? answer.source : null,
      format: answer.kind === "answer" ? answer.format : null,
      citations: answer.kind === "answer" ? answer.citations : [],
      markdown: answer.kind === "answer" ? answer.markdown : answer.message,
      timings: answer.kind === "answer" ? answer.timings : {},
    });
    mkdirSync(resultsFolder, { recursive: true });
    writeFileSync(answersFile, JSON.stringify(answers, null, 2));
    writeFileSync(new URL("answers.md", resultsFolder), report.join("\n---\n"));
  }
});
