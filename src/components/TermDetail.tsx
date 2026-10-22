import { useEffect, useRef } from "react";
import type { TermEntry } from "../types";
import Gap from "./Gap";
import { ChevronLeft } from "./Icons";

type Props = {
  entry: TermEntry;
  onBack: () => void;
  onSelectCategory: (category: string) => void;
};

export default function TermDetail({ entry, onBack, onSelectCategory }: Props) {
  const backRef = useRef<HTMLButtonElement>(null);
  const missingTerm = !entry.to_term;
  const missingDef = !entry.to_definition;
  const titleId = `detail-${entry.id}`;

  useEffect(() => {
    if (window.matchMedia("(max-width: 899px)").matches) {
      backRef.current?.focus();
    }
  }, [entry.id]);

  return (
    <article className="detail" aria-labelledby={titleId}>
      <div className="detail-backbar">
        <button ref={backRef} type="button" className="detail-back" onClick={onBack}>
          <ChevronLeft />
          All terms
        </button>
      </div>
      <div className="detail-body">
        <button type="button" className="kicker kicker-btn" onClick={() => onSelectCategory(entry.category)}>
          {entry.category}
        </button>
        <h2 id={titleId} tabIndex={-1} className="detail-en">
          {entry.en_term}
        </h2>
        <p className="detail-to" lang="to" translate="no">
          {entry.to_term || <Gap label="No Tongan term yet" />}
        </p>
        {(missingTerm || missingDef) && <p className="draft-flag">Draft — not yet reviewed</p>}
        {entry.prefix && <p className="prefix">Prefix: {entry.prefix}</p>}
        <div className="detail-rule" aria-hidden="true" />
        <div className="def-grid">
          <section>
            <h3>English</h3>
            {entry.en_definition ? <p lang="en">{entry.en_definition}</p> : null}
          </section>
          <section>
            <h3 lang="to" translate="no">
              Lea Faka-Tonga
            </h3>
            <p lang="to" translate="no">
              {entry.to_definition || <Gap label="No Tongan definition yet" />}
            </p>
          </section>
        </div>
        {(entry.en_example || entry.to_example) && (
          <div className="examples">
            <h3>Example</h3>
            {entry.en_example && <p className="example" lang="en">{entry.en_example}</p>}
            {entry.to_example && (
              <p className="example" lang="to" translate="no">
                {entry.to_example}
              </p>
            )}
          </div>
        )}
        {entry.image_url && (
          <img className="term-image" src={entry.image_url} alt={entry.en_term} />
        )}
        {entry.audio_url ? (
          <div className="audio-block">
            <h3>Pronunciation</h3>
            <audio controls preload="none" src={entry.audio_url}>
              <a href={entry.audio_url}>Play pronunciation</a>
            </audio>
          </div>
        ) : (
          <p className="no-audio">No audio recorded yet</p>
        )}
      </div>
    </article>
  );
}
