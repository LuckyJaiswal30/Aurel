export const maxQuestionCharacters = 4000;

const hiddenCharacters =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f­͏؜ᅟᅠ឴឵᠋-᠏​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ\u{e0000}-\u{e007f}]/gu;
const spacedLetters = /\b(?:[A-Za-z][ .\-_*|]){3,}[A-Za-z]\b/g;
const base64Run = /[A-Za-z0-9+/]{16,}={0,2}/g;
const leetspeakLetters: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  $: "s",
  "!": "i",
};

const lookAlikeLetters: Record<string, string> = {
  а: "a",
  в: "b",
  е: "e",
  ё: "e",
  к: "k",
  м: "m",
  н: "h",
  о: "o",
  р: "p",
  с: "c",
  т: "t",
  у: "y",
  х: "x",
  і: "i",
  ї: "i",
  ј: "j",
  ѕ: "s",
  ԁ: "d",
  ɡ: "g",
  ո: "n",
  ս: "u",
  α: "a",
  β: "b",
  ε: "e",
  η: "n",
  ι: "i",
  κ: "k",
  ν: "v",
  ο: "o",
  ρ: "p",
  τ: "t",
  υ: "u",
  χ: "x",
};
const lookAlikePattern = new RegExp(
  `[${Object.keys(lookAlikeLetters).join("")}]`,
  "gu",
);

function foldLookAlikes(text: string) {
  return text.replace(
    lookAlikePattern,
    (letter) => lookAlikeLetters[letter] ?? letter,
  );
}

export type CleanedInput = {
  text: string;
  textsToCheck: string[];
  revealedText: string | null;
};

function joinSpacedLetters(text: string) {
  return text.replace(spacedLetters, (run) => run.replace(/[ .\-_*|]/g, ""));
}

function decodeBase64Runs(text: string) {
  const decoded: string[] = [];
  for (const run of text.match(base64Run) ?? []) {
    try {
      const bytes = Uint8Array.from(atob(run), (character) =>
        character.charCodeAt(0),
      );
      const value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (
        /^[\p{L}\p{N}\p{P}\p{Zs}\n]+$/u.test(value) &&
        /\p{L}{3}/u.test(value)
      )
        decoded.push(value);
    } catch {
      continue;
    }
  }
  return decoded;
}

function undoLeetspeak(text: string) {
  return text.replace(
    /(?<=\p{L})[013457@$!8]|[013457@$!8](?=\p{L})/gu,
    (character) => leetspeakLetters[character] ?? character,
  );
}

export function cleanInput(raw: string): CleanedInput {
  const text = raw
    .normalize("NFKC")
    .replace(hiddenCharacters, "")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxQuestionCharacters);
  const joined = joinSpacedLetters(foldLookAlikes(text.toLowerCase()));
  const decoded = decodeBase64Runs(text).map((value) => value.toLowerCase());
  const revealed = [
    ...(joined !== text.toLowerCase() ? [joined] : []),
    ...decoded,
  ];
  const variants = [
    ...new Set([text.toLowerCase(), joined, undoLeetspeak(joined), ...decoded]),
  ];
  return {
    text,
    textsToCheck: variants,
    revealedText: revealed.length > 0 ? revealed.join("\n") : null,
  };
}
