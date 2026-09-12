import { describe, expect, it } from "vitest";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import type { Song } from "../inventory/entry.ts";
import type { PatternId } from "../music/note.ts";
import { initialState, type SongsCtx, update } from "./songs.ts";

const SONGS: Song[] = [
  {
    id: "a",
    title: "A",
    context: "major-cadence",
    patternIds: [
      "major-cadence|1-2-3",
      "major-cadence|3-2-1",
      "major-cadence|1-2-3",
    ] as PatternId[],
  },
  {
    id: "b",
    title: "B",
    context: "major-cadence",
    patternIds: ["major-cadence|1-2-3"] as PatternId[],
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

function makeCtx(): SongsCtx {
  return {
    deck: new DeckStore("p1", memoryStorage()),
    now: () => new Date("2026-01-01T00:00:00Z"),
    songs: SONGS,
  };
}

describe("the song screen", () => {
  it("lists each song's distinct patterns and hides the decomposition until complete", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    update(state, { type: "SELECT", songId: "a" }, ctx);
    const song = state.songs[0];
    expect(song.patterns.map((p) => p.label)).toEqual(["1-2-3", "3-2-1"]);
    expect(song.knownCount).toBe(0);
    expect(song.decomposition).toBe("");
  });

  it("shows the full decomposition, repeats included, once every pattern is known", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    update(state, { type: "ADD_ALL", songId: "a" }, ctx);
    expect(state.songs[0].decomposition).toBe("1-2-3  ·  3-2-1  ·  1-2-3");
  });

  it("marks a pattern known in every song that references it", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    update(state, { type: "ADD", id: SONGS[0].patternIds[0] }, ctx);
    expect(state.songs[1].patterns[0].added).toBe(true);
    expect(state.songs[1].knownCount).toBe(1);
  });

  it("reflects a pattern added from outside the song screen", () => {
    const ctx = makeCtx();
    ctx.deck.addPattern("major-cadence|3-2-1" as PatternId, ctx.now());
    const state = initialState(ctx);
    expect(state.songs[0].knownCount).toBe(1);
  });

  it("selecting toggles, and only one song is open at a time", () => {
    const ctx = makeCtx();
    const state = initialState(ctx);
    update(state, { type: "SELECT", songId: "a" }, ctx);
    update(state, { type: "SELECT", songId: "b" }, ctx);
    expect(state.songs.map((s) => s.selected)).toEqual([false, true]);
    update(state, { type: "SELECT", songId: "b" }, ctx);
    expect(state.songs.map((s) => s.selected)).toEqual([false, false]);
  });
});
