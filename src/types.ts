export interface TermEntry {
  id: string;
  en_term: string;
  to_term: string;
  en_definition: string;
  to_definition: string;
  category: string;
  en_example?: string;
  to_example?: string;
  prefix?: string;
  audio_url?: string;
  image_url?: string;
}

export interface ReferralLink {
  label: string;
  href: string;
}

/** A subject that stays in the list but shows a link instead of terms. */
export interface SubjectReferral {
  title: string;
  subtitle: string;
  note_en: string;
  note_to: string;
  links: ReferralLink[];
}

export interface ProfessionPack {
  slug: string;
  name_en: string;
  name_to: string;
  entries: TermEntry[];
  referral?: SubjectReferral;
}
