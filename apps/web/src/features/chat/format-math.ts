const boldHeading = /^\*\*[^*]+\*\*:?\s*$/;
const listItem = /^(\s*)(\d+[.)]|[-*+])\s+/;
const mathFence = /^\s*\$\$/;

const singleLineMath = /^\s*\$\$([\s\S]+?)\$\$(.*)$/;

function readMathBlock(lines: string[], start: number) {
  const first = (lines[start] ?? "").trim();
  const single = singleLineMath.exec(first);
  if (single)
    return {
      body: [(single[1] ?? "").trim()],
      after: (single[2] ?? "").trim(),
      end: start,
    };
  const body = [first.slice(2).trim()].filter(Boolean);
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = (lines[index] ?? "").trim();
    if (line.endsWith("$$")) {
      body.push(line.slice(0, -2).trim());
      return { body: body.filter(Boolean), after: "", end: index };
    }
    body.push(line);
  }
  return { body: [first], after: "", end: start };
}

function findListIndent(output: string[]) {
  for (let index = output.length - 1; index >= 0; index -= 1) {
    const line = output[index] ?? "";
    if (line.trim() === "") continue;
    const match = listItem.exec(line);
    if (match)
      return " ".repeat((match[1] ?? "").length + (match[2] ?? "").length + 1);
    return /^\s{2,}/.test(line) ? (/^\s*/.exec(line)?.[0] ?? "") : "";
  }
  return "";
}

function attachToPreviousLine(output: string[], text: string) {
  for (let index = output.length - 1; index >= 0; index -= 1) {
    if ((output[index] ?? "").trim() === "") continue;
    output[index] = `${output[index]} ${text}`;
    return;
  }
  output.push(text);
}

function pushBlank(output: string[]) {
  if (output.length > 0 && output[output.length - 1] !== "") output.push("");
}

export function formatMathAnswer(markdown: string) {
  const lines = markdown.split("\n");
  const output: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (mathFence.test(line)) {
      const { body, after, end } = readMathBlock(lines, index);
      const indent = findListIndent(output);
      if (after) attachToPreviousLine(output, after);
      pushBlank(output);
      output.push(
        ...["$$", ...body, "$$"].map((part) => `${indent}${part}`),
        "",
      );
      index = end;
      continue;
    }
    if (boldHeading.test(line.trim()) && !listItem.test(line)) {
      pushBlank(output);
      output.push(line.trim(), "");
      continue;
    }
    if (line.trim() === "" && output[output.length - 1] === "") continue;
    output.push(line);
  }
  return output.join("\n").trim();
}
