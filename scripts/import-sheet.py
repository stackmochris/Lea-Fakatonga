#!/usr/bin/env python3
"""Build profession packs from scripts/fixtures/sheet_terms.json.

Sheet text is copied verbatim aside from stripping leading and trailing
whitespace. Okina and macrons are not normalised. Existing packs are not
rebuilt; only the real Tongan-term mismatches in the audit diff are patched.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "scripts" / "fixtures" / "sheet_terms.json"
DIFF = ROOT / "scripts" / "fixtures" / "diff.json"
DATA = ROOT / "src" / "data" / "professions"

# Sheet tab -> pack. Body Parts Tongan order and TNU are intentionally absent.
PACKS = [
    ("ʻĀtolopolosia", "anthropology", "Anthropology", "ʻĀtolopolosia", "anthropology.json"),
    ("TLS", "tls", "TLS", "TLS", "tls.json"),
    ("Neesi", "nursing", "Nursing", "Neesi", "nursing.json"),
    ("Kēmisi", "chemistry", "Chemistry", "Kēmisi", "chemistry.json"),
    ("Fisiki", "physics", "Physics", "Fisiki", "physics.json"),
    ("Teolosia", "theology", "Theology", "Teolosia", "theology.json"),
    ("Body Parts English order", "body-parts", "Body Parts", "Body Parts", "body-parts.json"),
    ("Medical ", "medical", "Medical", "Medical", "medical.json"),
    ("Ngaue'anga (HR)", "human-resources", "Human Resources", "Ngaue'anga (HR)", "human-resources.json"),
    ("ʻEkonōmika", "economics", "Economics", "ʻEkonōmika", "economics.json"),
]

LEGACY = {
    "Ngoue": "agriculture.json",
    "Komipiuta": "computer-terms.json",
    "Taumu'a Fakalakalaka Tu'uloa": "sdg.json",
}


def trim(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def slugify(text: str, row: int) -> str:
    cleaned: list[str] = []
    hyphen = False
    for char in text.strip().lower():
        if "a" <= char <= "z" or "0" <= char <= "9":
            cleaned.append(char)
            hyphen = False
        elif cleaned and not hyphen:
            cleaned.append("-")
            hyphen = True
    slug = "".join(cleaned).strip("-")[:80].strip("-")
    return slug or f"row-{row}"


def category_for(row: dict) -> str:
    section = trim(row.get("section"))
    if section:
        return section
    source = trim(row.get("source"))
    if source:
        return source
    return "General"


def entry_from(row: dict, used_ids: set[str]) -> dict:
    english = trim(row.get("english"))
    base = slugify(english, row["row"])
    entry_id = base
    if entry_id in used_ids:
        entry_id = f"{base}-{row['row']}"
    used_ids.add(entry_id)
    return {
        "id": entry_id,
        "en_term": english,
        "to_term": trim(row.get("tongan")),
        "en_definition": trim(row.get("en_def")),
        "to_definition": trim(row.get("to_def")),
        "category": category_for(row),
        "en_example": "",
        "to_example": "",
        "prefix": "",
        "audio_url": "",
        "image_url": "",
    }


def write_pack(filename: str, slug: str, name_en: str, name_to: str, entries: list[dict]) -> None:
    pack = {"slug": slug, "name_en": name_en, "name_to": name_to, "entries": entries}
    path = DATA / filename
    path.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {filename}: {len(entries)} terms")


def replace_to_term(text: str, entry_id: str, new_value: str) -> str:
    marker = f'"id": "{entry_id}"'
    start = text.find(marker)
    if start < 0:
        raise SystemExit(f"missing entry {entry_id}")
    key = text.find('"to_term":', start)
    if key < 0 or key - start > 400:
        raise SystemExit(f"missing to_term for {entry_id}")
    quote = text.find('"', key + len('"to_term":'))
    encoded = json.dumps(new_value, ensure_ascii=False)
    end = quote + 1
    while True:
        end = text.find('"', end)
        if text[end - 1] != "\\":
            break
        end += 1
    return text[:quote] + encoded + text[end + 1 :]


def patch_legacy(terms: list[dict], diff: dict) -> None:
    by_tab_row = {(row["tab"], row["row"]): row for row in terms}
    for tab, filename in LEGACY.items():
        path = DATA / filename
        text = path.read_text(encoding="utf-8")
        for mismatch in diff["tabs"][tab]["mismatch"]:
            source = by_tab_row[(tab, mismatch["sheet_row"])]
            updated = trim(source["tongan"])
            text = replace_to_term(text, mismatch["app_id"], updated)
            print(f"patched {filename} {mismatch['app_id']} -> {updated}")
        path.write_text(text, encoding="utf-8")


def main() -> None:
    sheet = json.loads(FIXTURE.read_text(encoding="utf-8"))
    diff = json.loads(DIFF.read_text(encoding="utf-8"))
    terms = sheet["terms"]
    for tab, slug, name_en, name_to, filename in PACKS:
        rows = [row for row in terms if row["tab"] == tab]
        used: set[str] = set()
        entries = [entry_from(row, used) for row in rows if trim(row.get("english")) or trim(row.get("tongan"))]
        write_pack(filename, slug, name_en, name_to, entries)
    patch_legacy(terms, diff)


if __name__ == "__main__":
    main()
