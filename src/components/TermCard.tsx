import type { TermEntry } from "../types";
import Gap from "./Gap";
import Highlight from "./Highlight";
import { ChevronRight } from "./Icons";

type Props = {
  entry: TermEntry;
  selected: boolean;
  query: string;
  onSelect: (id: string) => void;
};

export default function TermCard({ entry, selected, query, onSelect }: Props) {
  const missingTerm = !entry.to_term;
  const missingDef = !entry.to_definition;

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
        <span className="term-en">
          <Highlight text={entry.en_term} query={query} />
        </span>
        <span className="term-to" lang="to" translate="no">
          {entry.to_term ? (
            <Highlight text={entry.to_term} query={query} />
          ) : (
            <Gap label="No Tongan term yet" />
          )}
        </span>
        {entry.en_definition && <span className="term-def">{entry.en_definition}</span>}
        <ChevronRight className="icon term-chevron" />
      </button>
    </li>
  );
}
