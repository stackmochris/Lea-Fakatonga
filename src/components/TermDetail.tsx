import type { Direction } from "../preferences";
import type { TermEntry } from "../types";
import { CopyIcon } from "./Icons";
import { NifoStrip } from "./Motifs";

type Props = {
  entry: TermEntry;
  direction: Direction;
  layout: "sheet" | "inline";
  onCopy: () => void;
};

function Block({
  kind,
  entry,
  delay,
}: {
  kind: "en" | "to";
  entry: TermEntry;
  delay: number;
}) {
  if (kind === "en") {
    return (
      <div className="hero-block">
        <p className="hero-label">English</p>
        <p className="hero-en rise" data-term="en" style={{ animationDelay: `${delay}ms` }}>
          {entry.en_term}
        </p>
      </div>
    );
  }
  const missing = entry.to_term.trim() === "";
  return (
    <div className="hero-block">
      <p className="hero-label" lang="to" translate="no">
        Lea Faka-Tonga
      </p>
      {missing ? (
        <p className="hero-missing">
          <span>No Tongan term yet</span>
          <span className="draft-pill">Draft</span>
        </p>
      ) : (
        <p className="hero-to rise" data-term="to" lang="to" translate="no" style={{ animationDelay: `${delay}ms` }}>
          {entry.to_term}
        </p>
      )}
    </div>
  );
}

export default function TermDetail({ entry, direction, layout, onCopy }: Props) {
  const tonganFirst = direction === "to-en";
  const order: Array<"en" | "to"> = tonganFirst ? ["to", "en"] : ["en", "to"];
  const hasExample = Boolean(entry.en_example?.trim() || entry.to_example?.trim());
  const titleId = `detail-${entry.id}`;

  return (
    <article className="detail" aria-labelledby={titleId}>
      <section className="hero">
        {layout === "inline" && (
          <button type="button" className="icon-btn hero-copy" aria-label="Copy term" onClick={onCopy}>
            <CopyIcon />
          </button>
        )}
        <Block kind={order[0]} entry={entry} delay={0} />
        <div className="hero-rule" />
        <Block kind={order[1]} entry={entry} delay={40} />
        <NifoStrip />
      </section>
      <div className="detail-stack">
        {entry.en_definition.trim() && (
          <section className="card">
            <p className="section-label">Definition</p>
            <p>{entry.en_definition}</p>
          </section>
        )}
        {entry.to_definition.trim() ? (
          <section className="card" lang="to" translate="no">
            <p className="section-label" lang="to" translate="no">
              Tala'uhinga
            </p>
            <p>{entry.to_definition}</p>
          </section>
        ) : (
          <p className="missing-line">No Tongan definition yet</p>
        )}
        {hasExample && (
          <section className="card">
            <p className="section-label">Examples</p>
            {entry.en_example?.trim() && <p className="example">{entry.en_example}</p>}
            {entry.to_example?.trim() && (
              <p className="example" lang="to" translate="no">
                {entry.to_example}
              </p>
            )}
          </section>
        )}
        {entry.category.trim() && <p className="chip chip-static">{entry.category}</p>}
        {entry.prefix?.trim() && <p className="prefix">Prefix · {entry.prefix}</p>}
        {entry.image_url?.trim() && (
          <img className="term-image" src={entry.image_url} alt={entry.en_term} />
        )}
        {entry.audio_url?.trim() && (
          <audio controls preload="none" src={entry.audio_url} aria-label="Pronunciation">
            <a href={entry.audio_url}>Play pronunciation</a>
          </audio>
        )}
      </div>
      <p id={titleId} className="sr-only">
        {entry.en_term}
        {entry.to_term.trim() ? `, ${entry.to_term}` : ""}
      </p>
    </article>
  );
}
