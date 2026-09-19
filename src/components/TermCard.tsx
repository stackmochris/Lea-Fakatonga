import type { TermEntry } from "../types";

function Gap({ label }: { label: string }) {
  return <span className="gap-badge">{label}</span>;
}

export default function TermCard({ entry }: { entry: TermEntry }) {
  const missingTerm = !entry.to_term;
  const missingDef = !entry.to_definition;

  return (
    <article className="term-card">
      <div className="term-card-row">
        <h2>{entry.en_term}</h2>
        <h2 className="to-term">
          {entry.to_term || <Gap label="No Tongan term yet" />}
        </h2>
      </div>
      {entry.prefix && <p className="prefix">Prefix: {entry.prefix}</p>}
      <div className="term-card-row definitions">
        <p>{entry.en_definition}</p>
        <p>
          {entry.to_definition || (
            entry.to_term ? <Gap label="No Tongan definition yet" /> : null
          )}
        </p>
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
      {(missingTerm || missingDef) && (
        <p className="draft-flag">Draft — not yet reviewed</p>
      )}
    </article>
  );
}
