import { type Card as FsrsCard, Rating } from "ts-fsrs";
import type { PatternId } from "../music/note.ts";

export type Mode = "transcription" | "audiation";
export const MODES: Mode[] = ["transcription", "audiation"];

export type CardId = string & { readonly __brand: "CardId" };
export type Confidence = "known" | "unsure";
export type Outcome = "got-it" | "missed";

export type CardStatus = "deck" | "known";

export type DeckCard = {
  id: CardId;
  patternId: PatternId;
  mode: Mode;
  status: CardStatus;
  fsrs: FsrsCard;
};

export type TrialLogEntry = {
  cardId: CardId;
  at: number;
  confidence: Confidence;
  outcome: Outcome;
};

export function makeCardId(patternId: PatternId, mode: Mode): CardId {
  return `${patternId}|${mode}` as CardId;
}

/**
 * Only a confident, correct retrieval counts as a success. Everything else —
 * including a lucky guess — is a lapse.
 */
export function ratingFor(
  confidence: Confidence,
  outcome: Outcome,
): Rating.Good | Rating.Again {
  return confidence === "known" && outcome === "got-it"
    ? Rating.Good
    : Rating.Again;
}
