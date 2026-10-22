/** V1 pinwheel manulua. The plate is the old app mark; the hero uses the blades only. */
export function ManuluaMark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {!decorative && <rect width="100" height="100" fill="#F5EBDD" />}
      <g fill={decorative ? "currentColor" : "#C10020"}>
        <polygon points="50,50 10,10 50,10" />
        <polygon points="50,50 90,10 90,50" />
        <polygon points="50,50 90,90 50,90" />
        <polygon points="50,50 10,90 10,50" />
      </g>
      {!decorative && <rect x="4" y="4" width="92" height="92" fill="none" stroke="#3B1F14" strokeWidth="2" />}
    </svg>
  );
}

/** Faint nifo ʻanga accent along the foot of the hero. */
export function NifoStrip() {
  return <div className="nifo-strip" aria-hidden="true" />;
}
