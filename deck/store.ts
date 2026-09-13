import {
  createEmptyCard,
  type Card as FsrsCard,
  State as FsrsState,
  fsrs,
} from "ts-fsrs";
import type { PatternId } from "../music/note.ts";
import {
  type CardId,
  type CardStatus,
  type Confidence,
  type DeckCard,
  MODES,
  type Mode,
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
export type PatternStatus = "proposed" | CardStatus;

export type CardProgress = {
  mode: Mode;
  state: FsrsState;
  due: Date;
  retrievability: number | undefined;
  reps: number;
  lapses: number;
  stability: number;
  difficulty: number;
};

/** The slice of `Storage` the deck needs, so tests can pass a plain object. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const scheduler = fsrs();

const DATE_FIELDS = ["due", "last_review"] as const;

function siblingKey(patternId: PatternId): string {
  const separator = patternId.indexOf("|");
  const context = patternId.slice(0, separator + 1);
  const body = patternId
    .slice(separator + 1)
    .replaceAll("^", "")
    .replaceAll("v", "");
  return context + body;
}

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
      {
        id: CardId;
        patternId: PatternId;
        mode: DeckCard["mode"];
        status?: CardStatus;
        fsrs: object;
      }
    >;
    const cards: Record<CardId, DeckCard> = {};
    for (const [id, card] of Object.entries(parsed)) {
      cards[id as CardId] = {
        ...card,
        status: card.status ?? "deck",
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

  progressForPattern(patternId: PatternId, now: Date): CardProgress[] {
    const progress: CardProgress[] = [];
    for (const mode of MODES) {
      const card = this.cards[makeCardId(patternId, mode)];
      if (!card) continue;
      progress.push({
        mode,
        state: card.fsrs.state,
        due: card.fsrs.due,
        retrievability:
          card.fsrs.state === FsrsState.New
            ? undefined
            : scheduler.get_retrievability(card.fsrs, now, false),
        reps: card.fsrs.reps,
        lapses: card.fsrs.lapses,
        stability: card.fsrs.stability,
        difficulty: card.fsrs.difficulty,
      });
    }
    return progress;
  }

  patternStatus(patternId: PatternId): PatternStatus {
    const cards = MODES.map((mode) => this.cards[makeCardId(patternId, mode)]);
    if (cards.some((card) => card?.status === "deck")) return "deck";
    if (cards.some((card) => card?.status === "known")) return "known";
    return "proposed";
  }

  /** Idempotent: re-adding a pattern never resets existing scheduling state. */
  addPattern(patternId: PatternId, now: Date = new Date()): void {
    let changed = false;
    for (const mode of MODES) {
      const id = makeCardId(patternId, mode);
      const existing = this.cards[id];
      if (existing) {
        if (existing.status === "known") {
          this.cards[id] = { ...existing, status: "deck" };
          changed = true;
        }
        continue;
      }
      this.cards[id] = {
        id,
        patternId,
        mode,
        status: "deck",
        fsrs: createEmptyCard(now),
      };
      changed = true;
    }
    if (changed) this.persist();
  }

  markPatternKnown(patternId: PatternId): void {
    let changed = false;
    for (const mode of MODES) {
      const id = makeCardId(patternId, mode);
      const card = this.cards[id];
      if (!card || card.status === "known") continue;
      this.cards[id] = { ...card, status: "known" };
      changed = true;
    }
    if (changed) this.persist();
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

  nextDue(now: Date, siblingGap = 2): DeckCard | undefined {
    const recentSiblingKeys = new Set(
      this.log
        .slice(-siblingGap)
        .map(({ cardId }) => this.cards[cardId]?.patternId)
        .filter((patternId) => patternId !== undefined)
        .map(siblingKey),
    );
    let best: DeckCard | undefined;
    let bestWithoutRecentSibling: DeckCard | undefined;
    for (const card of Object.values(this.cards)) {
      if (card.status !== "deck") continue;
      if (card.fsrs.due.getTime() > now.getTime()) continue;
      if (!best || card.fsrs.due.getTime() < best.fsrs.due.getTime()) {
        best = card;
      }
      if (
        !recentSiblingKeys.has(siblingKey(card.patternId)) &&
        (!bestWithoutRecentSibling ||
          card.fsrs.due.getTime() < bestWithoutRecentSibling.fsrs.due.getTime())
      ) {
        bestWithoutRecentSibling = card;
      }
    }
    return bestWithoutRecentSibling ?? best;
  }

  grade(
    cardId: CardId,
    confidence: Confidence,
    outcome: Outcome,
    now: Date,
  ): void {
    const card = this.cards[cardId];
    if (card?.status !== "deck") return;
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
