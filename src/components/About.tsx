import type { ProfessionPack } from "../types";

type Props = {
  professions: ProfessionPack[];
  onOpenSubject: (slug: string) => void;
};

export default function About({ professions, onOpenSubject }: Props) {
  return (
    <article className="page-pane">
      <div className="page-wrap">
        <h2 id="page-title" tabIndex={-1} className="page-title">
          About
        </h2>
        <p className="page-lead">Lea Fakatonga is a Tongan professional terminology glossary.</p>
        <p>
          Source: <cite>Kolosālio_Lea mo hono ʻUhinga</cite>, compiled by Tēvita O. Kaʻili.
        </p>
        <blockquote className="proverb" lang="to" translate="no">
          <p>ʻOku hangē ʻa e tangata ha fala ʻoku lālanga</p>
        </blockquote>
        <p className="proverb-gloss">Society is like a mat being woven.</p>
        <h3 className="page-subhead">Subjects</h3>
        <ul className="subject-index">
          {professions.map((pack) => (
            <li key={pack.slug}>
              <button type="button" className="subject-link" onClick={() => onOpenSubject(pack.slug)}>
                <span className="subject-names">
                  <span className="subject-en">{pack.name_en}</span>
                  <span className="subject-to" lang="to" translate="no">
                    {pack.name_to}
                  </span>
                </span>
                <span className="subject-count">{pack.entries.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
