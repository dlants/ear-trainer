import type { PatternId } from "../music/note.ts";

/**
 * Theory-derived tiers. Ordering is by tier first, corpus frequency second, so
 * frequency ranks *within* the pedagogical skeleton rather than overriding it.
 */
export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

export type InventoryEntry = {
  id: PatternId;
  tier: Tier;
  /** How many times the pattern occurs across the corpus. */
  count: number;
  gloss: string;
};

export const TIER_GLOSS: Record<Tier, string> = {
  0: "two notes of the tonic triad",
  1: "two notes, stepwise fill (2, 6)",
  2: "two notes with a tendency tone (4, 7)",
  3: "three notes of the tonic triad",
  4: "three notes, stepwise fill (2, 6)",
  5: "three notes with a tendency tone (4, 7)",
};
