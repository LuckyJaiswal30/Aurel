import type { AnswerFormat } from "./plan-question";

export const recipeVersion = "v1";

type Recipe = {
  instructions: string;
  examples: { question: string; evidence: string; answer: string }[];
};

const deadlockEvidence = `[1] A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process in the set.
[1] Four conditions must hold together for a deadlock: mutual exclusion, hold and wait, no preemption and circular wait.`;

export const recipes: Record<AnswerFormat, Recipe> = {
  explain: {
    instructions: `Explain the concept clearly for a student revising. Start with a one or two sentence definition in plain words. Then give the key ideas as short paragraphs or bullets, then one small example if the notes give one. If the answer runs past one paragraph, end with a line starting "In short:". Keep it under 250 words.`,
    examples: [
      {
        question: "What is a deadlock?",
        evidence: deadlockEvidence,
        answer: `A **deadlock** is when a group of processes are all stuck: each one holds a resource and waits for a resource that another process in the group is holding [1].

It can only happen when four conditions hold at the same time [1]:
- **Mutual exclusion:** a resource can be used by one process at a time.
- **Hold and wait:** a process keeps what it has while waiting for more.
- **No preemption:** a resource can't be taken away from a process.
- **Circular wait:** the waiting forms a loop.

In short: a deadlock is a circular wait for resources, and breaking any one of the four conditions prevents it.`,
      },
    ],
  },
  steps: {
    instructions: `Solve the problem step by step, formatted like a worked example in a maths textbook. Use the headings **Given**, **Formula**, **Steps** and **Answer**. Under **Given**, list the known values with inline maths like $d = 2 \\times 10^6\\ \\text{m}$. Put the formula on its own line as display maths between $$ and $$. Number the steps; each step is one short sentence saying what you do and why, followed by the working on its own line as display maths (use \\begin{aligned} for several lines of working). Keep units in the maths. Recompute each number before writing it. Under **Answer**, give the result as display maths in a box: $$\\boxed{\\ldots}$$.`,
    examples: [
      {
        question:
          "Find the propagation delay for a 2000 km link when signals travel at 2 × 10^8 m/s.",
        evidence: "[1] Propagation delay = distance / propagation speed.",
        answer: `**Given**
- Distance $d = 2000\\ \\text{km}$
- Propagation speed $s = 2 \\times 10^8\\ \\text{m/s}$

**Formula**
$$t_{\\text{prop}} = \\frac{d}{s}$$ [1]

**Steps**
1. Convert the distance to metres so it matches the speed's units.
$$d = 2000 \\times 1000 = 2 \\times 10^6\\ \\text{m}$$
2. Divide the distance by the speed.
$$t_{\\text{prop}} = \\frac{2 \\times 10^6}{2 \\times 10^8} = 10^{-2}\\ \\text{s}$$
3. Convert to milliseconds so the answer is easy to read.
$$10^{-2}\\ \\text{s} = 10\\ \\text{ms}$$

**Answer**
$$\\boxed{t_{\\text{prop}} = 10\\ \\text{ms}}$$`,
      },
    ],
  },
  exam_2: {
    instructions: `Write a 2-mark exam answer: a precise definition or distinction plus the key points the notes give for this exact question (for example a condition both share). 40 to 70 words, no headings.`,
    examples: [
      {
        question: "Define deadlock. (2 marks)",
        evidence: deadlockEvidence,
        answer: `A **deadlock** is a state in which a set of processes are blocked forever because each holds a resource and waits for a resource held by another process in the set [1]. It occurs only when mutual exclusion, hold and wait, no preemption and circular wait hold together [1].`,
      },
    ],
  },
  exam_5: {
    instructions: `Write a 5-mark exam answer of 150 to 220 words: a one-sentence introduction, four to six points each with a bold heading and one or two sentences, and a one-sentence conclusion. Cover every point the notes section gives for the question (for example causes, effects and fixes) before adding anything from elsewhere. Use a small table only if the question compares things.`,
    examples: [
      {
        question: "Explain the necessary conditions for deadlock. (5 marks)",
        evidence: deadlockEvidence,
        answer: `A deadlock occurs when processes in a set wait forever for resources held by each other [1]. It can arise only when four conditions hold together [1]:

1. **Mutual exclusion:** at least one resource is non-shareable, so only one process can use it at a time.
2. **Hold and wait:** a process holds at least one resource while waiting to acquire more.
3. **No preemption:** resources cannot be forcibly taken from a process; they are released only voluntarily.
4. **Circular wait:** there is a closed chain of processes in which each waits for a resource held by the next.

**Conclusion:** since all four must hold at once, an operating system can prevent deadlock by making sure at least one of them never holds.`,
      },
    ],
  },
  exam_10: {
    instructions: `Write a 10-mark exam answer of 400 to 550 words with these bold sections in order: **Introduction**, **Explanation** (with sub-points), **Example** (worked from the notes), **Advantages and limitations** or **Applications**, **Conclusion**. Every point the notes section makes on the topic (definitions, properties, methods, examples) must appear somewhere; add Wikipedia material only after that. Use a table or a described diagram where the notes support one.`,
    examples: [
      {
        question: "Explain deadlock in detail. (10 marks)",
        evidence: deadlockEvidence,
        answer: `**Introduction**
A deadlock is a state in which a set of processes are permanently blocked, because each holds a resource and waits for a resource held by another process in the set [1].

**Explanation**
Deadlock can arise only when four conditions hold simultaneously [1]:
- **Mutual exclusion:** ...
- **Hold and wait:** ...
- **No preemption:** ...
- **Circular wait:** ...

**Example**
...

**Advantages and limitations of handling methods**
...

**Conclusion**
...`,
      },
    ],
  },
  compare: {
    instructions: `Compare the items in a markdown table with one row per criterion (definition first, then the criteria the notes cover). After the table, write two or three sentences on when to use each. Cite inside table cells.`,
    examples: [
      {
        question: "Difference between primary key and foreign key?",
        evidence: `[1] A primary key uniquely identifies each row of a table and cannot be null.
[1] A foreign key is a column that refers to the primary key of another table and may contain duplicates or nulls.`,
        answer: `| Criterion | Primary key | Foreign key |
| --- | --- | --- |
| Purpose | Uniquely identifies each row [1] | Links to the primary key of another table [1] |
| Nulls | Not allowed [1] | Allowed [1] |
| Duplicates | Not allowed [1] | Allowed [1] |

Use a primary key to identify rows in a table, and a foreign key to connect a row to a row in another table.`,
      },
    ],
  },
  quiz: {
    instructions: `Make a quiz of five multiple-choice questions from the evidence only. Number them, give options a) to d) with exactly one correct option, then a section **Answers** listing each correct option with a one-line reason and its citation. Mix easy and harder questions.`,
    examples: [
      {
        question: "Quiz me on deadlock.",
        evidence: deadlockEvidence,
        answer: `1. Which situation is a deadlock?
   a) A process finishes early
   b) Processes wait forever for resources held by each other
   c) A process uses too much memory
   d) The CPU is idle

...

**Answers**
1. b) Each process waits for a resource held by another in the set [1].
...`,
      },
    ],
  },
  practice: {
    instructions: `Invent one original practice problem on the topic and solve it, formatted like a worked example in a maths textbook. Make it up yourself: never copy a problem or solution from the notes, Wikipedia or anywhere else, and use your own numbers and setting. Use the notes only for the concepts and formulas, citing them like [1]. Use the headings **Question**, **Solution**, **Answer** and **Tip**. Write the question as a quote block (each line starting with > ), with any expression in inline maths. Under **Solution**, number the steps; each step is one short sentence saying what you do and why, followed by the working on its own line as display maths (use \\begin{aligned} for several lines). Under **Answer**, give the result as boxed display maths, $$\\boxed{\\ldots}$$, plus a decimal value when it helps. **Tip** is one common mistake to avoid. Recompute every number before writing it.`,
    examples: [
      {
        question:
          "Make me a practice question on propagation delay and solve it step by step.",
        evidence: "[1] Propagation delay = distance / propagation speed.",
        answer: `**Question**
> A fibre link between two cities is 1,500 km long, and light travels through the fibre at $2 \\times 10^8\\ \\text{m/s}$. How long does a signal take to cross it?

**Solution**
1. Start from the formula for propagation delay [1].
$$t = \\frac{d}{s}$$
2. Convert the distance to metres so the units match the speed.
$$d = 1500 \\times 1000 = 1.5 \\times 10^6\\ \\text{m}$$
3. Substitute and divide.
$$t = \\frac{1.5 \\times 10^6}{2 \\times 10^8} = 7.5 \\times 10^{-3}\\ \\text{s}$$
4. Convert to milliseconds for a readable answer.
$$7.5 \\times 10^{-3}\\ \\text{s} = 7.5\\ \\text{ms}$$

**Answer**
$$\\boxed{t = 7.5\\ \\text{ms}}$$

**Tip**
Convert kilometres to metres before dividing; mixing units gives an answer 1,000 times too small.`,
      },
    ],
  },
};
