import type { Direction } from "./preferences";
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

/** 0 = headword match, 1 = other language only, 2 = no match. */
export function searchRank(entry: TermEntry, needle: string, direction: Direction): number {
  if (!needle) return 0;
  const head = fold(direction === "to-en" ? entry.to_term : entry.en_term);
  const other = fold(direction === "to-en" ? entry.en_term : entry.to_term);
  if (head.includes(needle)) return 0;
  if (other.includes(needle)) return 1;
  return 2;
}

export function sortLabel(entry: TermEntry, direction: Direction): string {
  if (direction === "to-en") return entry.to_term || entry.en_term;
  return entry.en_term || entry.to_term;
}
