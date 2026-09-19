import type { ProfessionPack } from "../../types";
import agriculture from "./agriculture.json";
import computerTerms from "./computer-terms.json";
import sdg from "./sdg.json";

// Register each profession pack here as it's added.
// Copy _template.json to get started with a new one.
export const professions: ProfessionPack[] = [
  agriculture as ProfessionPack,
  computerTerms as ProfessionPack,
  sdg as ProfessionPack,
];
