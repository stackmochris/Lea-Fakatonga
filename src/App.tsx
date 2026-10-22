import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { letterId, letterOf, scrubberLetters } from "./alpha";
import { APP_NAME } from "./brand";
import About from "./components/About";
import AlphaIndex from "./components/AlphaIndex";
import DirectionSeg from "./components/DirectionSeg";
import { ChevronLeft, CloseIcon, MoonIcon, SearchIcon, SunIcon } from "./components/Icons";
import { ManuluaMark } from "./components/Motifs";
import Settings from "./components/Settings";
import Sidebar from "./components/Sidebar";
import TermCard from "./components/TermCard";
import TermDetail from "./components/TermDetail";
import { professions } from "./data/professions";
import { strings, uiLang } from "./i18n";
import {
  applyDirection,
  applyTextSize,
  applyTheme,
  getStoredDirection,
  getStoredTextSize,
  getStoredThemePreference,
  type Direction,
  type TextSize,
  type ThemePreference,
} from "./preferences";
import { readRoute, routeHash, type Page } from "./route";
import { fold, searchRank, sortLabel } from "./search";
import type { TermEntry } from "./types";

const WIDE_QUERY = "(min-width: 900px)";

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
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [direction, setDirection] = useState<Direction>(getStoredDirection);
  const [textSize, setTextSize] = useState<TextSize>(getStoredTextSize);
  const [professionSlug, setProfessionSlug] = useState(boot.current.slug);
  const [selectedId, setSelectedId] = useState<string | null>(boot.current.id);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(-1);
  const [scrubbing, setScrubbing] = useState(false);
  const [toast, setToast] = useState(false);
  const [wide, setWide] = useState(() => window.matchMedia(WIDE_QUERY).matches);
  const [riseOn, setRiseOn] = useState(true);
  const [listFade, setListFade] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const historyMode = useRef<"push" | "replace">("push");
  const seeded = useRef(false);
  const previousWasList = useRef(false);
  const slugRef = useRef(boot.current.slug);
  const toastTimer = useRef(0);
  const wideRef = useRef(window.matchMedia(WIDE_QUERY).matches);
  const savedScroll = useRef(0);
  const scrollPin = useRef<number[]>([]);
  const returnTerm = useRef<string | null>(null);
  const directionReady = useRef(false);
  const cursorRef = useRef(-1);

  const profession = professions.find((pack) => pack.slug === professionSlug) ?? professions[0];
  const tonganFirst = direction === "to-en";
  const dark = themePref === "dark" || (themePref === "system" && systemDark);

  const entries = useMemo(() => {
    if (!profession) return [];
    const locale = tonganFirst ? "to" : "en";
    return [...profession.entries].sort((a, b) =>
      sortLabel(a, direction).localeCompare(sortLabel(b, direction), locale, { sensitivity: "base" }),
    );
  }, [profession, direction, tonganFirst]);

  const deferredQuery = useDeferredValue(query);
  const needle = fold(deferredQuery.trim());
  const filtered = useMemo(() => {
    const hits = entries.filter((entry) => searchRank(entry, needle, direction) < 2);
    if (!needle) return hits;
    const locale = tonganFirst ? "to" : "en";
    return hits.sort((a, b) => {
      const rank = searchRank(a, needle, direction) - searchRank(b, needle, direction);
      if (rank !== 0) return rank;
      return sortLabel(a, direction).localeCompare(sortLabel(b, direction), locale, { sensitivity: "base" });
    });
  }, [entries, needle, direction, tonganFirst]);

  const grouped = useMemo(() => {
    const groups = new Map<string, TermEntry[]>();
    for (const entry of filtered) {
      const label = letterOf(sortLabel(entry, direction));
      const list = groups.get(label);
      if (list) list.push(entry);
      else groups.set(label, [entry]);
    }
    const letters = scrubberLetters(direction, groups.keys()).map((label) => ({
      label,
      enabled: groups.has(label),
      targetId: letterId(label),
    }));
    return { groups, letters };
  }, [filtered, direction]);

  const selected = profession?.entries.find((entry) => entry.id === selectedId) ?? null;
  cursorRef.current = cursor;

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    wideRef.current = wide;
  }, [wide]);

  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY);
    const onChange = () => setWide(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
    document.documentElement.lang = uiLang(direction);
  }, [direction]);

  useEffect(() => {
    slugRef.current = professionSlug;
  }, [professionSlug]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setRiseOn(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!directionReady.current) {
      directionReady.current = true;
      return;
    }
    setListFade(true);
    const timeout = window.setTimeout(() => setListFade(false), 160);
    return () => window.clearTimeout(timeout);
  }, [direction]);

  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const apply = () => document.documentElement.style.setProperty("--topbar-h", `${node.offsetHeight}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const copy = strings(direction);
    if (page === "about") {
      document.title = `${copy.about} · ${APP_NAME}`;
      return;
    }
    if (page === "settings") {
      document.title = `${copy.settings} · ${APP_NAME}`;
      return;
    }
    if (!profession) return;
    const term = profession.entries.find((entry) => entry.id === selectedId);
    const head = term ? sortLabel(term, direction) : profession.name_en;
    document.title = term ? `${head} · ${profession.name_en} · ${APP_NAME}` : `${profession.name_en} · ${APP_NAME}`;
  }, [page, profession, selectedId, direction]);

  useEffect(() => {
    if (page === "home") return;
    const timer = window.setTimeout(() => document.getElementById("page-title")?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [page]);

  useEffect(() => {
    if (needle) {
      setCursor(filtered.length ? 0 : -1);
      return;
    }
    if (selectedId) {
      setCursor(filtered.findIndex((entry) => entry.id === selectedId));
      return;
    }
    setCursor(-1);
  }, [needle, professionSlug, direction, selectedId, filtered]);

  useEffect(() => {
    if (cursor < 0 || (!wide && selectedId)) return;
    const entry = filtered[cursor];
    if (!entry) return;
    document.getElementById(`term-${entry.id}`)?.scrollIntoView({ block: "nearest" });
  }, [cursor, filtered, wide, selectedId]);

  useEffect(() => {
    if (!profession) return;
    const next = routeHash(page, profession.slug, page === "home" ? selectedId : null);
    const url = `${window.location.pathname}${window.location.search}${next}`;
    if (!seeded.current) {
      seeded.current = true;
      if (window.location.hash !== next) window.history.replaceState(null, "", url);
      return;
    }
    if (window.location.hash === next) return;
    // Read the position captured on the click. A fresh read here is often already 0,
    // because the browser resets scroll while applying the history entry.
    const openingDetail = page === "home" && selectedId !== null;
    const y = openingDetail ? savedScroll.current : readScroll();
    const state = { leaScroll: y };
    const mode = historyMode.current;
    historyMode.current = "push";
    if (mode === "replace") {
      window.history.replaceState(state, "", url);
    } else {
      if (openingDetail) window.history.replaceState(state, "", window.location.href);
      window.history.pushState(state, "", url);
    }
    if (openingDetail && !wideRef.current) pinScroll(0);
    else pinScroll(y);
  }, [page, profession, selectedId]);

  useEffect(() => {
    const onPop = () => {
      const route = readRoute();
      previousWasList.current = false;
      setPage(route.page);
      if (route.page !== "home") {
        setSelectedId(null);
        return;
      }
      const slug = knownSlug(route.slug);
      const pack = professions.find((item) => item.slug === slug);
      if (!pack) return;
      if (slugRef.current !== pack.slug) setQuery("");
      setProfessionSlug(pack.slug);
      setSelectedId(route.id && pack.entries.some((entry) => entry.id === route.id) ? route.id : null);
      const state = window.history.state as { leaScroll?: number } | null;
      const y = typeof state?.leaScroll === "number" ? state.leaScroll : savedScroll.current;
      savedScroll.current = y;
      pinScroll(y);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const scroller = wide ? listScrollRef.current : document.scrollingElement;
    scroller?.scrollTo({ top: 0 });
  }, [query, professionSlug, direction, wide]);

  useEffect(() => {
    if (!wide || !selectedId || page !== "home") return;
    document.getElementById(`term-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [wide, selectedId, page]);

  useEffect(() => {
    if (selectedId || wide) return;
    const id = returnTerm.current;
    if (!id) return;
    const timer = window.setTimeout(() => {
      returnTerm.current = null;
      const y = savedScroll.current;
      document.getElementById(`term-${id}`)?.focus({ preventScroll: true });
      writeScroll(y);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [selectedId, wide]);

  function readScroll() {
    if (wideRef.current && listScrollRef.current) return listScrollRef.current.scrollTop;
    return window.scrollY;
  }

  function writeScroll(y: number) {
    if (wideRef.current && listScrollRef.current) listScrollRef.current.scrollTop = y;
    else window.scrollTo(0, y);
  }

  function pinScroll(y: number) {
    for (const id of scrollPin.current) window.clearTimeout(id);
    writeScroll(y);
    window.requestAnimationFrame(() => writeScroll(y));
    scrollPin.current = [0, 60, 120, 300].map((delay) => window.setTimeout(() => writeScroll(y), delay));
  }

  function openTerm(id: string) {
    if (id === selectedId && page === "home") return;
    savedScroll.current = readScroll();
    returnTerm.current = id;
    previousWasList.current = page === "home" && selectedId === null;
    setPage("home");
    setSelectedId(id);
  }

  function closeDetail() {
    if (previousWasList.current) {
      previousWasList.current = false;
      window.history.back();
      return;
    }
    historyMode.current = "replace";
    setSelectedId(null);
  }

  function selectProfession(slug: string) {
    returnTerm.current = null;
    setProfessionSlug(slug);
    setQuery("");
    setSelectedId(null);
    setPage("home");
  }

  function goHome() {
    if (page === "home" && selectedId) {
      closeDetail();
      return;
    }
    setPage("home");
    setSelectedId(null);
  }

  function toggleTheme() {
    const resolved = themePref === "system" ? (systemDark ? "dark" : "light") : themePref;
    setThemePref(resolved === "dark" ? "light" : "dark");
  }

  function onSearchChange(value: string) {
    setQuery(value);
    if (page !== "home") {
      setSelectedId(null);
      setPage("home");
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT" || target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        document.getElementById("glossary-search")?.focus();
        return;
      }
      if (event.key === "Escape") {
        if (query) {
          setQuery("");
          document.getElementById("glossary-search")?.focus();
          return;
        }
        if (selectedId && page === "home") closeDetail();
        return;
      }
      const listKey = event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End";
      const inSearch = target?.id === "glossary-search";
      if (event.key === "Enter" && inSearch) {
        event.preventDefault();
        const index = cursorRef.current >= 0 ? cursorRef.current : 0;
        const entry = filtered[index];
        if (entry) openTerm(entry.id);
        return;
      }
      if (!listKey || page !== "home" || scrubbing) return;
      if (!wide && selectedId) return;
      const inRow = Boolean(target?.closest(".term-row"));
      const bare = target === document.body || target === document.documentElement;
      if (!inSearch && !inRow && !bare) return;
      if (filtered.length === 0) return;
      event.preventDefault();
      const current = cursorRef.current;
      let next = 0;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = filtered.length - 1;
      else if (event.key === "ArrowDown") next = current < 0 ? 0 : Math.min(filtered.length - 1, current + 1);
      else next = current < 0 ? filtered.length - 1 : Math.max(0, current - 1);
      cursorRef.current = next;
      setCursor(next);
      if (inRow) {
        const id = filtered[next]?.id;
        if (id) window.requestAnimationFrame(() => document.getElementById(`term-${id}`)?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function copyEntry(entry: TermEntry) {
    const text = [entry.en_term, entry.to_term].map((part) => part.trim()).filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setToast(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 1600);
  }

  function onTabKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!profession) return;
    const index = professions.findIndex((pack) => pack.slug === profession.slug);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % professions.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + professions.length) % professions.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = professions.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    const pack = professions[next];
    selectProfession(pack.slug);
    window.setTimeout(() => document.getElementById(`tab-${pack.slug}`)?.focus(), 0);
  }

  const copy = strings(direction);

  if (!profession) {
    return <p className="empty">{copy.noPacks}</p>;
  }

  const termOpen = page === "home" && selected !== null;
  const appClass = ["app", termOpen ? "is-term" : ""].filter(Boolean).join(" ");
  let running = 0;
  const TitleTag = termOpen ? "p" : "h1";

  return (
    <div className={appClass}>
      <a className="skip" href="#main">
        {copy.skip}
      </a>
      <header ref={headerRef} className="topbar">
        <ManuluaMark className="topbar-manulua" decorative />
        <button type="button" className="brand-lockup" onClick={goHome}>
          <ManuluaMark className="brand-mark" decorative />
          <span className="brand-text">
            <span className="brand-title">{APP_NAME}</span>
          </span>
        </button>
        <div className="search-slot">
          <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="glossary-search">
              {copy.searchWords}
            </label>
            <SearchIcon />
            <input
              id="glossary-search"
              type="search"
              placeholder={copy.search}
              value={query}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-describedby="search-keys"
              onChange={(event) => onSearchChange(event.target.value)}
            />
            <p id="search-keys" className="sr-only">
              {copy.keyHint}
            </p>
            {query && (
              <button type="button" className="search-clear" aria-label={copy.clearSearch} onClick={() => setQuery("")}>
                <CloseIcon />
              </button>
            )}
          </form>
        </div>
        <div className="header-tools">
          <DirectionSeg direction={direction} onChange={setDirection} label={copy.direction} />
          <button type="button" className="theme-toggle" aria-label={copy.theme} aria-pressed={dark} onClick={toggleTheme}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
        <nav className="header-links" aria-label={copy.menu}>
          <button type="button" aria-current={page === "home" ? "page" : undefined} onClick={goHome}>
            {copy.home}
          </button>
          <button type="button" aria-current={page === "about" ? "page" : undefined} onClick={() => setPage("about")}>
            {copy.about}
          </button>
          <button type="button" aria-current={page === "settings" ? "page" : undefined} onClick={() => setPage("settings")}>
            {copy.settings}
          </button>
        </nav>
      </header>
      <div className="workspace">
        <Sidebar
          professions={professions}
          slug={profession.slug}
          page={page}
          direction={direction}
          onSubject={selectProfession}
          onAbout={() => setPage("about")}
          onSettings={() => setPage("settings")}
        />
        <div className={page === "home" ? "stage" : "stage is-page"} id="main">
          {page === "about" && <About direction={direction} />}
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
          {page === "home" && (
            <>
              <div className="mobile-subjects chips" role="tablist" aria-label={copy.subjects} onKeyDown={onTabKeyDown}>
                {professions.map((pack) => {
                  const active = pack.slug === profession.slug;
                  return (
                    <button
                      key={pack.slug}
                      type="button"
                      className={active ? "chip fill" : "chip"}
                      role="tab"
                      id={`tab-${pack.slug}`}
                      aria-selected={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => selectProfession(pack.slug)}
                    >
                      {pack.name_en}
                      <span className="chip-count">{pack.entries.length}</span>
                    </button>
                  );
                })}
              </div>
              <div className="list-shell">
                <div ref={listScrollRef} className="list-scroll">
                  <div className="list-meta">
                    <TitleTag className="list-title">{profession.name_en}</TitleTag>
                    {profession.name_to !== profession.name_en && (
                      <p className="list-sub" lang="to" translate="no">
                        {profession.name_to}
                      </p>
                    )}
                    <p className="result-count" aria-live="polite">
                      <span key={`${filtered.length}-${needle}`} className="count-fade">
                        {copy.wordCount(filtered.length)}
                      </span>
                    </p>
                  </div>
                  {filtered.length === 0 ? (
                    <div className="empty card">
                      <h2>{copy.noMatching}</h2>
                      <p>{needle ? copy.nothingMatches(deferredQuery.trim()) : copy.nothingToShow}</p>
                      <button type="button" className="ghost" onClick={() => setQuery("")}>
                        {copy.clearSearch}
                      </button>
                    </div>
                  ) : (
                    <div id="word-list" className={listFade ? "sections is-fading" : "sections"}>
                      {grouped.letters
                        .filter((letter) => letter.enabled)
                        .map((letter) => {
                          const rows = grouped.groups.get(letter.label) ?? [];
                          const start = running;
                          running += rows.length;
                          return (
                            <section key={letter.label}>
                              <h2 className="letter-head" id={letter.targetId} data-letter={letter.label}>
                                {letter.label}
                              </h2>
                              <ul>
                                {rows.map((entry, index) => {
                                  const globalIndex = start + index;
                                  return (
                                    <TermCard
                                      key={entry.id}
                                      entry={entry}
                                      selected={entry.id === selectedId}
                                      active={globalIndex === cursor}
                                      query={deferredQuery}
                                      direction={direction}
                                      onSelect={openTerm}
                                      rise={riseOn && globalIndex < 12}
                                      delay={globalIndex * 30}
                                    />
                                  );
                                })}
                              </ul>
                            </section>
                          );
                        })}
                    </div>
                  )}
                </div>
                {filtered.length > 0 && (
                  <AlphaIndex letters={grouped.letters} wide={wide} label={copy.letters} onScrubbing={setScrubbing} />
                )}
              </div>
              <div className="detail-pane" role="region" aria-label={copy.termDetail}>
                <button type="button" className="stack-back" onClick={closeDetail}>
                  <ChevronLeft />
                  <span>{profession.name_en}</span>
                </button>
                {selected ? (
                  <TermDetail entry={selected} direction={direction} onCopy={() => copyEntry(selected)} />
                ) : (
                  <div className="empty-detail">
                    <ManuluaMark className="empty-mark" decorative />
                    <p>{copy.chooseWord}</p>
                    <p className="key-hint">{copy.keyHint}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          {copy.copied}
        </div>
      )}
    </div>
  );
}
