import { strings } from "../i18n";
import type { Direction } from "../preferences";
import type { TermEntry } from "../types";
import { CopyIcon } from "./Icons";
import { ManuluaMark, NifoStrip } from "./Motifs";

type Props = {
  entry: TermEntry;
  direction: Direction;
  onCopy: () => void;
};

function Block({
  kind,
  entry,
  delay,
  direction,
  heading,
  titleId,
}: {
  kind: "en" | "to";
  entry: TermEntry;
  delay: number;
  direction: Direction;
  heading: boolean;
  titleId: string;
}) {
  const copy = strings(direction);
  if (kind === "en") {
    const Tag = heading ? "h1" : "p";
    return (
      <div className="hero-block">
        <p className="hero-label">{copy.english}</p>
        <Tag className="hero-en rise" id={heading ? titleId : undefined} data-term="en" style={{ animationDelay: `${delay}ms` }}>
          {entry.en_term}
        </Tag>
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
          <span>{copy.noTonganTerm}</span>
          <span className="draft-pill">{copy.draft}</span>
        </p>
      ) : heading ? (
        <h1 className="hero-to rise" id={titleId} data-term="to" lang="to" translate="no" style={{ animationDelay: `${delay}ms` }}>
          {entry.to_term}
        </h1>
      ) : (
        <p className="hero-to rise" data-term="to" lang="to" translate="no" style={{ animationDelay: `${delay}ms` }}>
          {entry.to_term}
        </p>
      )}
    </div>
  );
}

function Definition({ kind, entry, direction }: { kind: "en" | "to"; entry: TermEntry; direction: Direction }) {
  const copy = strings(direction);
  if (kind === "en") {
    if (!entry.en_definition.trim()) return null;
    return (
      <section className="card">
        <p className="section-label">{copy.definition}</p>
        <p>{entry.en_definition}</p>
      </section>
    );
  }
  return (
    <section className="card" lang="to" translate="no">
      <p className="section-label" lang="to" translate="no">
        Tala'uhinga
      </p>
      {entry.to_definition.trim() ? <p>{entry.to_definition}</p> : <p className="missing-line">{copy.noTonganDefinition}</p>}
    </section>
  );
}

export default function TermDetail({ entry, direction, onCopy }: Props) {
  const copy = strings(direction);
  const tonganFirst = direction === "to-en";
  const order: Array<"en" | "to"> = tonganFirst ? ["to", "en"] : ["en", "to"];
  const tonganMissing = entry.to_term.trim() === "";
  const headingKind: "en" | "to" = order[0] === "to" && tonganMissing ? "en" : order[0];
  const hasExample = Boolean(entry.en_example?.trim() || entry.to_example?.trim());
  const titleId = `detail-${entry.id}`;

  return (
    <article className="detail" aria-labelledby={titleId}>
      <section className="hero">
        <ManuluaMark className="hero-manulua" decorative />
        <button type="button" className="icon-btn hero-copy" aria-label={copy.copyTerm} onClick={onCopy}>
          <CopyIcon />
        </button>
        <div className="hero-columns">
          <Block kind={order[0]} entry={entry} delay={0} direction={direction} heading={headingKind === order[0]} titleId={titleId} />
          <div className="hero-rule" />
          <Block kind={order[1]} entry={entry} delay={40} direction={direction} heading={headingKind === order[1]} titleId={titleId} />
        </div>
        <NifoStrip />
      </section>
      <div className="detail-stack">
        <div className="def-columns">
          {order.map((kind) => (
            <Definition key={kind} kind={kind} entry={entry} direction={direction} />
          ))}
        </div>
        {hasExample && (
          <section className="card">
            <p className="section-label">{copy.examples}</p>
            {entry.en_example?.trim() && <p className="example">{entry.en_example}</p>}
            {entry.to_example?.trim() && (
              <p className="example" lang="to" translate="no">
                {entry.to_example}
              </p>
            )}
          </section>
        )}
        {entry.category.trim() && <p className="chip chip-static">{entry.category}</p>}
        {entry.prefix?.trim() && (
          <p className="prefix">
            {copy.prefix} · {entry.prefix}
          </p>
        )}
        {entry.image_url?.trim() && <img className="term-image" src={entry.image_url} alt={entry.en_term} />}
        {entry.audio_url?.trim() && (
          <audio controls preload="none" src={entry.audio_url} aria-label={copy.pronunciation}>
            <a href={entry.audio_url}>{copy.playPronunciation}</a>
          </audio>
        )}
      </div>
    </article>
  );
}
