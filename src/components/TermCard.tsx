import type { Direction } from "../preferences";
import type { TermEntry } from "../types";
import Gap from "./Gap";
import Highlight from "./Highlight";
import { ChevronRight } from "./Icons";

type Props = {
  entry: TermEntry;
  selected: boolean;
  query: string;
  direction: Direction;
  onSelect: (id: string) => void;
};

function Line({ text, query, missing }: { text: string; query: string; missing?: string }) {
  if (!text) return missing ? <Gap label={missing} /> : null;
  return <Highlight text={text} query={query} />;
}

export default function TermCard({ entry, selected, query, direction, onSelect }: Props) {
  const missingTerm = !entry.to_term;
  const missingDef = !entry.to_definition;
  const tonganFirst = direction === "to-en";
  const blurb = tonganFirst && entry.to_definition ? entry.to_definition : entry.en_definition;

  return (
    <li>
      <button
        type="button"
        id={`term-${entry.id}`}
        className="term-row"
        aria-current={selected ? "true" : undefined}
        onClick={() => onSelect(entry.id)}
      >
        <span className="term-topline">
          <span className="cat-pill">{entry.category}</span>
          {(missingTerm || missingDef) && <span className="draft-pill">Draft</span>}
        </span>
        <span className="term-head" lang={tonganFirst ? "to" : "en"} translate={tonganFirst ? "no" : undefined}>
          <Line
            text={tonganFirst ? entry.to_term : entry.en_term}
            query={query}
            missing={tonganFirst ? "No Tongan term yet" : undefined}
          />
        </span>
        <span className="term-sub" lang={tonganFirst ? "en" : "to"} translate={tonganFirst ? undefined : "no"}>
          <Line
            text={tonganFirst ? entry.en_term : entry.to_term}
            query={query}
            missing={tonganFirst ? undefined : "No Tongan term yet"}
          />
        </span>
        {blurb && (
          <span className="term-def" lang={tonganFirst && entry.to_definition ? "to" : "en"} translate={tonganFirst && entry.to_definition ? "no" : undefined}>
            {blurb}
          </span>
        )}
        <ChevronRight className="icon term-chevron" />
      </button>
    </li>
  );
}
