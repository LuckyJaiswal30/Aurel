import { after } from "next/server";
import { pickGreetingLine } from "./greeting-lines";
import {
  chooseGreetingMoment,
  type GreetingFacts,
  type GreetingMoment,
} from "./greeting-moment";
import { writeGreeting } from "./write-greeting";

type SavedGreeting = {
  moment: GreetingMoment;
  text: string;
  writtenAt: number;
};

const freshForMilliseconds = 6 * 60 * 60 * 1000;
const waitForModelMilliseconds = 1200;
const savedGreetings = new Map<string, SavedGreeting>();
const studentsBeingGreeted = new Set<string>();

function takeSavedGreeting(studentId: string, moment: GreetingMoment) {
  const saved = savedGreetings.get(studentId);
  if (!saved) return null;
  savedGreetings.delete(studentId);
  const isFresh = Date.now() - saved.writtenAt < freshForMilliseconds;
  return isFresh && saved.moment === moment ? saved.text : null;
}

function prepareNextGreeting(
  studentId: string,
  moment: GreetingMoment,
  facts: GreetingFacts,
) {
  if (studentsBeingGreeted.has(studentId)) return null;
  studentsBeingGreeted.add(studentId);
  return writeGreeting(moment, facts)
    .catch(() => null)
    .then((text) => {
      if (text)
        savedGreetings.set(studentId, { moment, text, writtenAt: Date.now() });
      return text;
    })
    .finally(() => studentsBeingGreeted.delete(studentId));
}

function waitBriefly() {
  return new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), waitForModelMilliseconds),
  );
}

export async function greetStudent(studentId: string, facts: GreetingFacts) {
  const moment = chooseGreetingMoment(facts);
  const saved = takeSavedGreeting(studentId, moment);

  const writing = prepareNextGreeting(studentId, moment, facts);
  if (writing) after(() => writing);
  if (saved) return saved;
  const written = writing ? await Promise.race([writing, waitBriefly()]) : null;
  if (written) savedGreetings.delete(studentId);
  return written ?? pickGreetingLine(moment, facts);
}
