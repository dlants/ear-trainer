import { createEmptyCard, type Card as FsrsCard, fsrs } from "ts-fsrs";
import type { PatternId } from "../music/note.ts";
import {
  type CardId,
  type Confidence,
  type DeckCard,
  MODES,
  makeCardId,
  type Outcome,
  ratingFor,
  type TrialLogEntry,
} from "./card.ts";
import { cardsKey, logKey } from "./profiles.ts";

export type DeckState = {
  cards: Record<CardId, DeckCard>;
  log: TrialLogEntry[];
};

/** The slice of `Storage` the deck needs, so tests can pass a plain object. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const scheduler = fsrs();

const DATE_FIELDS = ["due", "last_review"] as const;

function reviveCard(raw: Record<string, unknown>): FsrsCard {
  const card = { ...raw } as Record<string, unknown>;
  for (const field of DATE_FIELDS) {
    const value = card[field];
    if (typeof value === "string") card[field] = new Date(value);
  }
  return card as unknown as FsrsCard;
}

export class DeckStore {
  private readonly cardsKey: string;
  private readonly logKey: string;
  private cards: Record<CardId, DeckCard>;
  private log: TrialLogEntry[];

  constructor(
    profileId: string,
    private readonly storage: KeyValueStore,
  ) {
    this.cardsKey = cardsKey(profileId);
    this.logKey = logKey(profileId);
    this.cards = this.readCards();
    this.log = this.readLog();
  }

  private readCards(): Record<CardId, DeckCard> {
    const raw = this.storage.getItem(this.cardsKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<
      string,
      { id: CardId; patternId: PatternId; mode: DeckCard["mode"]; fsrs: object }
    >;
    const cards: Record<CardId, DeckCard> = {};
    for (const [id, card] of Object.entries(parsed)) {
      cards[id as CardId] = {
        ...card,
        fsrs: reviveCard(card.fsrs as Record<string, unknown>),
      };
    }
    return cards;
  }

  private readLog(): TrialLogEntry[] {
    const raw = this.storage.getItem(this.logKey);
    return raw ? (JSON.parse(raw) as TrialLogEntry[]) : [];
  }

  private persist(): void {
    this.storage.setItem(this.cardsKey, JSON.stringify(this.cards));
    this.storage.setItem(this.logKey, JSON.stringify(this.log));
  }

  getState(): DeckState {
    return { cards: this.cards, log: this.log };
  }

  /** Idempotent: re-adding a pattern never resets existing scheduling state. */
  addPattern(patternId: PatternId, now: Date = new Date()): void {
    let added = false;
    for (const mode of MODES) {
      const id = makeCardId(patternId, mode);
      if (this.cards[id]) continue;
      this.cards[id] = {
        id,
        patternId,
        mode,
        fsrs: createEmptyCard(now),
      };
      added = true;
    }
    if (added) this.persist();
  }

  removePattern(patternId: PatternId): void {
    let removed = false;
    for (const mode of MODES) {
      const id = makeCardId(patternId, mode);
      if (!this.cards[id]) continue;
      delete this.cards[id];
      removed = true;
    }
    if (removed) this.persist();
  }

  nextDue(now: Date): DeckCard | undefined {
    let best: DeckCard | undefined;
    for (const card of Object.values(this.cards)) {
      if (card.fsrs.due.getTime() > now.getTime()) continue;
      if (!best || card.fsrs.due.getTime() < best.fsrs.due.getTime()) {
        best = card;
      }
    }
    return best;
  }

  grade(
    cardId: CardId,
    confidence: Confidence,
    outcome: Outcome,
    now: Date,
  ): void {
    const card = this.cards[cardId];
    if (!card) return;
    const { card: next } = scheduler.next(
      card.fsrs,
      now,
      ratingFor(confidence, outcome),
    );
    this.cards[cardId] = { ...card, fsrs: next };
    this.log.push({ cardId, at: now.getTime(), confidence, outcome });
    this.persist();
  }

  exportJson(): string {
    return JSON.stringify({ cards: this.cards, log: this.log });
  }
}
