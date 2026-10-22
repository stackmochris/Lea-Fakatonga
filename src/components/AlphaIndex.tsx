import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type ScrubLetter = {
  label: string;
  enabled: boolean;
  targetId: string;
};

type Props = {
  letters: ScrubLetter[];
  wide: boolean;
  label: string;
  onScrubbing: (active: boolean) => void;
};

function nearestEnabled(letters: ScrubLetter[], index: number): ScrubLetter | null {
  if (letters[index]?.enabled) return letters[index];
  for (let step = 1; step < letters.length; step += 1) {
    if (letters[index - step]?.enabled) return letters[index - step];
    if (letters[index + step]?.enabled) return letters[index + step];
  }
  return null;
}

export default function AlphaIndex({ letters, wide, label, onScrubbing }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const dragging = useRef(false);
  const lastLabel = useRef("");
  const [current, setCurrent] = useState("");
  const [bubble, setBubble] = useState<{ label: string; y: number } | null>(null);

  useEffect(() => {
    const scroller: HTMLElement | Window | null = wide ? document.querySelector<HTMLElement>(".list-scroll") : window;
    if (!scroller) return;
    let frame = 0;
    let queued = false;

    const update = () => {
      queued = false;
      if (dragging.current) return;
      const line = anchorLine() + 1;
      let active = "";
      document.querySelectorAll<HTMLElement>(".letter-head").forEach((el) => {
        if (el.getBoundingClientRect().top <= line) active = el.dataset.letter || active;
      });
      if (active) setCurrent(active);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(update);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [letters, wide]);

  function anchorLine() {
    if (wide) {
      const scroller = document.querySelector<HTMLElement>(".list-scroll");
      return scroller?.getBoundingClientRect().top ?? 0;
    }
    const bar = document.querySelector(".topbar");
    return bar?.getBoundingClientRect().bottom ?? 0;
  }

  function jump(letter: ScrubLetter) {
    const el = document.getElementById(letter.targetId);
    const scroller = wide ? document.querySelector<HTMLElement>(".list-scroll") : document.scrollingElement;
    if (!el || !scroller) return;
    const delta = el.getBoundingClientRect().top - anchorLine();
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: "auto" });
  }

  function pick(clientY: number): ScrubLetter | null {
    const nav = navRef.current;
    if (!nav || letters.length === 0) return null;
    const buttons = [...nav.querySelectorAll<HTMLButtonElement>("button")];
    if (buttons.length === 0) return null;
    let index = 0;
    let best = Number.POSITIVE_INFINITY;
    buttons.forEach((button, i) => {
      const rect = button.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - mid);
      if (dist < best) {
        best = dist;
        index = i;
      }
    });
    const first = buttons[0].getBoundingClientRect();
    const last = buttons[buttons.length - 1].getBoundingClientRect();
    if (clientY <= first.top) index = 0;
    else if (clientY >= last.bottom) index = buttons.length - 1;
    return nearestEnabled(letters, index);
  }

  function seek(clientY: number) {
    const letter = pick(clientY);
    if (!letter) return;
    if (letter.label !== lastLabel.current) {
      lastLabel.current = letter.label;
      setCurrent(letter.label);
      const vibe = navigator as Navigator & { vibrate?: (ms: number) => boolean };
      vibe.vibrate?.(5);
    }
    setBubble({ label: letter.label, y: clientY });
    jump(letter);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging.current = true;
    navRef.current?.setPointerCapture(event.pointerId);
    onScrubbing(true);
    seek(event.clientY);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!dragging.current) return;
    seek(event.clientY);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    lastLabel.current = "";
    setBubble(null);
    onScrubbing(false);
  }

  return (
    <>
      <nav
        ref={navRef}
        className="alpha"
        role="navigation"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {letters.map((letter) => (
          <button
            key={letter.label}
            type="button"
            data-letter={letter.label}
            className={letter.label === current ? "is-current" : undefined}
            disabled={!letter.enabled}
            aria-label={letter.label}
            onClick={() => {
              if (!letter.enabled) return;
              setCurrent(letter.label);
              jump(letter);
            }}
          >
            {letter.label}
          </button>
        ))}
      </nav>
      {bubble && (
        <div className="alpha-bubble" style={{ top: bubble.y }} aria-hidden="true">
          {bubble.label}
        </div>
      )}
    </>
  );
}
