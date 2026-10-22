export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type Direction = "en-to" | "to-en";
export type TextSize = "normal" | "large";

const THEME_KEY = "lea-theme";
const DIRECTION_KEY = "lea-direction";
const TEXT_SIZE_KEY = "lea-text-size";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Ignore quota or privacy errors. */
  }
}

export function getStoredThemePreference(): ThemePreference {
  const value = read(THEME_KEY);
  if (value === "dark" || value === "light" || value === "system") return value;
  return "light";
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return preference;
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    resolved === "dark" ? "#100E0C" : "#C10020",
  );
  write(THEME_KEY, preference);
  return resolved;
}

export function getStoredDirection(): Direction {
  return read(DIRECTION_KEY) === "to-en" ? "to-en" : "en-to";
}

export function applyDirection(direction: Direction) {
  write(DIRECTION_KEY, direction);
}

export function getStoredTextSize(): TextSize {
  return read(TEXT_SIZE_KEY) === "large" ? "large" : "normal";
}

export function applyTextSize(size: TextSize) {
  if (size === "large") document.documentElement.dataset.textSize = "large";
  else delete document.documentElement.dataset.textSize;
  write(TEXT_SIZE_KEY, size);
}
