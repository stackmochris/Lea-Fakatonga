import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import About from "./components/About";
import Drawer from "./components/Drawer";
import TermCard from "./components/TermCard";
import TermDetail from "./components/TermDetail";
import Settings from "./components/Settings";
import { FoiHea, ManuluaMark } from "./components/Motifs";
import { CloseIcon, MoonIcon, SearchIcon, SunIcon } from "./components/Icons";
import { professions } from "./data/professions";
import {
  applyDirection,
  applyTextSize,
  applyTheme,
  getStoredDirection,
  getStoredTextSize,
  getStoredThemePreference,
  resolveTheme,
  type Direction,
  type TextSize,
  type ThemePreference,
} from "./preferences";
import { readRoute, routeHash, type Page } from "./route";
import { fold, searchRank, sortLabel } from "./search";

function knownSlug(slug: string) {
  return professions.some((pack) => pack.slug === slug) ? slug : (professions[0]?.slug ?? "");
}

function initialState() {
  const route = readRoute();
  const slug = knownSlug(route.slug);
  const pack = professions.find((item) => item.slug === slug);
  const id = route.page === "home" && route.id && pack?.entries.some((entry) => entry.id === route.id) ? route.id : null;
  return { page: route.page, slug, id };
}

export default function App() {
  const boot = useRef(initialState());
  const [page, setPage] = useState<Page>(boot.current.page);
  const [themePref, setThemePref] = useState<ThemePreference>(getStoredThemePreference);
  const [direction, setDirection] = useState<Direction>(getStoredDirection);
  const [textSize, setTextSize] = useState<TextSize>(getStoredTextSize);
  const [professionSlug, setProfessionSlug] = useState(boot.current.slug);
  const [selectedId, setSelectedId] = useState<string | null>(boot.current.id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const listRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const historyReady = useRef(false);

  const profession = professions.find((pack) => pack.slug === professionSlug) ?? professions[0];
  const resolvedTheme = resolveTheme(themePref);
  const tonganFirst = direction === "to-en";

  const entries = useMemo(() => {
    if (!profession) return [];
    const locale = tonganFirst ? "to" : "en";
    return [...profession.entries].sort((a, b) =>
      sortLabel(a, direction).localeCompare(sortLabel(b, direction), locale, { sensitivity: "base" }),
    );
  }, [profession, direction, tonganFirst]);

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
  const needle = fold(deferredQuery.trim());
  const filtered = useMemo(() => {
    const hits = entries.filter((entry) => {
      const inCategory = category === "All" || entry.category === category;
      return inCategory && searchRank(entry, needle, direction) < 2;
    });
    if (!needle) return hits;
    const locale = tonganFirst ? "to" : "en";
    return hits.sort((a, b) => {
      const rank = searchRank(a, needle, direction) - searchRank(b, needle, direction);
      if (rank !== 0) return rank;
      return sortLabel(a, direction).localeCompare(sortLabel(b, direction), locale, { sensitivity: "base" });
    });
  }, [entries, category, needle, direction, tonganFirst]);

  const selected = profession?.entries.find((entry) => entry.id === selectedId) ?? null;

  useEffect(() => {
    applyTheme(themePref);
    if (themePref !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [themePref]);

  useEffect(() => {
    applyTextSize(textSize);
  }, [textSize]);

  useEffect(() => {
    applyDirection(direction);
  }, [direction]);

  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    if (drawerOpen) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
  }, [drawerOpen]);

  useEffect(() => {
    if (page === "about") {
      document.title = "About · Lea Fakatonga";
      return;
    }
    if (page === "settings") {
      document.title = "Settings · Lea Fakatonga";
      return;
    }
    if (!profession) return;
    const term = profession.entries.find((entry) => entry.id === selectedId);
    const head = term ? sortLabel(term, direction) : profession.name_en;
    document.title = term
      ? `${head} · ${profession.name_en} · Lea Fakatonga`
      : `${profession.name_en} · Lea Fakatonga`;
  }, [page, profession, selectedId, direction]);

  useEffect(() => {
    if (page === "home") return;
    const timer = window.setTimeout(() => document.getElementById("page-title")?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [page]);

  useEffect(() => {
    if (!profession) return;
    const next = routeHash(page, profession.slug, page === "home" ? selectedId : null);
    const url = `${window.location.pathname}${window.location.search}${next}`;
    if (!historyReady.current) {
      historyReady.current = true;
      if (window.location.hash !== next) window.history.replaceState(null, "", url);
      return;
    }
    if (window.location.hash !== next) window.history.pushState(null, "", url);
  }, [page, profession, selectedId]);

  useEffect(() => {
    const onPop = () => {
      const route = readRoute();
      setPage(route.page);
      setDrawerOpen(false);
      if (route.page !== "home") return;
      const pack = professions.find((item) => item.slug === route.slug);
      if (!pack) return;
      setProfessionSlug(pack.slug);
      setCategory("All");
      setQuery("");
      setSelectedId(route.id && pack.entries.some((entry) => entry.id === route.id) ? route.id : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";
      if (event.key === "/" && !typing && page === "home" && !drawerOpen) {
        event.preventDefault();
        document.getElementById("term-search")?.focus();
      }
      if (event.key === "Escape") {
        if (drawerOpen) {
          setDrawerOpen(false);
          return;
        }
        if (query) {
          setQuery("");
          return;
        }
        if (selectedId && page === "home") setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [query, selectedId, drawerOpen, page]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [query, category, professionSlug, direction]);

  useEffect(() => {
    if (!selectedId || page !== "home") return;
    document.getElementById(`term-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [selectedId, page]);

  if (!profession) {
    return <p className="empty">No glossary packs are loaded.</p>;
  }

  function selectProfession(slug: string) {
    setProfessionSlug(slug);
    setCategory("All");
    setQuery("");
    setSelectedId(null);
  }

  function openSubject(slug: string) {
    selectProfession(slug);
    setPage("home");
    setDrawerOpen(false);
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
  const home = page === "home";

  return (
    <>
      <div ref={frameRef} className={home && selected ? "app-frame is-detail" : "app-frame"}>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <div className="nifo-band" aria-hidden="true" />
        <header className="topbar">
          <div className="brand-row">
            <div className="brand">
              <button
                ref={menuRef}
                type="button"
                className="menu-button"
                aria-label="Menu"
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
                aria-controls="app-drawer"
                onClick={() => setDrawerOpen(true)}
              >
                <ManuluaMark />
              </button>
              <div>
                <h1 className="brand-name">Lea Fakatonga</h1>
                <p className="brand-tag">Specialist terminology dictionary</p>
              </div>
            </div>
            <button
              type="button"
              className="theme-toggle"
              aria-pressed={resolvedTheme === "dark"}
              aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setThemePref(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            {home && (
              <div className="search-row">
                <form
                  className={trimmed ? "search has-query" : "search"}
                  role="search"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label className="sr-only" htmlFor="term-search">
                    {tonganFirst ? "Search Tongan or English terms" : "Search English or Tongan terms"}
                  </label>
                  <SearchIcon />
                  <input
                    id="term-search"
                    type="search"
                    placeholder={tonganFirst ? "Search Tongan or English" : "Search English or Tongan"}
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
                <button
                  type="button"
                  className="dir-toggle"
                  aria-label={
                    tonganFirst
                      ? "Tongan shown first. Switch to English first."
                      : "English shown first. Switch to Tongan first."
                  }
                  onClick={() => setDirection(tonganFirst ? "en-to" : "to-en")}
                >
                  <span aria-hidden="true">{tonganFirst ? "TO → EN" : "EN → TO"}</span>
                </button>
              </div>
            )}
          </div>
          {home && (
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
                      <span className="tab-count">
                        {active ? <FoiHea className="foi-badge" /> : null}
                        {pack.entries.length}
                      </span>
                    </span>
                    <span className="tab-to" lang="to" translate="no">
                      {pack.name_to}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {home && (
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
          )}
        </header>
        <div className="nifo-band" aria-hidden="true" />
        <main id="main" className={home ? "workspace" : "workspace is-page"}>
          {page === "about" && <About professions={professions} onOpenSubject={openSubject} />}
          {page === "settings" && (
            <Settings
              direction={direction}
              textSize={textSize}
              theme={themePref}
              onDirection={setDirection}
              onTextSize={setTextSize}
              onTheme={setThemePref}
            />
          )}
          {home && (
            <>
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
                    <FoiHea className="foi-ornament" />
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
                        direction={direction}
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
                    direction={direction}
                    onBack={() => setSelectedId(null)}
                    onSelectCategory={(name) => setCategory(name)}
                  />
                ) : (
                  <div className="overview">
                    <FoiHea className="foi-ornament" />
                    <p className="kicker">Subject</p>
                    <h2>{profession.name_en}</h2>
                    <p className="overview-to" lang="to" translate="no">
                      {profession.name_to}
                    </p>
                    <p className="overview-help">
                      Choose a term on the left. English and Tongan are shown together, with the headword first.
                    </p>
                    <dl className="stats">
                      <div>
                        <dd>{profession.entries.length}</dd>
                        <dt>
                          <FoiHea className="foi-bullet" />
                          Terms
                        </dt>
                      </div>
                      <div>
                        <dd>{categories.length}</dd>
                        <dt>
                          <FoiHea className="foi-bullet" />
                          Categories
                        </dt>
                      </div>
                    </dl>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
        <div className="nifo-band" aria-hidden="true" />
      </div>
      <Drawer
        open={drawerOpen}
        page={page}
        returnFocus={menuRef}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(next) => {
          setPage(next);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
