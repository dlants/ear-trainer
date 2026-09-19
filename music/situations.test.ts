import { expect, test } from "@playwright/test";
import {
  cells,
  type HarmonyRegion,
  type Phrase,
  type TimedEvent,
  type Voice,
} from "./melody.ts";
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
    harmony: [],
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

function voicedPhrase(voices: Voice[], durationTicks: number): Phrase {
  return {
    id: "fixture:phrase-1",
    melodyId: "fixture",
    phraseIndex: 0,
    noteIdentification: "independent",
    rationale: "Test fixture.",
    context: "major-cadence",
    harmony: [],
    tempoBpm: 96,
    durationTicks,
    voices,
    measures: [
      {
        startTicks: 0,
        endTicks: durationTicks,
        beatDurationsTicks: [durationTicks],
      },
    ],
  };
}

function occurrences(
  phraseFixture: Phrase,
  situationId: SituationId,
): string[][] {
  return findSituationOccurrences(
    phraseFixture,
    cells(phraseFixture),
    situationId,
  ).map((found) => [...found.cellIds]);
}

/** Cell ids reported as the slot index they attack on, for single-lane fixtures. */
function indexes(phraseFixture: Phrase, situationId: SituationId): number[][] {
  return occurrences(phraseFixture, situationId).map((cellIds) =>
    cellIds.map((cellId) => Number(cellId.split(":")[0]) / 24),
  );
}

test.describe("musical situations", () => {
  test("checks in the complete catalog and degree sets", () => {
    expect(
      SITUATIONS.every(
        (situation) =>
          situation.kind ===
          (situation.group === "progression" ? "progression" : "cells"),
      ),
    ).toBe(true);
    expect(
      SITUATIONS.filter((situation) => situation.group === "harmony").map(
        (situation) => situation.id,
      ),
    ).toEqual([
      "harmonic-third",
      "harmonic-fifth",
      "harmonic-octave",
      "triad-together",
      "arpeggiated-triad",
      "pedal-tone",
    ]);
    expect(
      SITUATIONS.filter((situation) => situation.group === "melodic").map(
        ({ id, degrees }) => [id, degrees],
      ),
    ).toEqual([
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
      ["ascending-run", [1, 2, 3, 4, 5, 6, 7]],
      ["descending-run", [1, 2, 3, 4, 5, 6, 7]],
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
        phrase([note(1), note(5, 0, 1), note(3)]),
        "dominant-adjacent-tonic",
      ),
    ).toEqual([]);
    expect(indexes(phrase([note(1, 0, -1)]), "tonic")).toEqual([]);
  });

  test("reads melodic situations off the top cell of a harmonized phrase", () => {
    const harmonized = voicedPhrase(
      [
        {
          id: "melody",
          events: [
            { notes: [note(1)], onsetTicks: 0, durationTicks: 24 },
            { notes: [note(5)], onsetTicks: 24, durationTicks: 24 },
          ],
        },
        {
          id: "harmony",
          events: [
            { notes: [note(3, -1)], onsetTicks: 0, durationTicks: 24 },
            { notes: [note(1, -1)], onsetTicks: 24, durationTicks: 24 },
          ],
        },
      ],
      48,
    );
    expect(indexes(harmonized, "dominant-adjacent-tonic")).toEqual([[0, 1]]);
    expect(occurrences(harmonized, "dominant-adjacent-tonic")).toEqual([
      ["0:0", "24:0"],
    ]);
  });

  test("hears harmonic intervals only when the notes overlap in time", () => {
    expect(
      occurrences(phrase([[note(1), note(5)]]), "harmonic-fifth"),
    ).toHaveLength(1);
    expect(
      occurrences(phrase([note(1), note(5)]), "harmonic-fifth"),
    ).toHaveLength(0);
  });

  test("hears an interval between a held tone and a note arpeggiated over it", () => {
    const sustained = voicedPhrase(
      [
        {
          id: "melody",
          events: [note(3), note(5), note(7), note(1, 1)].map(
            (single, index) => ({
              notes: [single],
              onsetTicks: index * 24,
              durationTicks: 24,
            }),
          ),
        },
        {
          id: "bass",
          events: [{ notes: [note(1)], onsetTicks: 0, durationTicks: 96 }],
        },
      ],
      96,
    );
    expect(occurrences(sustained, "harmonic-fifth")).toEqual([["24:0", "0:1"]]);
    expect(occurrences(sustained, "harmonic-third")).toHaveLength(1);
    expect(occurrences(sustained, "harmonic-octave")).toHaveLength(1);
    expect(occurrences(sustained, "pedal-tone")).toEqual([
      ["0:1", "24:0", "48:0", "72:0"],
    ]);
  });

  test("separates a blocked triad from an arpeggiated one", () => {
    const block = phrase([[note(1), note(3), note(5, -1)], note(1)]);
    expect(occurrences(block, "triad-together")).toHaveLength(1);
    expect(occurrences(block, "arpeggiated-triad")).toHaveLength(0);

    const arpeggio = phrase([note(1), note(3), note(5)]);
    expect(indexes(arpeggio, "arpeggiated-triad")).toEqual([[0, 1, 2]]);
    expect(occurrences(arpeggio, "triad-together")).toHaveLength(0);
  });

  test("finds maximal stepwise runs in each direction", () => {
    const rising = phrase([note(1), note(2), note(3), note(4), note(1)]);
    expect(indexes(rising, "ascending-run")).toEqual([[0, 1, 2, 3]]);
    expect(indexes(rising, "descending-run")).toEqual([]);
    const falling = phrase([note(5), note(4), note(3)]);
    expect(indexes(falling, "descending-run")).toEqual([[0, 1, 2]]);
    expect(
      indexes(phrase([note(1), note(2), note(1)]), "ascending-run"),
    ).toEqual([]);
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

test.describe("progression situations", () => {
  function region(
    startTicks: number,
    root: Degree,
    quality: "major" | "minor",
  ): HarmonyRegion {
    return {
      id: `harmony:${startTicks}` as HarmonyRegion["id"],
      startTicks,
      endTicks: startTicks + 24,
      chord: { root, alteration: 0, quality },
    };
  }
  const TWO_FIVE_ONE: HarmonyRegion[] = [
    region(0, 2, "minor"),
    region(24, 5, "major"),
    region(48, 1, "major"),
  ];
  function blockVoice(roots: readonly [Degree, Degree, Degree][]): Voice {
    return {
      id: "harmony",
      events: roots.map((triad, index) => ({
        notes: triad.map((degree, slot) => note(degree, slot === 0 ? -1 : 0)),
        onsetTicks: index * 24,
        durationTicks: 24,
      })),
    };
  }
  function arpeggioVoice(roots: readonly [Degree, Degree, Degree][]): Voice {
    return {
      id: "harmony",
      events: roots.flatMap((triad, index) =>
        triad.map((degree, slot) => ({
          notes: [note(degree, slot === 0 ? -1 : 0)],
          onsetTicks: index * 24 + slot * 8,
          durationTicks: 8,
        })),
      ),
    };
  }
  const TRIADS: [Degree, Degree, Degree][] = [
    [2, 4, 6],
    [5, 7, 2],
    [1, 3, 5],
  ];
  function withHarmony(voices: Voice[], harmony: HarmonyRegion[]): Phrase {
    return { ...voicedPhrase(voices, 72), harmony };
  }

  test("matches identity regardless of texture when unconstrained", () => {
    const block = withHarmony([blockVoice(TRIADS)], TWO_FIVE_ONE);
    const arpeggio = withHarmony([arpeggioVoice(TRIADS)], TWO_FIVE_ONE);
    for (const fixture of [block, arpeggio]) {
      expect(
        findSituationOccurrences(fixture, cells(fixture), "authentic-cadence"),
      ).toHaveLength(1);
    }
  });

  test("requires the whole progression in order", () => {
    const withoutResolution = withHarmony(
      [blockVoice(TRIADS.slice(0, 2) as [Degree, Degree, Degree][])],
      TWO_FIVE_ONE.slice(0, 2),
    );
    expect(occurrences(withoutResolution, "authentic-cadence")).toHaveLength(0);
    const reordered = withHarmony(
      [blockVoice(TRIADS)],
      [region(0, 5, "major"), region(24, 1, "major"), region(48, 5, "major")],
    );
    expect(occurrences(reordered, "plagal-cadence")).toHaveLength(0);
  });

  test("matches only root-position cadences", () => {
    const rootPosition = withHarmony([blockVoice(TRIADS)], TWO_FIVE_ONE);
    const inverted = withHarmony(
      [
        blockVoice([
          [2, 4, 6],
          [5, 7, 2],
          [3, 5, 1],
        ]),
      ],
      TWO_FIVE_ONE,
    );
    expect(occurrences(rootPosition, "authentic-cadence")).toHaveLength(1);
    expect(occurrences(inverted, "authentic-cadence")).toHaveLength(0);
  });

  test("reports the cells sounding inside the matched regions", () => {
    const block = withHarmony([blockVoice(TRIADS)], TWO_FIVE_ONE);
    const [found] = occurrences(block, "authentic-cadence");
    expect(found).toHaveLength(6);
    expect(found.every((cellId) => Number(cellId.split(":")[0]) >= 24)).toBe(
      true,
    );
  });

  test("never matches a phrase with no stated harmony", () => {
    expect(
      phraseMatchesSituation(phrase([note(5), note(1)]), "authentic-cadence"),
    ).toBe(false);
  });
});
