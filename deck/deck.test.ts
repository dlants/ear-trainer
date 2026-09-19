import { expect, test } from "@playwright/test";
import { Rating, State } from "ts-fsrs";
import { makePattern } from "../music/note.ts";
import {
  type Confidence,
  makeCardId,
  type Outcome,
  ratingFor,
} from "./card.ts";
import { DeckStore, type KeyValueStore } from "./store.ts";

function memoryStorage(): KeyValueStore & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

const pattern = makePattern("major-cadence", [
  { notes: [{ degree: 1, alteration: 0, octave: 0 }] },
  { notes: [{ degree: 3, alteration: 0, octave: 0 }] },
]);
const transcription = makeCardId(pattern.id, "transcription");
const octaveVariant = makePattern("major-cadence", [
  { notes: [{ degree: 1, alteration: 0, octave: 1 }] },
  { notes: [{ degree: 3, alteration: 0, octave: -1 }] },
]);
const secondPattern = makePattern("major-cadence", [
  { notes: [{ degree: 5, alteration: 0, octave: 0 }] },
  { notes: [{ degree: 3, alteration: 0, octave: 0 }] },
]);
const thirdPattern = makePattern("major-cadence", [
  { notes: [{ degree: 4, alteration: 0, octave: 0 }] },
  { notes: [{ degree: 2, alteration: 0, octave: 0 }] },
]);

const now = new Date("2026-01-01T00:00:00Z");

test.describe("ratingFor", () => {
  const table: [Confidence, Outcome, Rating][] = [
    ["known", "got-it", Rating.Good],
    ["known", "missed", Rating.Again],
    ["unsure", "got-it", Rating.Again],
    ["unsure", "missed", Rating.Again],
  ];
  for (const [confidence, outcome, rating] of table) {
    test(`${confidence}+${outcome} is ${Rating[rating]}`, () => {
      expect(ratingFor(confidence, outcome)).toBe(rating);
    });
  }
});

test.describe("DeckStore", () => {
  test("addPattern creates one card per mode and is idempotent", () => {
    const store = new DeckStore("a", memoryStorage());
    store.addPattern(pattern.id, now);
    expect(Object.keys(store.getState().cards)).toHaveLength(2);

    store.grade(transcription, "known", "got-it", now);
    const due = store.getState().cards[transcription]?.fsrs.due;

    store.addPattern(pattern.id, now);
    expect(Object.keys(store.getState().cards)).toHaveLength(2);
    expect(store.getState().cards[transcription]?.fsrs.due).toEqual(due);
  });

  test("projects per-mode FSRS progress without assigning recall to new cards", () => {
    const store = new DeckStore("a", memoryStorage());
    expect(store.progressForPattern(pattern.id, now)).toEqual([]);

    store.addPattern(pattern.id, now);
    expect(store.progressForPattern(pattern.id, now)).toEqual([
      expect.objectContaining({
        mode: "transcription",
        state: State.New,
        retrievability: undefined,
        reps: 0,
        lapses: 0,
        stability: 0,
        difficulty: 0,
      }),
      expect.objectContaining({
        mode: "audiation",
        state: State.New,
        retrievability: undefined,
      }),
    ]);

    store.grade(transcription, "known", "got-it", now);
    const progress = store.progressForPattern(
      pattern.id,
      new Date("2026-01-01T00:05:00Z"),
    );
    expect(progress[0]).toEqual(
      expect.objectContaining({
        mode: "transcription",
        state: State.Learning,
        reps: 1,
        retrievability: expect.any(Number),
      }),
    );
    expect(progress[1]?.retrievability).toBeUndefined();
  });

  test("moves a pattern between the deck and known without resetting progress", () => {
    const storage = memoryStorage();
    const store = new DeckStore("a", storage);
    store.addPattern(pattern.id, now);
    store.grade(transcription, "known", "got-it", now);
    const due = store.getState().cards[transcription]?.fsrs.due;

    store.markPatternKnown(pattern.id);

    expect(store.patternStatus(pattern.id)).toBe("known");
    expect(store.nextDue(now)).toBeUndefined();
    expect(new DeckStore("a", storage).patternStatus(pattern.id)).toBe("known");

    store.addPattern(pattern.id, now);

    expect(store.patternStatus(pattern.id)).toBe("deck");
    expect(store.getState().cards[transcription]?.fsrs.due).toEqual(due);
  });

  test("loads cards written before statuses existed as deck cards", () => {
    const storage = memoryStorage();
    const store = new DeckStore("a", storage);
    store.addPattern(pattern.id, now);
    const persisted = JSON.parse(
      storage.data["profile:a:cards"] ?? "{}",
    ) as Record<string, { status?: string }>;
    for (const card of Object.values(persisted)) delete card.status;
    storage.data["profile:a:cards"] = JSON.stringify(persisted);

    expect(new DeckStore("a", storage).patternStatus(pattern.id)).toBe("deck");
  });

  test("removePattern removes both modes and persists the change", () => {
    const storage = memoryStorage();
    const store = new DeckStore("a", storage);
    store.addPattern(pattern.id, now);

    store.removePattern(pattern.id);

    expect(Object.keys(store.getState().cards)).toHaveLength(0);
    expect(
      Object.keys(new DeckStore("a", storage).getState().cards),
    ).toHaveLength(0);
  });

  test("only known+got-it schedules further out", () => {
    const dueAfter = (confidence: Confidence, outcome: Outcome): number => {
      const store = new DeckStore("a", memoryStorage());
      store.addPattern(pattern.id, now);
      store.grade(transcription, confidence, outcome, now);
      const card = store.getState().cards[transcription];
      if (!card) throw new Error("missing card");
      return card.fsrs.due.getTime();
    };
    const good = dueAfter("known", "got-it");
    expect(dueAfter("known", "missed")).toBeLessThan(good);
    expect(dueAfter("unsure", "got-it")).toBeLessThan(good);
    expect(dueAfter("unsure", "missed")).toBeLessThan(good);
  });

  test("grade writes exactly one log entry", () => {
    const store = new DeckStore("a", memoryStorage());
    store.addPattern(pattern.id, now);
    store.grade(transcription, "unsure", "got-it", now);
    expect(store.getState().log).toEqual([
      {
        cardId: transcription,
        at: now.getTime(),
        confidence: "unsure",
        outcome: "got-it",
      },
    ]);
  });

  test("survives a persistence round-trip with Dates intact", () => {
    const storage = memoryStorage();
    const store = new DeckStore("a", storage);
    store.addPattern(pattern.id, now);
    store.grade(transcription, "known", "got-it", now);

    const reloaded = new DeckStore("a", storage);
    const before = store.getState().cards[transcription];
    const after = reloaded.getState().cards[transcription];
    expect(after?.fsrs.due).toBeInstanceOf(Date);
    expect(after?.fsrs.last_review).toBeInstanceOf(Date);
    expect(after).toEqual(before);
    expect(reloaded.getState().log).toEqual(store.getState().log);
  });

  test("keeps reverse cards apart when other cards are due", () => {
    const store = new DeckStore("a", memoryStorage());
    for (const candidate of [pattern, secondPattern, thirdPattern]) {
      store.addPattern(candidate.id, now);
    }

    const selectedPatternIds = [];
    for (let index = 0; index < 4; index += 1) {
      const card = store.nextDue(now);
      if (!card) throw new Error("missing due card");
      selectedPatternIds.push(card.patternId);
      store.grade(card.id, "known", "got-it", now);
    }

    expect(selectedPatternIds).toEqual([
      pattern.id,
      secondPattern.id,
      thirdPattern.id,
      pattern.id,
    ]);
  });

  test("treats octave variants as siblings", () => {
    const store = new DeckStore("a", memoryStorage());
    for (const candidate of [pattern, octaveVariant, secondPattern]) {
      store.addPattern(candidate.id, now);
    }

    const first = store.nextDue(now);
    if (!first) throw new Error("missing due card");
    store.grade(first.id, "known", "got-it", now);

    expect(store.nextDue(now)?.patternId).toBe(secondPattern.id);
  });

  test("falls back to a recent sibling when no other card is due", () => {
    const store = new DeckStore("a", memoryStorage());
    store.addPattern(pattern.id, now);
    store.grade(transcription, "known", "got-it", now);

    expect(store.nextDue(now)?.id).toBe(makeCardId(pattern.id, "audiation"));
  });

  test("leastConfident selects the deck card with the lowest retrievability", () => {
    const store = new DeckStore("a", memoryStorage());
    store.addPattern(pattern.id, now);
    store.addPattern(secondPattern.id, now);
    const cards = Object.values(store.getState().cards);
    for (const card of cards) {
      card.fsrs.state = State.Review;
      card.fsrs.last_review = new Date("2025-12-31T00:00:00Z");
      card.fsrs.due = new Date("2026-02-01T00:00:00Z");
      card.fsrs.stability = 100;
    }
    const weakest = store.getState().cards[transcription];
    if (!weakest) throw new Error("missing card");
    weakest.fsrs.last_review = new Date("2025-01-01T00:00:00Z");
    weakest.fsrs.stability = 1;

    expect(store.nextDue(now)).toBeUndefined();
    expect(store.leastConfident(now)?.id).toBe(transcription);
  });

  test("nextDue returns nothing when every card is in the future", () => {
    const store = new DeckStore("a", memoryStorage());
    expect(store.nextDue(now)).toBeUndefined();

    store.addPattern(pattern.id, now);
    expect(store.nextDue(now)?.id).toBe(transcription);

    store.grade(transcription, "known", "got-it", now);
    store.grade(makeCardId(pattern.id, "audiation"), "known", "got-it", now);
    expect(store.nextDue(now)).toBeUndefined();
  });

  test("exportJson includes cards and log", () => {
    const store = new DeckStore("a", memoryStorage());
    store.addPattern(pattern.id, now);
    store.grade(transcription, "known", "got-it", now);
    const parsed = JSON.parse(store.exportJson());
    expect(Object.keys(parsed.cards)).toHaveLength(2);
    expect(parsed.log).toHaveLength(1);
  });
});
