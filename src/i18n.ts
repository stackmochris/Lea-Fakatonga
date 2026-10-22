import type { Direction } from "./preferences";

/**
 * Interface chrome. `to-en` shows Tongan; `en-to` shows English.
 * Tongan I am not sure of stays in English and is marked TODO verify.
 */
export type UiLang = "en" | "to";

export function uiLang(direction: Direction): UiLang {
  return direction === "to-en" ? "to" : "en";
}

export type Chrome = {
  skip: string;
  menu: string;
  closeMenu: string;
  search: string;
  searchWords: string;
  clearSearch: string;
  cancel: string;
  subjects: string;
  home: string;
  dictionary: string;
  direction: string;
  directionHelp: string;
  settings: string;
  about: string;
  aboutCredit: string;
  textSize: string;
  normal: string;
  large: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  aboutBuilt: string;
  noMatching: string;
  nothingToShow: string;
  nothingMatches: (query: string) => string;
  wordCount: (count: number) => string;
  termDetail: string;
  chooseWord: string;
  copied: string;
  noPacks: string;
  english: string;
  noTonganTerm: string;
  draft: string;
  copyTerm: string;
  definition: string;
  noTonganDefinition: string;
  examples: string;
  prefix: string;
  pronunciation: string;
  playPronunciation: string;
  letters: string;
};

const en: Chrome = {
  skip: "Skip to content",
  menu: "Menu",
  closeMenu: "Close menu",
  search: "Search",
  searchWords: "Search words",
  clearSearch: "Clear search",
  cancel: "Cancel",
  subjects: "Subjects",
  home: "Home",
  dictionary: "Dictionary",
  direction: "Direction",
  directionHelp: "The headword is shown first in the list and in search.",
  settings: "Settings",
  about: "About",
  aboutCredit: "This demo app was produced by Crisem Consulting under the direction of Dr Litia Vea Simpson.",
  textSize: "Text size",
  normal: "Normal",
  large: "Large",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  aboutBuilt: "Built from the spreadsheet",
  noMatching: "No matching words",
  nothingToShow: "Nothing to show.",
  nothingMatches: (query) => `Nothing matches “${query}”.`,
  wordCount: (count) => `${count} ${count === 1 ? "word" : "words"}`,
  termDetail: "Term detail",
  chooseWord: "Choose a word",
  copied: "Copied",
  noPacks: "No glossary packs are loaded.",
  english: "English",
  noTonganTerm: "No Tongan term yet",
  draft: "Draft",
  copyTerm: "Copy term",
  definition: "Definition",
  noTonganDefinition: "No Tongan definition yet",
  examples: "Examples",
  prefix: "Prefix",
  pronunciation: "Pronunciation",
  playPronunciation: "Play pronunciation",
  letters: "Letters",
};

const to: Chrome = {
  skip: "Skip to content", // TODO verify
  menu: "Menu", // TODO verify
  closeMenu: "Close menu", // TODO verify
  search: "Kumi",
  searchWords: "Search words", // TODO verify
  clearSearch: "Clear search", // TODO verify
  cancel: "Cancel", // TODO verify
  subjects: "Ngaahi Kaveinga", // Pending a native-speaker check. Short label: Kaveinga.
  home: "ʻApi",
  dictionary: "Dictionary", // TODO verify
  direction: "Direction", // TODO verify
  directionHelp: "The headword is shown first in the list and in search.", // TODO verify
  settings: "Ngaahi Fokotuʻutuʻu", // Pending a native-speaker check.
  about: "Fekauʻaki mo e Polokalama", // Pending a native-speaker check.
  aboutCredit: "This demo app was produced by Crisem Consulting under the direction of Dr Litia Vea Simpson.", // TODO verify
  textSize: "Text size", // TODO verify
  normal: "Normal", // TODO verify
  large: "Large", // TODO verify
  theme: "Theme", // TODO verify
  light: "Light", // TODO verify
  dark: "Dark", // TODO verify
  system: "System", // TODO verify
  aboutBuilt: "Built from the spreadsheet", // TODO verify
  noMatching: "No matching words", // TODO verify
  nothingToShow: "Nothing to show.", // TODO verify
  nothingMatches: (query) => `Nothing matches “${query}”.`, // TODO verify
  wordCount: (count) => `${count} ${count === 1 ? "word" : "words"}`, // TODO verify
  termDetail: "Term detail", // TODO verify
  chooseWord: "Choose a word", // TODO verify
  copied: "Copied", // TODO verify
  noPacks: "No glossary packs are loaded.", // TODO verify
  english: "Lea fakapālangi",
  noTonganTerm: "No Tongan term yet", // TODO verify
  draft: "Draft", // TODO verify
  copyTerm: "Copy term", // TODO verify
  definition: "Definition", // TODO verify
  noTonganDefinition: "No Tongan definition yet", // TODO verify
  examples: "Examples", // TODO verify
  prefix: "Prefix", // TODO verify
  pronunciation: "Pronunciation", // TODO verify
  playPronunciation: "Play pronunciation", // TODO verify
  letters: "Letters", // TODO verify
};

const chrome: Record<UiLang, Chrome> = { en, to };

export function strings(direction: Direction): Chrome {
  return chrome[uiLang(direction)];
}
