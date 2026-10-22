/** Original geometric motifs. The rhythm echoes ngatu borders; the drawing is not a kupesi. */

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#C10000" />
      <path d="M16 6.5 L25.5 16 L16 25.5 L6.5 16 Z" fill="none" stroke="#F8E6E6" strokeWidth="1.4" />
      <path d="M16 11.5 L20.5 16 L16 20.5 L11.5 16 Z" fill="#F8E6E6" />
    </svg>
  );
}

export function TapaMedallion() {
  return (
    <svg className="medallion" viewBox="0 0 120 120" aria-hidden="true">
      <path d="M60 8 L108 60 L60 112 L12 60 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M60 24 L94 60 L60 96 L26 60 Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M60 40 L80 60 L60 80 L40 60 Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M60 50 L70 60 L60 70 L50 60 Z" fill="currentColor" />
      <path d="M60 8 V16 M60 104 V112 M12 60 H20 M100 60 H108" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M34 22 L42 30 M26 30 L38 42 M86 22 L78 30 M94 30 L82 42 M34 98 L42 90 M26 90 L38 78 M86 98 L78 90 M94 90 L82 78"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="square"
      />
    </svg>
  );
}
