import { useMemo, useState } from "react";
import { professions } from "./data/professions";
import type { TermEntry } from "./types";
import TermCard from "./components/TermCard";

export default function App() {
  const [professionSlug, setProfessionSlug] = useState(professions[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const profession = professions.find((p) => p.slug === professionSlug) ?? professions[0];

  const categories = useMemo(() => {
    if (!profession) return ["All"];
    return ["All", ...Array.from(new Set(profession.entries.map((e) => e.category)))];
  }, [profession]);

  const filtered: TermEntry[] = useMemo(() => {
    if (!profession) return [];
    return profession.entries.filter((e) => {
      const matchesCategory = category === "All" || e.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        e.en_term.toLowerCase().includes(q) ||
        e.to_term.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [profession, query, category]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tongan Professional Dictionaries</h1>
        <div className="controls">
          <select
            value={professionSlug}
            onChange={(e) => {
              setProfessionSlug(e.target.value);
              setCategory("All");
            }}
          >
            {professions.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name_en} / {p.name_to}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search terms…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="category-row">
          {categories.map((c) => (
            <button
              key={c}
              className={c === category ? "chip chip-active" : "chip"}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="term-list">
        {filtered.length === 0 && <p className="empty">No terms match.</p>}
        {filtered.map((entry) => (
          <TermCard key={entry.id} entry={entry} />
        ))}
      </main>
    </div>
  );
}
