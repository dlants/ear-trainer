import { describe, expect, it } from "vitest";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import type { InventoryEntry } from "../inventory/entry.ts";
import type { PatternId } from "../music/note.ts";
import {
  type AddPatternsCtx,
  AddPatternsView,
  initialState,
  update,
} from "./add-patterns.ts";

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
    expect(state.rows.map((r) => [r.pattern.id, r.status])).toEqual([
      [INVENTORY[0].id, "proposed"],
      [INVENTORY[1].id, "proposed"],
    ]);
  });

  it("renders patterns with the shared notation view", () => {
    const state = initialState(makeCtx());
    const container = document.createElement("div");
    new AddPatternsView(container, () => {}, state);

    const firstRow = container.querySelector("li");
    const events = firstRow?.querySelectorAll("[data-notation-event]");
    expect(events).toHaveLength(3);
    expect(firstRow?.querySelectorAll("[data-notation-note]")).toHaveLength(3);
    expect(firstRow?.textContent).not.toContain("5-3-1");
  });

  it("shows a caret that rotates with the expanded state", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    const container = document.createElement("div");
    const view = new AddPatternsView(container, () => {}, state);
    const caret = container.querySelector(".summary > span");
    const collapsedClass = caret?.className;

    expect(caret?.querySelector("svg")).not.toBeNull();
    update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[0].id }, ctx);
    view.sync(state);

    expect(caret?.className).not.toBe(collapsedClass);
    expect(
      container
        .querySelector<HTMLButtonElement>(".toggle-details")
        ?.getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("toggles one expanded row at a time", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);

    update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[0].id }, ctx);
    expect(state.rows.map((row) => row.expanded)).toEqual([true, false]);

    update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[1].id }, ctx);
    expect(state.rows.map((row) => row.expanded)).toEqual([false, true]);

    update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[1].id }, ctx);
    expect(state.rows.map((row) => row.expanded)).toEqual([false, false]);
  });

  it("renders corpus and per-mode FSRS details with help tooltips", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
    const transcription = Object.values(ctx.deck.getState().cards).find(
      (card) =>
        card.patternId === INVENTORY[0].id && card.mode === "transcription",
    );
    if (!transcription) throw new Error("missing transcription card");
    ctx.deck.grade(transcription.id, "known", "got-it", ctx.now());

    const state = initialState(ctx);
    update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[0].id }, ctx);
    const container = document.createElement("div");
    new AddPatternsView(container, () => {}, state);

    const firstRow = container.querySelector("li");
    expect(firstRow?.textContent).toContain("Occurs 4 times in the corpus.");
    expect(
      [...(firstRow?.querySelectorAll("h3") ?? [])].map((heading) =>
        heading.textContent?.trim(),
      ),
    ).toEqual(["Transcription", "Audiation"]);
    expect(firstRow?.textContent).toContain("Estimated recall");
    expect(firstRow?.textContent).toContain("Stability");
    expect(firstRow?.textContent).toContain("Difficulty");
    expect(firstRow?.querySelectorAll('[role="tooltip"]')).toHaveLength(14);
    expect(firstRow?.textContent).toContain("2.3 days");
    expect(firstRow?.textContent).toContain("2.1 / 10");
    expect(firstRow?.textContent).toContain("Not available");
  });

  it("keeps row expansion separate from add and remove actions", () => {
    const state = initialState(makeCtx());
    const messages: unknown[] = [];
    const container = document.createElement("div");
    new AddPatternsView(container, (msg) => messages.push(msg), state);

    const firstRow = container.querySelector("li");
    firstRow
      ?.querySelector<HTMLButtonElement>('[aria-label="show card details"]')
      ?.click();
    firstRow
      ?.querySelector<HTMLButtonElement>("button.action:last-child")
      ?.click();

    expect(messages).toEqual([
      { type: "TOGGLE_DETAILS", id: INVENTORY[0].id },
      { type: "ADD_TO_DECK", id: INVENTORY[0].id },
    ]);
  });

  it("marks a pattern as in the deck regardless of where it was added", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    ctx.deck.addPattern("major-cadence|5-3-1" as PatternId, ctx.now());
    update(
      state,
      { type: "ADD_TO_DECK", id: "major-cadence|b3-2" as PatternId },
      ctx,
    );
    expect(state.rows.map((r) => r.status)).toEqual(["deck", "deck"]);
  });

  it("shows proposed cards and the deck by default, but hides known cards", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
    ctx.deck.addPattern(INVENTORY[1].id, ctx.now());
    ctx.deck.markPatternKnown(INVENTORY[1].id);
    const state = initialState(ctx);

    expect(state.showKnown).toBe(false);
    expect(state.showDeck).toBe(true);
    expect(
      state.rows.filter(
        (row) =>
          row.status === "proposed" ||
          (row.status === "deck" && state.showDeck) ||
          (row.status === "known" && state.showKnown),
      ),
    ).toEqual([expect.objectContaining({ id: INVENTORY[0].id })]);
  });

  it("filters known cards and the deck independently", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
    ctx.deck.addPattern(INVENTORY[1].id, ctx.now());
    ctx.deck.markPatternKnown(INVENTORY[1].id);
    const state = initialState(ctx);

    update(state, { type: "SET_SHOW_DECK", value: false }, ctx);
    update(state, { type: "SET_SHOW_KNOWN", value: true }, ctx);

    expect(state.showDeck).toBe(false);
    expect(state.showKnown).toBe(true);
  });

  it("removes a pattern from the deck and returns it to proposed", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
    const state = initialState(ctx);

    update(state, { type: "REMOVE_FROM_DECK", id: INVENTORY[0].id }, ctx);

    expect(state.rows[0]?.status).toBe("proposed");
    expect(Object.keys(ctx.deck.getState().cards)).toHaveLength(0);
  });

  it("marks a deck card known and hides it by default", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
    const state = initialState(ctx);

    update(state, { type: "MARK_KNOWN", id: INVENTORY[0].id }, ctx);

    expect(state.rows[0]?.status).toBe("known");
    expect(state.showKnown).toBe(false);
  });

  it("adding twice does not duplicate cards", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    const msg = { type: "ADD_TO_DECK", id: INVENTORY[0].id } as const;
    update(state, msg, ctx);
    const first = ctx.deck.getState().cards;
    const ids = Object.keys(first);
    update(state, msg, ctx);
    expect(Object.keys(ctx.deck.getState().cards)).toEqual(ids);
    expect(ids).toHaveLength(2);
  });
});
