import { z } from "zod";

// Groq refuses a reply that breaks a length limit in the JSON schema, so model
// replies are shortened after parsing instead of being limited in the schema.
export function clampedText(maxLength: number) {
  return z.string().overwrite((text) => text.slice(0, maxLength));
}

export function clampedList<Item extends z.ZodType>(
  item: Item,
  maxItems: number,
) {
  return z.array(item).overwrite((items) => items.slice(0, maxItems));
}
