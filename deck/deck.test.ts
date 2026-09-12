import { Rating } from "ts-fsrs";
import { describe, expect, it } from "vitest";
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

const now = new Date("2026-01-01T00:00:00Z");

describe("ratingFor", () => {
  const table: [Confidence, Outcome, Rating][] = [
    ["known", "got-it", Rating.Good],
    ["known", "missed", Rating.Again],
    ["unsure", "got-it", Rating.Again],
    ["unsure", "missed", Rating.Again],
  ];
  for (const [confidence, outcome, rating] of table) {
    it(`${confidence}+${outcome} is ${Rating[rating]}`, () => {
      expect(ratingFor(confidence, outcome)).toBe(rating);
    });
  }
});

describe("DeckStore", () => {
  it("addPattern creates one card per mode and is idempotent", () => {
    const store = new DeckStore("a", memoryStorage());
    store.addPattern(pattern.id, now);
    expect(Object.keys(store.getState().cards)).toHaveLength(2);

    store.grade(transcription, "known", "got-it", now);
    const due = store.getState().cards[transcription]?.fsrs.due;

    store.addPattern(pattern.id, now);
    expect(Object.keys(store.getState().cards)).toHaveLength(2);
    expect(store.getState().cards[transcription]?.fsrs.due).toEqual(due);
  });

  it("only known+got-it schedules further out", () => {
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

  it("grade writes exactly one log entry", () => {
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

  it("survives a persistence round-trip with Dates intact", () => {
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

  it("nextDue returns nothing when every card is in the future", () => {
    const store = new DeckStore("a", memoryStorage());
    expect(store.nextDue(now)).toBeUndefined();

    store.addPattern(pattern.id, now);
    expect(store.nextDue(now)?.id).toBe(transcription);

    store.grade(transcription, "known", "got-it", now);
    store.grade(makeCardId(pattern.id, "audiation"), "known", "got-it", now);
    expect(store.nextDue(now)).toBeUndefined();
  });

  it("exportJson includes cards and log", () => {
    const store = new DeckStore("a", memoryStorage());
    store.addPattern(pattern.id, now);
    store.grade(transcription, "known", "got-it", now);
    const parsed = JSON.parse(store.exportJson());
    expect(Object.keys(parsed.cards)).toHaveLength(2);
    expect(parsed.log).toHaveLength(1);
  });
});
