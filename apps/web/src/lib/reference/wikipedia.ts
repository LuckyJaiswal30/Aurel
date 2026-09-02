import { z } from "zod";
import { hidePersonalDetails } from "@/lib/guardrails/check-answer";

const userAgent = "Aurel/0.1 (local study tutor)";
const maxIntroCharacters = 2500;

const searchSchema = z.object({
  pages: z.array(
    z.object({ id: z.number(), key: z.string(), title: z.string() }),
  ),
});
const extractsSchema = z.object({
  query: z.object({
    pages: z.array(
      z.object({
        pageid: z.number().optional(),
        title: z.string(),
        extract: z.string().optional(),
      }),
    ),
  }),
});

export type WikipediaArticle = {
  pageId: number;
  title: string;
  url: string;
  text: string;
};

async function fetchJson(url: URL) {
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent, Accept: "application/json" },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Wikipedia returned ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function searchWikipedia(
  query: string,
  limit = 2,
): Promise<WikipediaArticle[]> {
  const searchUrl = new URL(
    "https://en.wikipedia.org/w/rest.php/v1/search/page",
  );
  searchUrl.searchParams.set("q", hidePersonalDetails(query).slice(0, 300));
  searchUrl.searchParams.set("limit", String(limit));
  const found = searchSchema.parse(await fetchJson(searchUrl)).pages;
  if (found.length === 0) return [];

  const extractsUrl = new URL("https://en.wikipedia.org/w/api.php");
  for (const [name, value] of Object.entries({
    action: "query",
    prop: "extracts",
    explaintext: "1",
    exintro: "1",
    redirects: "1",
    format: "json",
    formatversion: "2",
    titles: found.map((page) => page.title).join("|"),
  }))
    extractsUrl.searchParams.set(name, value);
  const extracts = extractsSchema.parse(await fetchJson(extractsUrl)).query
    .pages;

  return found.flatMap((page) => {
    const text = extracts
      .find(
        (extract) => extract.pageid === page.id || extract.title === page.title,
      )
      ?.extract?.trim();
    if (!text) return [];
    return [
      {
        pageId: page.id,
        title: page.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.key)}`,
        text: text.slice(0, maxIntroCharacters),
      },
    ];
  });
}

export async function lookUpWikipedia(topics: string[]) {
  const results = await Promise.all(
    topics
      .slice(0, 2)
      .map((topic) => searchWikipedia(topic, 1).catch(() => [])),
  );
  const seen = new Set<number>();
  return results.flat().filter((article) => {
    if (seen.has(article.pageId)) return false;
    seen.add(article.pageId);
    return true;
  });
}
