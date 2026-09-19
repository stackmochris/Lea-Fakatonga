import type { TermEntry } from "../types";

export default function TermCard({ entry }: { entry: TermEntry }) {
  return (
    <article className="term-card">
      <div className="term-card-row">
        <h2>{entry.en_term}</h2>
        <h2 className="to-term">{entry.to_term}</h2>
      </div>
      {entry.prefix && <p className="prefix">Prefix: {entry.prefix}</p>}
      <div className="term-card-row definitions">
        <p>{entry.en_definition}</p>
        <p>{entry.to_definition}</p>
      </div>
      {(entry.en_example || entry.to_example) && (
        <div className="term-card-row examples">
          <p className="example">{entry.en_example}</p>
          <p className="example">{entry.to_example}</p>
        </div>
      )}
      {entry.audio_url ? (
        <audio controls src={entry.audio_url} />
      ) : (
        <p className="no-audio">No audio recorded yet</p>
      )}
    </article>
  );
}
