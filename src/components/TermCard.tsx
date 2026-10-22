import { strings } from "../i18n";
import type { Direction } from "../preferences";
import type { TermEntry } from "../types";
import Highlight from "./Highlight";

type Props = {
  entry: TermEntry;
  selected: boolean;
  query: string;
  direction: Direction;
  onSelect: (id: string) => void;
  rise: boolean;
  delay: number;
};

export default function TermCard({ entry, selected, query, direction, onSelect, rise, delay }: Props) {
  const copy = strings(direction);
  const draft = entry.to_term.trim() === "";
  const tonganFirst = direction === "to-en";
  const primaryText = tonganFirst ? entry.to_term.trim() || entry.en_term : entry.en_term;
  const secondaryText = tonganFirst ? (entry.to_term.trim() ? entry.en_term : "") : entry.to_term.trim();
  const primaryLang = tonganFirst && entry.to_term.trim() ? "to" : "en";
  const classes = [
    "term-row",
    draft ? "is-draft" : "",
    selected ? "is-selected" : "",
    secondaryText ? "" : "is-single",
    rise ? "rise" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li>
      <button
        type="button"
        id={`term-${entry.id}`}
        className={classes}
        style={rise ? { animationDelay: `${delay}ms` } : undefined}
        aria-current={selected ? "true" : undefined}
        onClick={() => onSelect(entry.id)}
      >
        <span className="term-line">
          <span className="term-primary" lang={primaryLang} translate={primaryLang === "to" ? "no" : undefined}>
            <Highlight text={primaryText} query={query} />
          </span>
          {draft && <span className="draft-label">{copy.draft}</span>}
        </span>
        {secondaryText && (
          <span className="term-secondary" lang={tonganFirst ? "en" : "to"} translate={tonganFirst ? undefined : "no"}>
            <Highlight text={secondaryText} query={query} />
          </span>
        )}
      </button>
    </li>
  );
}
