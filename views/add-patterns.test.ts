import { describe, expect, it } from "vitest";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import type { InventoryEntry } from "../inventory/entry.ts";
import type { PatternId } from "../music/note.ts";
import { type AddPatternsCtx, initialState, update } from "./add-patterns.ts";

const INVENTORY: InventoryEntry[] = [
  {
    id: "major-cadence|5-3-1" as PatternId,
    tier: 3,
    count: 4,
    gloss: "three notes of the tonic triad",
  },
  {
    id: "major-cadence|b3-2" as PatternId,
    tier: 2,
    count: 2,
    gloss: "two notes with a tendency tone",
  },
];

function memoryStorage(): KeyValueStore {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

function makeCtx(): AddPatternsCtx {
  return {
    deck: new DeckStore("p1", memoryStorage()),
    now: () => new Date("2026-01-01T00:00:00Z"),
    inventory: INVENTORY,
  };
}

describe("the add screen", () => {
  it("formats each entry and marks nothing added on an empty deck", () => {
    const state = initialState(makeCtx());
    expect(state.rows.map((r) => [r.label, r.added])).toEqual([
      ["5-3-1", false],
      ["♭3-2", false],
    ]);
  });

  it("marks a pattern added once it is in the deck, from any source", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    ctx.deck.addPattern("major-cadence|5-3-1" as PatternId, ctx.now());
    update(state, { type: "ADD", id: "major-cadence|b3-2" as PatternId }, ctx);
    expect(state.rows.map((r) => r.added)).toEqual([true, true]);
  });

  it("can hide patterns that are already in the card stack", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
    const state = initialState(ctx);

    update(state, { type: "SET_HIDE_ADDED", value: true }, ctx);

    expect(state.hideAdded).toBe(true);
    expect(state.rows.filter((row) => !state.hideAdded || !row.added)).toEqual([
      expect.objectContaining({ id: INVENTORY[1].id }),
    ]);
  });

  it("removes a pattern from the card stack", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
    const state = initialState(ctx);

    update(state, { type: "REMOVE", id: INVENTORY[0].id }, ctx);

    expect(state.rows[0]?.added).toBe(false);
    expect(Object.keys(ctx.deck.getState().cards)).toHaveLength(0);
  });

  it("adding twice does not duplicate cards", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    const msg = { type: "ADD", id: INVENTORY[0].id } as const;
    update(state, msg, ctx);
    const first = ctx.deck.getState().cards;
    const ids = Object.keys(first);
    update(state, msg, ctx);
    expect(Object.keys(ctx.deck.getState().cards)).toEqual(ids);
    expect(ids).toHaveLength(2);
  });
});
