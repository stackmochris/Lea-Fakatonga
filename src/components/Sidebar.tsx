import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { APP_VERSION } from "../brand";
import { strings } from "../i18n";
import type { Direction } from "../preferences";
import type { Page } from "../route";
import type { ProfessionPack } from "../types";
import { AboutIcon, SettingsIcon } from "./Icons";

type Props = {
  professions: ProfessionPack[];
  slug: string;
  page: Page;
  direction: Direction;
  onSubject: (slug: string) => void;
  onAbout: () => void;
  onSettings: () => void;
};

export default function Sidebar({ professions, slug, page, direction, onSubject, onAbout, onSettings }: Props) {
  const copy = strings(direction);

  function onSubjectKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const index = professions.findIndex((pack) => pack.slug === slug);
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % professions.length;
    else if (event.key === "ArrowUp") next = (index - 1 + professions.length) % professions.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = professions.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    const pack = professions[next];
    onSubject(pack.slug);
    window.setTimeout(() => document.getElementById(`subject-${pack.slug}`)?.focus(), 0);
  }

  return (
    <aside className="sidebar">
      <div className="side-head">
        <p className="side-title" lang="to" translate="no">
          Ngaahi Kaveinga
        </p>
        {direction !== "to-en" && <p className="side-sub">{copy.subjects}</p>}
      </div>
      <div className="subject-nav" role="navigation" aria-label={copy.subjects} onKeyDown={onSubjectKey}>
        {professions.map((pack) => {
          const current = pack.slug === slug;
          return (
            <button
              key={pack.slug}
              type="button"
              id={`subject-${pack.slug}`}
              className="subject-row"
              aria-current={page === "home" && current ? "true" : undefined}
              tabIndex={current ? 0 : -1}
              onClick={() => onSubject(pack.slug)}
            >
              <span className="subject-names">
                <span className="subject-en">{pack.name_en}</span>
                {pack.name_to !== pack.name_en && (
                  <span className="subject-to" lang="to" translate="no">
                    {pack.name_to}
                  </span>
                )}
              </span>
              <span className="subject-count">{pack.entries.length}</span>
            </button>
          );
        })}
      </div>
      <div className="side-links">
        <button type="button" className="side-link" aria-current={page === "settings" ? "page" : undefined} onClick={onSettings}>
          <SettingsIcon />
          <span>{copy.settings}</span>
        </button>
        <button type="button" className="side-link" aria-current={page === "about" ? "page" : undefined} onClick={onAbout}>
          <AboutIcon />
          <span>{copy.about}</span>
        </button>
      </div>
      <p className="side-foot">
        <span className="num">v{APP_VERSION}</span>
      </p>
    </aside>
  );
}
