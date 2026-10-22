import type { ReactNode } from "react";

export default function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return <>{text}</>;

  const haystack = text.toLowerCase();
  const probe = needle.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let found = haystack.indexOf(probe);
  let key = 0;

  if (found < 0) return <>{text}</>;

  while (found >= 0) {
    if (found > cursor) parts.push(text.slice(cursor, found));
    parts.push(<mark key={key}>{text.slice(found, found + probe.length)}</mark>);
    key += 1;
    cursor = found + probe.length;
    found = haystack.indexOf(probe, cursor);
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
