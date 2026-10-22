#!/usr/bin/env node
/**
 * Counts terms in each profession pack and checks sheet rows are represented.
 *
 * New packs must match the sheet text exactly (trim only).
 * The three original packs keep their okina style, capitalisation, and
 * definitions. They are matched loosely, and the audited Tongan-term
 * mismatches must match the sheet exactly.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "src/data/professions");
const sheet = JSON.parse(readFileSync(join(root, "scripts/fixtures/sheet_terms.json"), "utf8"));
const diff = JSON.parse(readFileSync(join(root, "scripts/fixtures/diff.json"), "utf8"));
const coverage = JSON.parse(readFileSync(join(root, "scripts/sheet-coverage.json"), "utf8"));

const failures = [];
function fail(message) {
  failures.push(message);
}

function trim(value) {
  return String(value ?? "").trim();
}

function fieldKey(english, tongan, enDef, toDef) {
  return [trim(english), trim(tongan), trim(enDef), trim(toDef)].join("\u0000");
}

function loose(value) {
  return trim(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLocaleLowerCase("en");
}

const packs = new Map();
for (const file of readdirSync(dataDir).filter((name) => name.endsWith(".json") && !name.startsWith("_"))) {
  const pack = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  packs.set(file, pack);
}

console.log("Terms per subject");
let total = 0;
for (const pack of packs.values()) {
  total += pack.entries.length;
  console.log(`  ${String(pack.entries.length).padStart(4)}  ${pack.name_en} / ${pack.name_to}  (${pack.slug})`);
}
console.log(`  ${String(total).padStart(4)}  total`);

const skippedTabs = new Set(coverage.skippedTabs.map((item) => item.tab));
const skippedRows = new Set(coverage.skippedRows.map((item) => `${item.tab}\t${item.row}`));
const aliases = new Map(
  coverage.legacyEnglishAliases.map((item) => [`${item.tab}\t${item.sheet}`, item.app]),
);

for (const [tab, file] of Object.entries(coverage.newPacks)) {
  const pack = packs.get(file);
  if (!pack) {
    fail(`missing pack ${file} for ${tab}`);
    continue;
  }
  const rows = sheet.terms.filter((row) => row.tab === tab && !skippedRows.has(`${row.tab}\t${row.row}`));
  const blank = rows.filter((row) => !trim(row.english) && !trim(row.tongan));
  const kept = rows.filter((row) => trim(row.english) || trim(row.tongan));
  const expected = new Map();
  for (const row of kept) {
    const key = fieldKey(row.english, row.tongan, row.en_def, row.to_def);
    expected.set(key, (expected.get(key) ?? 0) + 1);
  }
  const actual = new Map();
  for (const entry of pack.entries) {
    const key = fieldKey(entry.en_term, entry.to_term, entry.en_definition, entry.to_definition);
    actual.set(key, (actual.get(key) ?? 0) + 1);
  }
  if (pack.entries.length !== kept.length) {
    fail(`${file} has ${pack.entries.length} entries, sheet has ${kept.length} kept rows (${blank.length} blank)`);
  }
  for (const [key, count] of expected) {
    if ((actual.get(key) ?? 0) < count) {
      const [english, tongan] = key.split("\u0000");
      fail(`${file} missing sheet text “${english}” / “${tongan}” (need ${count}, have ${actual.get(key) ?? 0})`);
    }
  }
}

for (const [tab, file] of Object.entries(coverage.legacyPacks)) {
  const pack = packs.get(file);
  if (!pack) {
    fail(`missing legacy pack ${file}`);
    continue;
  }
  const byEnglish = new Map();
  for (const entry of pack.entries) {
    const key = loose(entry.en_term);
    const list = byEnglish.get(key) ?? [];
    list.push(entry);
    byEnglish.set(key, list);
  }
  for (const row of sheet.terms.filter((item) => item.tab === tab)) {
    if (skippedRows.has(`${row.tab}\t${row.row}`)) continue;
    const aliased = aliases.get(`${tab}\t${row.english}`) ?? row.english;
    const found = byEnglish.get(loose(aliased));
    if (!found) {
      fail(`${file} has no entry for sheet row ${row.row} “${row.english}”`);
      continue;
    }
    const sheetTongan = loose(row.tongan);
    if (sheetTongan && !found.some((entry) => loose(entry.to_term) === sheetTongan)) {
      fail(`${file} row ${row.row} “${row.english}” Tongan “${row.tongan}” is not represented`);
    }
  }
  for (const mismatch of diff.tabs[tab].mismatch) {
    const entry = pack.entries.find((item) => item.id === mismatch.app_id);
    const source = sheet.terms.find((row) => row.tab === tab && row.row === mismatch.sheet_row);
    if (!entry || !source) {
      fail(`cannot check mismatch ${tab} ${mismatch.app_id}`);
      continue;
    }
    if (entry.to_term !== trim(source.tongan)) {
      fail(`${file} ${entry.id} to_term is ${JSON.stringify(entry.to_term)}, sheet is ${JSON.stringify(trim(source.tongan))}`);
    }
  }
}

for (const extra of coverage.keepInAppNotInSheet) {
  const pack = packs.get(extra.file);
  const entry = pack?.entries.find((item) => item.id === extra.id && item.en_term === extra.en_term);
  if (!entry) fail(`expected to keep ${extra.en_term} in ${extra.file}`);
}

const englishOrder = sheet.terms.filter((row) => row.tab === "Body Parts English order");
const tonganOrder = sheet.terms.filter((row) => row.tab === "Body Parts Tongan order");
const tally = (rows) => {
  const counts = new Map();
  for (const row of rows) {
    const key = fieldKey(row.english, row.tongan, row.en_def, row.to_def);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};
const left = tally(englishOrder);
const right = tally(tonganOrder);
if (left.size !== right.size) {
  fail(`Body Parts tabs differ (${left.size} vs ${right.size} distinct rows)`);
} else {
  for (const [key, count] of left) {
    if (right.get(key) !== count) {
      fail("Body Parts Tongan order is not the same list as the English order");
      break;
    }
  }
}

for (const tab of new Set(sheet.terms.map((row) => row.tab))) {
  if (skippedTabs.has(tab)) continue;
  if (!coverage.newPacks[tab] && !coverage.legacyPacks[tab]) {
    fail(`sheet tab ${JSON.stringify(tab)} is neither imported nor documented as skipped`);
  }
}

const started = performance.now();
const needle = "ngoue";
let hits = 0;
for (const pack of packs.values()) {
  for (const entry of pack.entries) {
    const hay = `${entry.en_term}\n${entry.to_term}`.toLocaleLowerCase("en");
    if (hay.includes(needle)) hits += 1;
  }
}
const elapsed = performance.now() - started;
console.log(`Search scan of ${total} terms: ${hits} hits in ${elapsed.toFixed(1)} ms`);
if (elapsed > 50) fail(`search scan took ${elapsed.toFixed(1)} ms`);

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  for (const message of failures.slice(0, 30)) console.error(`- ${message}`);
  process.exit(1);
}
console.log("Sheet coverage checks passed");
