/** Pinwheel manulua. Menu button and favicon only — never tiled. */
export function ManuluaMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill="#F5EBDD" />
      <g fill="#C10020">
        <polygon points="50,50 10,10 50,10" />
        <polygon points="50,50 90,10 90,50" />
        <polygon points="50,50 90,90 50,90" />
        <polygon points="50,50 10,90 10,50" />
      </g>
      <rect x="4" y="4" width="92" height="92" fill="none" stroke="#3B1F14" strokeWidth="2" />
    </svg>
  );
}

/** Foʻi hea: three triangles, used as a small accent. */
export function FoiHea({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 104 38" aria-hidden="true">
      <polygon className="foi-up" points="2,36 22,2 42,36" />
      <polygon className="foi-down" points="32,2 52,36 72,2" />
      <polygon className="foi-up" points="62,36 82,2 102,36" />
    </svg>
  );
}
