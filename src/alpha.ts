import type { Direction } from "./preferences";

const FAKAUA = /[\u02BB\u2018\u2019\u0027]/g;

/** First letter of a headword, with Ng as its own letter after the fakauʻa is stripped. */
export function letterOf(label: string): string {
  const stripped = label.normalize("NFD").replace(/\p{M}/gu, "").replace(FAKAUA, "").trim();
  if (!stripped) return "#";
  if (/^ng/i.test(stripped)) return "Ng";
  const ch = stripped[0].toUpperCase();
  return ch;
}

export function letterId(label: string): string {
  return label === "#" ? "letter-other" : `letter-${label}`;
}

const TONGAN = ["A", "E", "F", "H", "I", "K", "L", "M", "N", "Ng", "O", "P", "S", "T", "U", "V"];
const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function rank(letter: string): number {
  if (letter === "#") return 3000;
  if (letter === "Ng") return 78.5;
  const code = letter.charCodeAt(0);
  if (code >= 48 && code <= 57) return 1000 + code;
  if (code >= 65 && code <= 90) return code;
  return 1500 + code;
}

/** Tongan order in TO→EN, A–Z in EN→TO, plus any other letters that actually occur. */
export function scrubberLetters(direction: Direction, present: Iterable<string>): string[] {
  const base = direction === "to-en" ? TONGAN : LATIN;
  const extras = [...new Set(present)].filter((letter) => !base.includes(letter));
  return [...base, ...extras].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
