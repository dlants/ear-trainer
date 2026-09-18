import { expect, test } from "@playwright/test";
import type { Phrase, TimedEvent } from "./melody.ts";
import type { Degree, Note } from "./note.ts";
import {
  findSituationOccurrences,
  phraseMatchesSituation,
  promptDegreesForSituations,
  SITUATIONS,
  type SituationId,
} from "./situations.ts";

function note(
  degree: Degree,
  octave = 0,
  alteration: Note["alteration"] = 0,
): Note {
  return { degree, alteration, octave };
}

function phrase(events: readonly (Note | Note[])[]): Phrase {
  const timedEvents: TimedEvent[] = events.map((entry, index) => ({
    notes: Array.isArray(entry) ? entry : [entry],
    onsetTicks: index * 24,
    durationTicks: 24,
  }));
  return {
    id: "fixture:phrase-1",
    melodyId: "fixture",
    phraseIndex: 0,
    noteIdentification: "independent",
    rationale: "Test fixture.",
    context: "major-cadence",
    tempoBpm: 96,
    durationTicks: timedEvents.length * 24,
    voices: [{ id: "melody", events: timedEvents }],
    measures: [
      {
        startTicks: 0,
        endTicks: timedEvents.length * 24,
        beatDurationsTicks: [timedEvents.length * 24],
      },
    ],
  };
}

function indexes(phraseFixture: Phrase, situationId: SituationId): number[][] {
  return findSituationOccurrences(phraseFixture, situationId).map((found) => [
    ...found.eventIndexes,
  ]);
}

test.describe("musical situations", () => {
  test("checks in the complete catalog and degree sets", () => {
    expect(SITUATIONS.map(({ id, degrees }) => [id, degrees])).toEqual([
      ["tonic", [1]],
      ["dominant-adjacent-tonic", [1, 5]],
      ["third-adjacent-tonic", [1, 3]],
      ["tonic-triad-movement", [1, 3, 5]],
      ["stepwise-2", [1, 2, 3]],
      ["stepwise-4", [3, 4, 5]],
      ["seventh-adjacent-tonic", [1, 7]],
      ["stepwise-6", [5, 6, 7]],
      ["stepwise-7", [1, 6, 7]],
      ["stepwise-1", [1, 2, 7]],
      ["stepwise-3", [2, 3, 4]],
      ["stepwise-5", [4, 5, 6]],
    ]);
  });

  test("finds tonic and both temporal directions of every pair situation", () => {
    expect(indexes(phrase([note(2), note(1), note(3)]), "tonic")).toEqual([
      [1],
    ]);
    for (const [situationId, first, second] of [
      ["dominant-adjacent-tonic", note(1), note(5, -1)],
      ["third-adjacent-tonic", note(1), note(3, -1)],
      ["seventh-adjacent-tonic", note(1), note(7, -1)],
    ] as const) {
      expect(indexes(phrase([first, second]), situationId)).toEqual([[0, 1]]);
      expect(indexes(phrase([second, first]), situationId)).toEqual([[0, 1]]);
    }
  });

  test("finds every valid stepwise neighbor combination inside longer melodies", () => {
    for (const [situationId, center, lower, upper, centerOctave] of [
      ["stepwise-2", 2, 1, 3, 0],
      ["stepwise-4", 4, 3, 5, 0],
      ["stepwise-6", 6, 5, 7, 0],
      ["stepwise-7", 7, 6, 1, 0],
      ["stepwise-1", 1, 7, 2, 0],
      ["stepwise-3", 3, 2, 4, 0],
      ["stepwise-5", 5, 4, 6, 0],
    ] as const) {
      const neighborNote = (degree: Degree) => {
        if (center === 7 && degree === 1) return note(1, 1);
        if (center === 1 && degree === 7) return note(7, -1);
        return note(degree, centerOctave);
      };
      for (const [before, after] of [
        [lower, lower],
        [lower, upper],
        [upper, lower],
        [upper, upper],
      ] as const) {
        const fixture = phrase([
          note(5, -2),
          neighborNote(before),
          note(center, centerOctave),
          neighborNote(after),
          note(5, 2),
        ]);
        expect(indexes(fixture, situationId), situationId).toEqual([[1, 2, 3]]);
      }
    }
  });

  test("finds overlapping triad-only runs once all three degrees appear", () => {
    const fixture = phrase(
      [1, 3, 5, 3, 5, 1].map((degree) => note(degree as Degree)),
    );
    const found = indexes(fixture, "tonic-triad-movement");
    expect(found).toContainEqual([0, 1, 2]);
    expect(found).toContainEqual([0, 1, 2, 3, 4, 5]);
    expect(found).toContainEqual([1, 2, 3, 4, 5]);
    expect(phraseMatchesSituation(fixture, "tonic-triad-movement")).toBe(true);
  });

  test("rejects incomplete or interrupted tonic-triad runs", () => {
    expect(
      phraseMatchesSituation(
        phrase([note(1), note(3), note(3), note(1)]),
        "tonic-triad-movement",
      ),
    ).toBe(false);
    for (const interruption of [note(2), note(3, 0, 1), [note(3), note(5)]]) {
      expect(
        phraseMatchesSituation(
          phrase([note(1), interruption, note(5)]),
          "tonic-triad-movement",
        ),
      ).toBe(false);
    }
  });

  test("rejects altered, polyphonic, wrong-center, and register-invalid stepwise windows", () => {
    const invalidWindows: readonly (readonly (Note | Note[])[])[] = [
      [note(1), note(2, 0, 1), note(3)],
      [note(1), [note(2), note(5)], note(3)],
      [note(1), note(4), note(3)],
      [note(1, -1), note(2), note(3)],
      [note(1), note(2), note(3, 1)],
    ];
    for (const events of invalidWindows) {
      expect(indexes(phrase(events), "stepwise-2")).toEqual([]);
    }
  });

  test("invalid notes break pair candidates and tonic occurrences", () => {
    expect(
      indexes(
        phrase([note(1), note(5, 0, 1), note(1), [note(5), note(3)]]),
        "dominant-adjacent-tonic",
      ),
    ).toEqual([]);
    expect(indexes(phrase([note(1, 0, -1)]), "tonic")).toEqual([]);
  });

  test("derives a sorted unique prompt vocabulary independent of toggle order", () => {
    expect(
      promptDegreesForSituations([
        "stepwise-5",
        "tonic",
        "third-adjacent-tonic",
        "stepwise-2",
      ]),
    ).toEqual([1, 2, 3, 4, 5, 6]);
    expect(
      promptDegreesForSituations([
        "stepwise-2",
        "third-adjacent-tonic",
        "tonic",
        "stepwise-5",
      ]),
    ).toEqual([1, 2, 3, 4, 5, 6]);
    expect(promptDegreesForSituations([])).toEqual([]);
  });
});
