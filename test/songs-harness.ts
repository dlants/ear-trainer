/**
 * Browser-side fixtures for the song screen tests. `views/songs.ts` mounts a
 * stylesheet on import, so its specs run inside `page.evaluate` and share their
 * setup through a module the page can import.
 */
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import type { Song } from "../inventory/entry.ts";
import type { PatternId } from "../music/note.ts";
import type { SongsCtx } from "../views/songs.ts";

export const SONGS: Song[] = [
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

export function makeCtx(): SongsCtx {
  return {
    deck: new DeckStore("p1", memoryStorage()),
    now: () => new Date("2026-01-01T00:00:00Z"),
    songs: SONGS,
  };
}
