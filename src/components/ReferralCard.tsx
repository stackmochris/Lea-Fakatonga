import { strings } from "../i18n";
import type { Direction } from "../preferences";
import type { SubjectReferral } from "../types";

type Props = {
  referral: SubjectReferral;
  direction: Direction;
};

export default function ReferralCard({ referral, direction }: Props) {
  const copy = strings(direction);
  const tongan = direction === "to-en";
  const note = tongan ? referral.note_to : referral.note_en;

  return (
    <section className="referral-card" aria-labelledby="referral-title">
      <h2 id="referral-title" className="referral-title" lang="to" translate="no">
        {referral.title}
      </h2>
      <p className="referral-subtitle" lang="en">
        {referral.subtitle}
      </p>
      <p className="referral-note" lang={tongan ? "to" : "en"} translate={tongan ? "no" : undefined}>
        {note}
      </p>
      <div className="referral-links">
        {referral.links.map((link) => (
          <a key={link.href} className="referral-link" href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
            <span className="sr-only"> ({copy.newTab})</span>
          </a>
        ))}
      </div>
    </section>
  );
}
