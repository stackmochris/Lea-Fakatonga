export type Theme = "light" | "dark";

const STORAGE_KEY = "lea-theme";

export function getStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "dark" || value === "light") return value;
  } catch {
    /* Private browsing can throw. */
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#100E0C" : "#C10000",
  );
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* Ignore quota or privacy errors. */
  }
}
