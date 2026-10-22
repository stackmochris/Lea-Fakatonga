import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import type { Page } from "../route";
import { CloseIcon } from "./Icons";

type Props = {
  open: boolean;
  page: Page;
  returnFocus: RefObject<HTMLButtonElement>;
  onClose: () => void;
  onNavigate: (page: Page) => void;
};

const LINKS: { page: Page; label: string }[] = [
  { page: "home", label: "Home" },
  { page: "about", label: "About" },
  { page: "settings", label: "Settings" },
];

export default function Drawer({ open, page, returnFocus, onClose, onNavigate }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus();
    };
  }, [open, returnFocus]);

  if (!open) return null;

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const nodes = [...dialogRef.current.querySelectorAll<HTMLElement>("button, a, [href]")].filter(
      (node) => !node.hasAttribute("disabled"),
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <div className="drawer-backdrop" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        id="app-drawer"
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="drawer-head">
          <h2 id="drawer-title">Menu</h2>
          <button type="button" className="drawer-close" aria-label="Close menu" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <nav className="drawer-nav" aria-label="Pages">
          {LINKS.map((link) => (
            <button
              key={link.page}
              type="button"
              className="drawer-link"
              aria-current={page === link.page ? "page" : undefined}
              onClick={() => onNavigate(link.page)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
