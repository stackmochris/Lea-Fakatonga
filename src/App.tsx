import { useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import TermCard from "./components/TermCard";
import TermDetail from "./components/TermDetail";
import { BrandMark, TapaMedallion } from "./components/Tapa";
import { CloseIcon, MoonIcon, SearchIcon, SunIcon } from "./components/Icons";
import { professions } from "./data/professions";
import { fold } from "./search";
import { applyTheme, getStoredTheme, type Theme } from "./theme";

function readHash(): { slug: string; id: string } {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const slash = raw.indexOf("/");
  const slug = decodeURIComponent(slash === -1 ? raw : raw.slice(0, slash));
  const id = slash === -1 ? "" : decodeURIComponent(raw.slice(slash + 1));
  return { slug, id };
}

function initialSlug() {
  const { slug } = readHash();
  return professions.some((pack) => pack.slug === slug) ? slug : (professions[0]?.slug ?? "");
}

function initialSelectedId() {
  const { slug, id } = readHash();
  const pack = professions.find((item) => item.slug === slug);
  if (!pack || !id) return null;
  return pack.entries.some((entry) => entry.id === id) ? id : null;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [professionSlug, setProfessionSlug] = useState(initialSlug);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const listRef = useRef<HTMLElement>(null);
  const historyReady = useRef(false);

  const profession = professions.find((pack) => pack.slug === professionSlug) ?? professions[0];

  const entries = useMemo(() => {
    if (!profession) return [];
    return [...profession.entries].sort((a, b) =>
      a.en_term.localeCompare(b.en_term, "en", { sensitivity: "base" }),
    );
  }, [profession]);

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const entry of profession?.entries ?? []) {
      if (!seen.includes(entry.category)) seen.push(entry.category);
    }
    return seen;
  }, [profession]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of profession?.entries ?? []) {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    }
    return counts;
  }, [profession]);

  const deferredQuery = useDeferredValue(query);
  const indexed = useMemo(
    () => entries.map((entry) => ({ entry, key: fold(`${entry.en_term}\n${entry.to_term}`) })),
    [entries],
  );
  const needle = fold(deferredQuery.trim());
  const filtered = useMemo(
    () =>
      indexed
        .filter(({ entry, key }) => (category === "All" || entry.category === category) && (needle === "" || key.includes(needle)))
        .map(({ entry }) => entry),
    [indexed, category, needle],
  );

  const selected = profession?.entries.find((entry) => entry.id === selectedId) ?? null;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!profession) return;
    const term = profession.entries.find((entry) => entry.id === selectedId);
    document.title = term
      ? `${term.en_term} · ${profession.name_en} · Lea Fakatonga`
      : `${profession.name_en} · Lea Fakatonga`;
  }, [profession, selectedId]);

  useEffect(() => {
    if (!profession) return;
    const next = selectedId
      ? `#/${profession.slug}/${encodeURIComponent(selectedId)}`
      : `#/${profession.slug}`;
    if (!historyReady.current) {
      historyReady.current = true;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
      }
      return;
    }
    if (window.location.hash !== next) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${next}`);
    }
  }, [profession, selectedId]);

  useEffect(() => {
    const onPop = () => {
      const { slug, id } = readHash();
      const pack = professions.find((item) => item.slug === slug);
      if (!pack) return;
      setProfessionSlug(pack.slug);
      setCategory("All");
      setQuery("");
      setSelectedId(id && pack.entries.some((entry) => entry.id === id) ? id : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (event.key === "/" && !typing) {
        event.preventDefault();
        document.getElementById("term-search")?.focus();
      }
      if (event.key === "Escape") {
        if (query) {
          setQuery("");
          return;
        }
        if (selectedId) setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [query, selectedId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [query, category, professionSlug]);

  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`term-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  if (!profession) {
    return <p className="empty">No glossary packs are loaded.</p>;
  }

  function selectProfession(slug: string) {
    setProfessionSlug(slug);
    setCategory("All");
    setQuery("");
    setSelectedId(null);
  }

  function onTabKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const index = professions.findIndex((pack) => pack.slug === profession.slug);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % professions.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + professions.length) % professions.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = professions.length - 1;
    else return;
    event.preventDefault();
    const pack = professions[next];
    selectProfession(pack.slug);
    window.setTimeout(() => document.getElementById(`tab-${pack.slug}`)?.focus(), 0);
  }

  const trimmed = deferredQuery.trim();
  const noun = filtered.length === 1 ? "term" : "terms";
  const resultBits = [`${filtered.length} ${noun}`];
  if (category !== "All") resultBits.push(`in ${category}`);
  if (trimmed) resultBits.push(`for “${trimmed}”`);
  const resultLabel = resultBits.join(" ");

  return (
    <div className={selected ? "app-frame is-detail" : "app-frame"}>
      <a className="skip" href="#glossary-results">
        Skip to terms
      </a>
      <div className="tapa-band" aria-hidden="true" />
      <header className="topbar">
        <div className="brand-row">
          <div className="brand">
            <BrandMark />
            <div>
              <h1 className="brand-name">Lea Fakatonga</h1>
              <p className="brand-tag">Specialist terminology dictionary</p>
            </div>
          </div>
          <button
            type="button"
            className="theme-toggle"
            aria-pressed={theme === "dark"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <form
            className={trimmed ? "search has-query" : "search"}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="sr-only" htmlFor="term-search">
              Search English or Tongan terms
            </label>
            <SearchIcon />
            <input
              id="term-search"
              type="search"
              placeholder="Search English or Tongan"
              value={query}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              onChange={(event) => setQuery(event.target.value)}
            />
            {trimmed ? (
              <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
                <CloseIcon />
              </button>
            ) : (
              <kbd className="search-kbd" aria-hidden="true">
                /
              </kbd>
            )}
          </form>
        </div>
        <div className="tablist" role="tablist" aria-label="Subjects" onKeyDown={onTabKeyDown}>
          {professions.map((pack) => {
            const active = pack.slug === profession.slug;
            return (
              <button
                key={pack.slug}
                type="button"
                className="tab"
                role="tab"
                id={`tab-${pack.slug}`}
                aria-selected={active}
                aria-controls="glossary-results"
                aria-label={`${pack.name_en}. ${pack.name_to}. ${pack.entries.length} terms`}
                tabIndex={active ? 0 : -1}
                onClick={() => selectProfession(pack.slug)}
              >
                <span className="tab-en">
                  {pack.name_en}
                  <span className="tab-count">{pack.entries.length}</span>
                </span>
                <span className="tab-to" lang="to" translate="no">
                  {pack.name_to}
                </span>
              </button>
            );
          })}
        </div>
        <div className="chips" role="group" aria-label="Categories">
          <button
            type="button"
            className="chip"
            aria-pressed={category === "All"}
            onClick={() => setCategory("All")}
          >
            All
            <span className="chip-count">{profession.entries.length}</span>
          </button>
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
              <span className="chip-count">{categoryCounts.get(name) ?? 0}</span>
            </button>
          ))}
        </div>
      </header>
      <div className="tapa-rule" aria-hidden="true" />
      <main className="workspace">
        <section
          ref={listRef}
          id="glossary-results"
          className="list-pane"
          tabIndex={-1}
          aria-label={`${profession.name_en} terms`}
        >
          <div className="list-head">
            <p className="list-subject" lang="to" translate="no">
              {profession.name_to}
            </p>
            <p className="result-meta" aria-live="polite">
              {resultLabel}
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="empty">
              <TapaMedallion />
              <h2>No matching terms</h2>
              <p>
                {trimmed
                  ? `Nothing in ${profession.name_en} matches “${trimmed}”${category !== "All" ? ` in ${category}` : ""}.`
                  : `No terms in ${category}.`}
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="term-list">
              {filtered.map((entry) => (
                <TermCard
                  key={entry.id}
                  entry={entry}
                  selected={entry.id === selected?.id}
                  query={deferredQuery}
                  onSelect={setSelectedId}
                />
              ))}
            </ul>
          )}
        </section>
        <section className="detail-pane" aria-label="Term detail">
          {selected ? (
            <TermDetail
              entry={selected}
              onBack={() => setSelectedId(null)}
              onSelectCategory={(name) => setCategory(name)}
            />
          ) : (
            <div className="overview">
              <TapaMedallion />
              <p className="kicker">Subject</p>
              <h2>{profession.name_en}</h2>
              <p className="overview-to" lang="to" translate="no">
                {profession.name_to}
              </p>
              <p className="overview-help">
                Choose a term on the left. Each entry shows the English and Tongan wording side by side.
              </p>
              <dl className="stats">
                <div>
                  <dd>{profession.entries.length}</dd>
                  <dt>Terms</dt>
                </div>
                <div>
                  <dd>{categories.length}</dd>
                  <dt>Categories</dt>
                </div>
              </dl>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
