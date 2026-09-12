import { describe, expect, it } from "vitest";
import { patternFromId } from "../music/format.ts";
import { deriveInventory } from "../scripts/derive-inventory.ts";
import { CORPUS, type CorpusMelody } from "./corpus.ts";
import { INVENTORY } from "./patterns.ts";
import { SONGS } from "./songs.ts";

const FIXTURE: CorpusMelody[] = [
  {
    id: "a",
    title: "A",
    context: "major-cadence",
    melody: "1-3-5-1-3-5-4-7-4-7",
  },
  {
    id: "b",
    title: "B",
    context: "major-cadence",
    melody: "1-3-1-3-2-1-2-1",
  },
];

describe("deriveInventory", () => {
  const entries = deriveInventory(FIXTURE, { lengths: [2], minCount: 2 });

  it("ranks by frequency within theory tiers", () => {
    expect(entries.map((e) => [e.id, e.tier, e.count])).toEqual([
      ["major-cadence|1-3", 0, 4],
      ["major-cadence|3-5", 0, 2],
      ["major-cadence|2-1", 1, 2],
      ["major-cadence|4-7", 2, 2],
    ]);
  });

  it("drops patterns below the minimum count", () => {
    expect(entries.map((e) => e.id)).not.toContain("major-cadence|3-1");
  });
});

describe("the generated inventory", () => {
  it("round-trips every id through the parser", () => {
    for (const entry of INVENTORY) {
      const parsed = patternFromId(entry.id);
      expect(parsed.ok, entry.id).toBe(true);
      if (parsed.ok) expect(parsed.value.id).toBe(entry.id);
    }
  });

  it("is ordered by tier", () => {
    const tiers = INVENTORY.map((e) => e.tier);
    expect([...tiers].sort((a, b) => a - b)).toEqual(tiers);
  });
});

describe("the generated songs", () => {
  const ids = new Set(INVENTORY.map((e) => e.id));

  it("reference only inventory patterns", () => {
    for (const song of SONGS)
      for (const id of song.patternIds) expect(ids.has(id), id).toBe(true);
  });

  it("decompose every corpus melody into at least one pattern", () => {
    expect(SONGS).toHaveLength(CORPUS.length);
    for (const song of SONGS)
      expect(song.patternIds.length, song.id).toBeGreaterThan(0);
  });
});
