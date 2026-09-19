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

export interface ProfessionPack {
  slug: string;
  name_en: string;
  name_to: string;
  entries: TermEntry[];
}
