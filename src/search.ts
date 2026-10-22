import type { TermEntry } from "./types";

/** Case, macron, and apostrophe-insensitive match key. Display strings are untouched. */
export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0027\u0060\u00B4\u02BB\u02BC\u2018\u2019\u2032]/g, "")
    .toLowerCase();
}

export function matchesQuery(entry: TermEntry, query: string): boolean {
  const needle = fold(query.trim());
  if (!needle) return true;
  return fold(`${entry.en_term}\n${entry.to_term}`).includes(needle);
}
