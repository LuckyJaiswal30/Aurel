import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import { studyShortcuts } from "@/lib/keyboard/shortcuts";
import { HelpSection } from "./HelpSection";

const startSteps = [
  {
    title: "Add a subject",
    detail:
      "One for each paper you are preparing, with its exam date so revision can count down to it.",
  },
  {
    title: "Upload your notes",
    detail:
      "PDFs, slides, Word files or photos of handwritten pages. Aurel reads them and keeps the page numbers.",
  },
  {
    title: "Ask, practise, revise",
    detail:
      "Ask in your own words. Answers come from your notes and show where they came from.",
  },
];

const tutorAbilities = [
  {
    title: "Answers from your notes",
    detail:
      "Every answer built from your notes points to the file and page, so you can check it.",
  },
  {
    title: "Honest when notes are missing",
    detail:
      "If your notes don't cover something, the tutor says so and labels any general explanation.",
  },
  {
    title: "Teaches before telling",
    detail:
      "For problems and code it gives hints and asks for your attempt before showing a full solution.",
  },
  {
    title: "Exam-style answers",
    detail:
      "Ask for a 2, 5 or 10 mark answer and it follows the length and structure examiners expect.",
  },
  {
    title: "English, Hindi and Hinglish",
    detail:
      "Ask in any of the three. Technical terms stay in English so they match your syllabus.",
  },
  {
    title: "Stays on studying",
    detail:
      "It won't write assignments, apps or essays for you. It helps you plan, understand and review them.",
  },
];

const tips = [
  "Upload the notes your teacher uses. Clear scans and typed PDFs give the best page citations.",
  "Ask one question at a time, and say the marks if you want an exam answer.",
  'Short questions are fine: "normalization kya hai simple me" works.',
  "Tell the tutor what confused you. It adjusts its explanations as it learns how you study.",
];

const comingSoon = [
  {
    title: "Flashcards and quizzes",
    detail:
      "Made from your notes and scheduled for review just before you would forget.",
  },
  {
    title: "Mock tests and past papers",
    detail: "Timed tests, and the topics your past papers ask about most.",
  },
  {
    title: "Knowledge map",
    detail: "Every topic in a subject, coloured by how well you know it.",
  },
  {
    title: "Teach it back and viva practice",
    detail:
      "Explain a topic in your words, or answer spoken viva questions, and get feedback.",
  },
];

export function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-4xl py-8 md:py-12">
      <header className="max-w-3xl">
        <h1 className="font-serif text-3xl text-text md:text-4xl">
          How Aurel works
        </h1>
        <p className="mt-3 text-lg text-muted">
          Aurel is a tutor for your own syllabus. You bring your notes; it
          explains them, checks what you understand and helps you revise before
          the exam.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-14">
        <HelpSection id="get-started" title="Get started">
          <ol className="grid gap-4 md:grid-cols-3">
            {startSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-panel border border-line bg-surface p-5"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-ink/15 text-sm font-medium text-ink">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-medium text-text">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{step.detail}</p>
              </li>
            ))}
          </ol>
        </HelpSection>

        <HelpSection id="tutor" title="What the tutor does">
          <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {tutorAbilities.map((ability) => (
              <div key={ability.title}>
                <dt className="text-base font-medium text-text">
                  {ability.title}
                </dt>
                <dd className="mt-1 text-sm text-muted">{ability.detail}</dd>
              </div>
            ))}
          </dl>
        </HelpSection>

        <HelpSection id="tips" title="Tips for better answers">
          <ul className="flex max-w-3xl flex-col gap-3 font-serif text-base leading-[1.7] text-text">
            {tips.map((tip) => (
              <li key={tip} className="border-l-2 border-line pl-4">
                {tip}
              </li>
            ))}
          </ul>
        </HelpSection>

        <HelpSection id="coming" title="Coming soon">
          <dl className="grid gap-4 md:grid-cols-2">
            {comingSoon.map((feature) => (
              <div
                key={feature.title}
                className="rounded-panel border border-dashed border-line p-5"
              >
                <dt className="text-base font-medium text-text">
                  {feature.title}
                </dt>
                <dd className="mt-1 text-sm text-muted">{feature.detail}</dd>
              </div>
            ))}
          </dl>
        </HelpSection>

        <HelpSection id="privacy" title="Privacy and your data">
          <div className="flex max-w-3xl flex-col gap-3 font-serif text-base leading-[1.7] text-text">
            <p>
              Your notes and chats are visible only to you. Nobody else using
              Aurel can see them.
            </p>
            <p>
              Upload study material only. ID cards, bank papers and other
              personal documents are refused, and phone or ID numbers inside
              notes are hidden before anything is stored for search.
            </p>
            <p>
              Deleting a subject deletes its notes, chats and revision for good.
            </p>
          </div>
        </HelpSection>

        <HelpSection id="shortcuts" title="Keyboard shortcuts">
          <dl className="max-w-xl divide-y divide-line rounded-panel border border-line bg-surface">
            {studyShortcuts.map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
              >
                <dt className="text-text">{shortcut.action}</dt>
                <dd>
                  <ShortcutKeys keys={shortcut.keys} />
                </dd>
              </div>
            ))}
          </dl>
        </HelpSection>

        <HelpSection id="support" title="Get support">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-panel border border-line bg-surface p-5">
              <h3 className="text-base font-medium text-text">
                Something isn&apos;t working
              </h3>
              <p className="mt-1 text-sm text-muted">
                Tell the person who shared Aurel with you what you were doing
                and what you saw.
              </p>
            </div>
            <div className="rounded-panel border border-line bg-surface p-5">
              <h3 className="text-base font-medium text-text">
                Feeling overwhelmed
              </h3>
              <p className="mt-1 text-sm text-muted">
                Exams can be stressful. Tele-MANAS is free and available any
                time:{" "}
                <a
                  href="tel:14416"
                  className="font-medium text-ink underline-offset-4 hover:underline"
                >
                  call 14416
                </a>
                .
              </p>
            </div>
          </div>
        </HelpSection>
      </div>
    </div>
  );
}
