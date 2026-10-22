import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ChevronLeft, CopyIcon } from "./Icons";

type Props = {
  open: boolean;
  subject: string;
  onClose: () => void;
  onCopy: () => void;
  onCover: (covered: boolean) => void;
  onExited: () => void;
  children: ReactNode;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Sheet({ open, subject, onClose, onCopy, onCover, onExited, children }: Props) {
  const [shown, setShown] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reduced = useRef(prefersReducedMotion());
  const backRef = useRef<HTMLButtonElement>(null);
  const onCoverRef = useRef(onCover);
  const onExitedRef = useRef(onExited);
  onCoverRef.current = onCover;
  onExitedRef.current = onExited;
  const track = useRef({ x: 0, y: 0, t: 0, lastX: 0, lastT: 0, active: false, horizontal: false, velocity: 0 });

  useEffect(() => {
    onCoverRef.current(open);
  }, [open]);

  useEffect(() => {
    if (open) {
      setDragX(0);
      if (reduced.current) {
        setShown(true);
        return;
      }
      setShown(false);
      const id = window.requestAnimationFrame(() => setShown(true));
      return () => window.cancelAnimationFrame(id);
    }
    setShown(false);
    setDragging(false);
    const timeout = window.setTimeout(() => onExitedRef.current(), reduced.current ? 0 : 240);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => backRef.current?.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.clientX > 24) return;
    track.current = {
      x: event.clientX,
      y: event.clientY,
      t: event.timeStamp,
      lastX: event.clientX,
      lastT: event.timeStamp,
      active: true,
      horizontal: false,
      velocity: 0,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const gesture = track.current;
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
    setDragX(Math.max(0, dx));
  }

  function onPointerUp() {
    const gesture = track.current;
    if (!gesture.active && !dragging) return;
    const width = window.innerWidth;
    const shouldClose = dragX > width * 0.33 || gesture.velocity > 0.5;
    gesture.active = false;
    setDragging(false);
    if (shouldClose) onClose();
    else setDragX(0);
  }

  const transform = shown ? `translateX(${dragX}px)` : "translateX(100%)";
  const duration = shown ? ".32s" : ".24s";

  return (
    <div
      className="sheet"
      role="dialog"
      aria-modal="true"
      aria-label={subject}
      style={{
        transform: reduced.current && shown ? "none" : transform,
        transition: dragging || reduced.current ? "none" : `transform ${duration} var(--ease)`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="sheet-bar">
        <button ref={backRef} type="button" className="sheet-back" onClick={onClose}>
          <ChevronLeft />
          <span>{subject}</span>
        </button>
        <button type="button" className="icon-btn" aria-label="Copy term" onClick={onCopy}>
          <CopyIcon />
        </button>
      </div>
      <div className="sheet-scroll">{children}</div>
    </div>
  );
}
