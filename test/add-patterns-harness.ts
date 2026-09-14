/**
 * Browser-side fixtures for the add-patterns specs. The specs run their bodies
 * inside `page.evaluate`, so the shared setup has to live in a module the page
 * can import rather than in the Node-side test file.
 */
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import type { InventoryEntry } from "../inventory/entry.ts";
import type { PatternId } from "../music/note.ts";
import type { AddPatternsCtx } from "../views/add-patterns.ts";

export const INVENTORY: InventoryEntry[] = [
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

export function asPatternId(id: string): PatternId {
  return id as PatternId;
}

export function makeCtx(): AddPatternsCtx {
  return {
    deck: new DeckStore("p1", memoryStorage()),
    now: () => new Date("2026-01-01T00:00:00Z"),
    inventory: INVENTORY,
  };
}
