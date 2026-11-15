import { createSlugger } from "./slug";

export interface SearchPage {
  path: string;
  title: string;
  raw: string;
}

export interface SearchEntry {
  page: string;
  pageTitle: string;
  heading: string;
  anchor: string;
  body: string;
}

export interface SearchResult extends SearchEntry {
  snippet: string;
}

const HEADING = /^(#{1,4})\s+(.+?)\s*#*\s*$/;

/** Strip the most common Markdown/HTML noise so the index reads like prose. */
function cleanMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}([-+*]|\d+\.)\s+/gm, "")
    .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build a flat list of searchable sections (one entry per heading). */
export function buildSearchIndex(pages: SearchPage[]): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const page of pages) {
    let heading = page.title;
    let anchor = "";
    let body: string[] = [];
    let inFence = false;
    const nextAnchor = createSlugger();

    const flush = () => {
      const text = cleanMarkdown(body.join("\n"));
      if (text.length > 0) {
        entries.push({
          page: page.path,
          pageTitle: page.title,
          heading,
          anchor,
          body: text,
        });
      }
      body = [];
    };

    for (const line of page.raw.split(/\r?\n/)) {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) {
        body.push(line);
        continue;
      }

      const match = HEADING.exec(line);
      if (match) {
        flush();
        heading = cleanMarkdown(match[2] ?? "");
        anchor = nextAnchor(heading);
        continue;
      }

      body.push(line);
    }

    flush();
  }

  return entries;
}

function makeSnippet(body: string, needle: string): string {
  if (body.length === 0) return "";
  const lower = body.toLowerCase();
  const at = needle ? lower.indexOf(needle) : -1;
  if (at < 0) return body.slice(0, 160) + (body.length > 160 ? "…" : "");
  const start = Math.max(0, at - 60);
  const end = Math.min(body.length, at + needle.length + 130);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${
    end < body.length ? "…" : ""
  }`;
}

/** Rank entries for a query. All words must match somewhere in the section. */
export function searchEntries(
  index: SearchEntry[],
  rawQuery: string,
  limit = 12,
): SearchResult[] {
  const tokens = rawQuery.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const hits: Array<{ entry: SearchEntry; score: number }> = [];

  for (const entry of index) {
    const heading = entry.heading.toLowerCase();
    const title = entry.pageTitle.toLowerCase();
    const body = entry.body.toLowerCase();
    let score = 0;
    let matchesAll = true;

    for (const token of tokens) {
      const inHeading = heading.includes(token);
      const inTitle = title.includes(token);
      const inBody = body.includes(token);
      if (!inHeading && !inTitle && !inBody) {
        matchesAll = false;
        break;
      }
      if (heading === token) score += 120;
      else if (heading.startsWith(token)) score += 60;
      else if (inHeading) score += 40;
      if (title === token) score += 80;
      else if (inTitle) score += 25;
      if (inBody) score += 10;
    }

    if (matchesAll) hits.push({ entry, score });
  }

  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => ({
      ...entry,
      snippet: makeSnippet(entry.body, tokens[0] ?? ""),
    }));
}
