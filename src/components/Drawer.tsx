import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { APP_NAME, APP_SUBTITLE, APP_VERSION } from "../brand";
import type { Direction } from "../preferences";
import type { Page } from "../route";
import type { ProfessionPack } from "../types";
import DirectionSeg from "./DirectionSeg";
import { AboutIcon, ChevronDown, HomeIcon, SettingsIcon, SubjectsIcon } from "./Icons";

type Props = {
  open: boolean;
  page: Page;
  slug: string;
  direction: Direction;
  professions: ProfessionPack[];
  returnFocus: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onHome: () => void;
  onAbout: () => void;
  onSettings: () => void;
  onSubject: (slug: string) => void;
  onDirection: (direction: Direction) => void;
};

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Drawer({
  open,
  page,
  slug,
  direction,
  professions,
  returnFocus,
  onClose,
  onHome,
  onAbout,
  onSettings,
  onSubject,
  onDirection,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, y: 0, lastX: 0, lastT: 0, active: false, horizontal: false, velocity: 0 });

  useEffect(() => {
    if (open) {
      setMounted(true);
      setOffset(0);
      if (reducedMotion()) {
        setShown(true);
        return;
      }
      setShown(false);
      let inner = 0;
      const outer = window.requestAnimationFrame(() => {
        inner = window.requestAnimationFrame(() => setShown(true));
      });
      return () => {
        window.cancelAnimationFrame(outer);
        window.cancelAnimationFrame(inner);
      };
    }
    setShown(false);
    setDragging(false);
    const timeout = window.setTimeout(() => setMounted(false), reducedMotion() ? 0 : 280);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 30);
    return () => {
      window.clearTimeout(timer);
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open, returnFocus]);

  if (!mounted) return null;

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

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastT: event.timeStamp,
      active: true,
      horizontal: false,
      velocity: 0,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture.active) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.horizontal) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        gesture.active = false;
        return;
      }
      gesture.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    const dt = event.timeStamp - gesture.lastT;
    if (dt > 0) gesture.velocity = (event.clientX - gesture.lastX) / dt;
    gesture.lastX = event.clientX;
    gesture.lastT = event.timeStamp;
    setOffset(Math.min(0, dx));
  }

  function onPointerUp() {
    const gesture = drag.current;
    if (!gesture.horizontal) {
      gesture.active = false;
      return;
    }
    gesture.active = false;
    setDragging(false);
    if (offset < -80 || gesture.velocity < -0.5) onClose();
    else setOffset(0);
  }

  const style =
    offset !== 0 || dragging
      ? { transform: `translateX(${offset}px)`, transition: dragging ? "none" : undefined }
      : undefined;

  return (
    <>
      <button
        type="button"
        className={shown ? "scrim is-in" : "scrim"}
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        id="app-drawer"
        className={shown ? "drawer is-in" : "drawer"}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        style={style}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="drawer-brand">
          <p className="drawer-name">{APP_NAME}</p>
          <p className="drawer-sub" lang="to" translate="no">
            {APP_SUBTITLE}
          </p>
        </div>
        <div className="drawer-scroll">
          <button type="button" className="drawer-link" aria-current={page === "home" ? "page" : undefined} onClick={onHome}>
            <HomeIcon />
            <span className="drawer-label">
              Home
              <span className="drawer-hint">Dictionary</span>
            </span>
          </button>
          <button
            type="button"
            className="drawer-link"
            aria-expanded={subjectsOpen}
            onClick={() => setSubjectsOpen((value) => !value)}
          >
            <SubjectsIcon />
            <span className="drawer-label">Subjects</span>
            <ChevronDown className={subjectsOpen ? "icon twist is-open" : "icon twist"} />
          </button>
          {subjectsOpen && (
            <div className="subject-list">
              {professions.map((pack) => (
                <button
                  key={pack.slug}
                  type="button"
                  className="subject-row"
                  aria-current={page === "home" && pack.slug === slug ? "true" : undefined}
                  onClick={() => onSubject(pack.slug)}
                >
                  <span>
                    <span className="subject-en">{pack.name_en}</span>
                    <span className="subject-to" lang="to" translate="no">
                      {pack.name_to}
                    </span>
                  </span>
                  <span className="subject-count">{pack.entries.length}</span>
                </button>
              ))}
            </div>
          )}
          <div className="drawer-direction">
            <p className="drawer-kicker">Direction</p>
            <DirectionSeg direction={direction} onChange={onDirection} />
          </div>
          <button type="button" className="drawer-link" aria-current={page === "settings" ? "page" : undefined} onClick={onSettings}>
            <SettingsIcon />
            <span className="drawer-label">Settings</span>
          </button>
          <button type="button" className="drawer-link" aria-current={page === "about" ? "page" : undefined} onClick={onAbout}>
            <AboutIcon />
            <span className="drawer-label">About</span>
          </button>
        </div>
        <p className="drawer-foot">
          <span className="num">v{APP_VERSION}</span>
          <span>{APP_NAME}</span>
          <span lang="to" translate="no">
            {APP_SUBTITLE}
          </span>
        </p>
      </div>
    </>
  );
}
