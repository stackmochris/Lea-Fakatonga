import { useEffect, useState, type RefObject } from "react";

type Options = {
  /** Phone listens to the window when this ref is empty. Desktop passes the list pane. */
  scrollerRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  forceShow: boolean;
  routeKey: string;
  headHeight?: number;
};

/**
 * Quick-return header. Hide when scrolling down, show when scrolling up.
 * The listener is passive and the read happens in rAF.
 */
export function useHideOnScroll({
  scrollerRef,
  enabled,
  forceShow,
  routeKey,
  headHeight = 56,
}: Options): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    if (!enabled || forceShow) return;

    const node = scrollerRef.current;
    const target: HTMLElement | Window = node ?? window;
    const read = () => (node ? node.scrollTop : window.scrollY);
    let last = read();
    let frame = 0;
    let queued = false;

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(() => {
        queued = false;
        const top = read();
        const delta = top - last;
        last = top;
        setHidden((current) => {
          if (top < headHeight) return false;
          if (delta > 6) return true;
          if (delta < -6) return false;
          return current;
        });
      });
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [scrollerRef, enabled, forceShow, routeKey, headHeight]);

  return hidden;
}
