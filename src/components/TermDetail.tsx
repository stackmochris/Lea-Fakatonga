import { useEffect, useRef } from "react";
import type { Direction } from "../preferences";
import type { TermEntry } from "../types";
import Gap from "./Gap";
import { ChevronLeft } from "./Icons";

type Props = {
  entry: TermEntry;
  direction: Direction;
  onBack: () => void;
  onSelectCategory: (category: string) => void;
};

export default function TermDetail({ entry, direction, onBack, onSelectCategory }: Props) {
  const backRef = useRef<HTMLButtonElement>(null);
  const missingTerm = !entry.to_term;
  const missingDef = !entry.to_definition;
  const titleId = `detail-${entry.id}`;
  const tonganFirst = direction === "to-en";
  const english = {
    key: "en",
    heading: "English",
    lang: "en" as const,
    term: entry.en_term,
    definition: entry.en_definition,
    example: entry.en_example,
  };
  const tongan = {
    key: "to",
    heading: "Lea Faka-Tonga",
    lang: "to" as const,
    term: entry.to_term,
    definition: entry.to_definition,
    example: entry.to_example,
    missingTerm: "No Tongan term yet",
    missingDef: "No Tongan definition yet",
  };
  const head = tonganFirst ? tongan : english;
  const sub = tonganFirst ? english : tongan;
  const sections = tonganFirst ? [tongan, english] : [english, tongan];

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
        <h2 id={titleId} tabIndex={-1} className="detail-head" lang={head.lang} translate={head.lang === "to" ? "no" : undefined}>
          {head.term || <Gap label={"missingTerm" in head ? head.missingTerm : "Missing term"} />}
        </h2>
        <p className="detail-sub" lang={sub.lang} translate={sub.lang === "to" ? "no" : undefined}>
          {sub.term || ("missingTerm" in sub ? <Gap label={sub.missingTerm} /> : null)}
        </p>
        {(missingTerm || missingDef) && <p className="draft-flag">Draft — not yet reviewed</p>}
        {entry.prefix && <p className="prefix">Prefix: {entry.prefix}</p>}
        <div className="nifo-band nifo-band-short" aria-hidden="true" />
        <div className="def-grid">
          {sections.map((section) => (
            <section key={section.key}>
              <h3 lang={section.lang === "to" ? "to" : undefined} translate={section.lang === "to" ? "no" : undefined}>
                {section.heading}
              </h3>
              <p lang={section.lang} translate={section.lang === "to" ? "no" : undefined}>
                {section.definition || ("missingDef" in section ? <Gap label={section.missingDef} /> : null)}
              </p>
            </section>
          ))}
        </div>
        {(entry.en_example || entry.to_example) && (
          <div className="examples">
            <h3>Example</h3>
            {sections.map((section) =>
              section.example ? (
                <p
                  key={section.key}
                  className="example"
                  lang={section.lang}
                  translate={section.lang === "to" ? "no" : undefined}
                >
                  {section.example}
                </p>
              ) : null,
            )}
          </div>
        )}
        {entry.image_url && (
          <img className="term-image" src={entry.image_url} alt={head.term || entry.en_term} />
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
