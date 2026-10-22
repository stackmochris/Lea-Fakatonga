import type { ProfessionPack } from "../../types";
import agriculture from "./agriculture.json";
import anthropology from "./anthropology.json";
import bodyParts from "./body-parts.json";
import chemistry from "./chemistry.json";
import computerTerms from "./computer-terms.json";
import economics from "./economics.json";
import humanResources from "./human-resources.json";
import medical from "./medical.json";
import nursing from "./nursing.json";
import physics from "./physics.json";
import sdg from "./sdg.json";
import theology from "./theology.json";
import tls from "./tls.json";

// Register each profession pack here as it's added.
// Copy _template.json to get started with a new one.
// Order follows the source glossary sheet. TNU is an empty tab and is omitted.
// Body parts is imported once; the sheet's Tongan-order tab is the same list.
export const professions: ProfessionPack[] = [
  anthropology as ProfessionPack,
  tls as ProfessionPack,
  nursing as ProfessionPack,
  chemistry as ProfessionPack,
  physics as ProfessionPack,
  theology as ProfessionPack,
  bodyParts as ProfessionPack,
  medical as ProfessionPack,
  humanResources as ProfessionPack,
  economics as ProfessionPack,
  sdg as ProfessionPack,
  agriculture as ProfessionPack,
  computerTerms as ProfessionPack,
];
