export type Page = "home" | "about" | "settings";

function decodePart(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function readRoute(): { page: Page; slug: string; id: string } {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const slash = raw.indexOf("/");
  const head = decodePart(slash === -1 ? raw : raw.slice(0, slash));
  const id = slash === -1 ? "" : decodePart(raw.slice(slash + 1));
  if (head === "about") return { page: "about", slug: "", id: "" };
  if (head === "settings") return { page: "settings", slug: "", id: "" };
  return { page: "home", slug: head, id };
}

export function routeHash(page: Page, slug: string, id: string | null) {
  if (page === "about") return "#/about";
  if (page === "settings") return "#/settings";
  return id ? `#/${slug}/${encodeURIComponent(id)}` : `#/${slug}`;
}
