import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { letterId, letterOf, scrubberLetters } from "./alpha";
import { APP_NAME } from "./brand";
import About from "./components/About";
import AlphaIndex from "./components/AlphaIndex";
import DirectionSeg from "./components/DirectionSeg";
import Drawer from "./components/Drawer";
import { CloseIcon, HamburgerIcon, SearchIcon } from "./components/Icons";
import Sheet from "./components/Sheet";
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
import { useHideOnScroll } from "./useHideOnScroll";

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
  const [searching, setSearching] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [covered, setCovered] = useState(false);
  const [toast, setToast] = useState(false);
  const [sheetEntry, setSheetEntry] = useState<TermEntry | null>(null);
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 900px)").matches);
  const [riseOn, setRiseOn] = useState(true);
  const [listFade, setListFade] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const windowScroller = useRef<HTMLElement | null>(null);
  const historyMode = useRef<"push" | "replace">("push");
  const seeded = useRef(false);
  const previousWasList = useRef(false);
  const slugRef = useRef(boot.current.slug);
  const toastTimer = useRef(0);
  const skipDrawerClose = useRef(true);
  const wideRef = useRef(window.matchMedia("(min-width: 900px)").matches);
  const savedScroll = useRef(0);
  const scrollPin = useRef<number[]>([]);
  const returnTerm = useRef<string | null>(null);
  const directionReady = useRef(false);

  const profession = professions.find((pack) => pack.slug === professionSlug) ?? professions[0];
  const tonganFirst = direction === "to-en";
  const routeKey = `${page}:${professionSlug}:${selectedId ?? ""}`;

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
  const sheetOpen = !wide && page === "home" && selected !== null;

  const headerHidden = useHideOnScroll({
    scrollerRef: wide ? listScrollRef : windowScroller,
    enabled: !wide && page === "home",
    forceShow: drawerOpen || searching || scrubbing,
    routeKey,
  });
  const hideHeader = headerHidden && !drawerOpen && !searching && !scrubbing && !wide && page === "home";

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
    const media = window.matchMedia("(min-width: 900px)");
    const onChange = () => setWide(media.matches);
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

  useEffect(() => {
    const copy = strings(direction);
    if (page === "about") {
      document.title = `${copy.about} · ${APP_NAME}`;
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
    pinScroll(y);
  }, [page, profession, selectedId]);

  useEffect(() => {
    const onPop = () => {
      const route = readRoute();
      previousWasList.current = false;
      setDrawerOpen(false);
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
    if (skipDrawerClose.current) {
      skipDrawerClose.current = false;
      return;
    }
    setDrawerOpen(false);
  }, [routeKey]);

  useEffect(() => {
    if (page === "home" && selected) setSheetEntry(selected);
  }, [page, selected]);

  useEffect(() => {
    if (wide) {
      setSheetEntry(null);
      setCovered(false);
    }
  }, [wide]);

  useEffect(() => {
    const scroller = wide ? listScrollRef.current : document.scrollingElement;
    scroller?.scrollTo({ top: 0 });
  }, [query, professionSlug, direction, wide]);

  useEffect(() => {
    if (!wide || !selectedId || page !== "home") return;
    document.getElementById(`term-${selectedId}`)?.scrollIntoView({ block: "nearest" });
  }, [wide, selectedId, page]);

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
        if (selectedId && page === "home") closeDetail();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const y = window.scrollY;
    if (drawerOpen || (!wide && sheetEntry)) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
    if (window.scrollY !== y) window.scrollTo(0, y);
  }, [drawerOpen, wide, sheetEntry]);

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

  const onCover = useCallback((next: boolean) => setCovered(next), []);
  const onExited = useCallback(() => setSheetEntry(null), []);

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
    const pack = professions[next];
    selectProfession(pack.slug);
    window.setTimeout(() => document.getElementById(`tab-${pack.slug}`)?.focus(), 0);
  }

  const copy = strings(direction);

  if (!profession) {
    return <p className="empty">{copy.noPacks}</p>;
  }
  const appClass = ["app", hideHeader ? "is-header-hidden" : "", covered && !wide ? "is-sheet" : ""].filter(Boolean).join(" ");
  let running = 0;

  return (
    <div className={appClass}>
      <div ref={frameRef} className="app-frame">
        <a className="skip" href="#main">
          {copy.skip}
        </a>
        <header className="topbar">
          <button
            ref={menuRef}
            type="button"
            className="menu-button"
            aria-label={copy.menu}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            aria-controls="app-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <HamburgerIcon open={drawerOpen} />
          </button>
          <p className="brand-title">{APP_NAME}</p>
          {page === "home" ? (
            <button type="button" className="icon-btn" aria-label={copy.search} onClick={() => document.getElementById("term-search")?.focus()}>
              <SearchIcon />
            </button>
          ) : (
            <span />
          )}
        </header>
        {page === "about" && <About direction={direction} />}
        {page === "home" && (
          <div className="stage">
            <div className="list-shell">
              <div ref={listScrollRef} className="list-scroll" id="main">
                <h1 className="sr-only">{profession.name_en}</h1>
                <div className={searching ? "toolbar is-searching" : "toolbar"}>
                  <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
                    <label className="sr-only" htmlFor="term-search">
                      {copy.searchWords}
                    </label>
                    <SearchIcon />
                    <input
                      id="term-search"
                      type="search"
                      placeholder={copy.search}
                      value={query}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="search"
                      onFocus={() => setSearching(true)}
                      onBlur={(event) => {
                        if ((event.relatedTarget as HTMLElement | null)?.id === "search-cancel") return;
                        setSearching(false);
                      }}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                    {query && !searching && (
                      <button type="button" className="search-clear" aria-label={copy.clearSearch} onClick={() => setQuery("")}>
                        <CloseIcon />
                      </button>
                    )}
                  </form>
                  {searching ? (
                    <button
                      id="search-cancel"
                      type="button"
                      className="ghost cancel"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setQuery("");
                        setSearching(false);
                        (document.getElementById("term-search") as HTMLInputElement | null)?.blur();
                      }}
                    >
                      {copy.cancel}
                    </button>
                  ) : (
                    <DirectionSeg direction={direction} onChange={setDirection} label={copy.direction} />
                  )}
                </div>
                <p className="result-count" aria-live="polite">
                  <span key={`${filtered.length}-${needle}`} className="count-fade">
                    {copy.wordCount(filtered.length)}
                  </span>
                </p>
                <div className="chips" role="tablist" aria-label={copy.subjects} onKeyDown={onTabKeyDown}>
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
                {filtered.length === 0 ? (
                  <div className="empty card">
                    <h2>{copy.noMatching}</h2>
                    <p>{needle ? copy.nothingMatches(deferredQuery.trim()) : copy.nothingToShow}</p>
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => {
                        setQuery("");
                        setSearching(false);
                      }}
                    >
                      {copy.clearSearch}
                    </button>
                  </div>
                ) : (
                  <div className={listFade ? "sections is-fading" : "sections"}>
                    {grouped.letters.filter((letter) => letter.enabled).map((letter) => {
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
              <AlphaIndex letters={grouped.letters} wide={wide} label={copy.letters} onScrubbing={setScrubbing} />
            </div>
            {wide && (
              <div className="detail-pane" aria-label={copy.termDetail}>
                {selected ? (
                  <TermDetail entry={selected} direction={direction} layout="inline" onCopy={() => copyEntry(selected)} />
                ) : (
                  <div className="empty-detail">
                    <p>{copy.chooseWord}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {!wide && sheetEntry && (
        <Sheet
          open={sheetOpen}
          subject={profession.name_en}
          copyLabel={copy.copyTerm}
          onClose={closeDetail}
          onCopy={() => copyEntry(sheetEntry)}
          onCover={onCover}
          onExited={onExited}
        >
          <TermDetail entry={sheetEntry} direction={direction} layout="sheet" onCopy={() => copyEntry(sheetEntry)} />
        </Sheet>
      )}
      <Drawer
        open={drawerOpen}
        page={page}
        slug={profession.slug}
        direction={direction}
        textSize={textSize}
        theme={themePref}
        professions={professions}
        returnFocus={menuRef}
        onClose={() => setDrawerOpen(false)}
        onHome={goHome}
        onAbout={() => setPage("about")}
        onSubject={selectProfession}
        onDirection={setDirection}
        onTextSize={setTextSize}
        onTheme={setThemePref}
      />
      {toast && (
        <div className="toast" role="status">
          {copy.copied}
        </div>
      )}
    </div>
  );
}
