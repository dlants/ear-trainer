import { expect, test } from "@playwright/test";
import {
  type Cell,
  type CellId,
  type Chord,
  type CorpusHarmony,
  type CorpusMelody,
  cells,
  cellsById,
  cellsSoundingAt,
  chordAt,
  chordSequence,
  type HarmonyRegion,
  lanes,
  normalizeMelody,
  onsetAt,
  onsets,
  realizationOf,
  type Score,
  type TimedEvent,
  tonicEventIndexes,
  voice,
} from "./melody.ts";
import type { Note } from "./note.ts";

function note(
  degree: Note["degree"],
  alteration: Note["alteration"] = 0,
  octave = 0,
): Note {
  return { degree, alteration, octave };
}

function fixture(): CorpusMelody {
  return {
    id: "changing-meter",
    title: "Changing Meter",
    context: "major-cadence",
    tempoBpm: 96,
    source: { description: "Test fixture", status: "original" },
    measures: [
      {
        durationTicks: 24,
        beatDurationsTicks: [24],
        voices: [
          {
            voiceId: "melody",
            events: [
              { notes: [], durationTicks: 6 },
              { notes: [note(1)], durationTicks: 18 },
            ],
          },
          {
            voiceId: "harmony",
            events: [{ notes: [note(5, 0, -1)], durationTicks: 24 }],
          },
        ],
      },
      {
        durationTicks: 72,
        beatDurationsTicks: [24, 24, 24],
        voices: [
          {
            voiceId: "melody",
            events: [
              { notes: [note(2)], durationTicks: 24 },
              { notes: [], durationTicks: 12 },
              {
                notes: [note(3), note(1, 0, 1)],
                durationTicks: 36,
              },
            ],
          },
        ],
        phraseEnd: {
          noteIdentification: "independent",
          rationale: "Natural tonic is emphasized at both ends.",
        },
      },
      {
        durationTicks: 72,
        beatDurationsTicks: [36, 36],
        voices: [
          {
            voiceId: "melody",
            events: [
              { notes: [note(1, 1)], durationTicks: 36 },
              { notes: [note(5)], durationTicks: 36 },
            ],
          },
          {
            voiceId: "harmony",
            events: [
              { notes: [], durationTicks: 36 },
              { notes: [note(1, 0, -1)], durationTicks: 36 },
            ],
          },
        ],
      },
      {
        durationTicks: 96,
        beatDurationsTicks: [24, 24, 48],
        voices: [
          {
            voiceId: "melody",
            events: [
              { notes: [note(1, 0, -1)], durationTicks: 48 },
              { notes: [], durationTicks: 48 },
            ],
          },
          {
            voiceId: "harmony",
            events: [
              { notes: [note(4)], durationTicks: 48 },
              { notes: [note(5)], durationTicks: 48 },
            ],
          },
        ],
        phraseEnd: {
          noteIdentification: "context-required",
          rationale: "The altered opening needs the preceding tonal context.",
        },
      },
    ],
  };
}

function normalize(entry: CorpusMelody) {
  const result = normalizeMelody(entry);
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

function validSingleMeasure(): CorpusMelody {
  return {
    id: "validation-fixture",
    title: "Validation Fixture",
    context: "major-cadence",
    tempoBpm: 80,
    source: { description: "Test fixture", status: "original" },
    measures: [
      {
        durationTicks: 24,
        beatDurationsTicks: [24],
        voices: [
          {
            voiceId: "melody",
            events: [{ notes: [note(1)], durationTicks: 24 }],
          },
        ],
        phraseEnd: {
          noteIdentification: "independent",
          rationale: "The tonic is explicit.",
        },
      },
    ],
  };
}

function singleMeasure(entry: CorpusMelody): CorpusMelody["measures"][number] {
  const measure = entry.measures[0];
  if (!measure) throw new Error("missing measure");
  return measure;
}

function firstEvent(
  entry: CorpusMelody,
): CorpusMelody["measures"][number]["voices"][number]["events"][number] {
  const event = singleMeasure(entry).voices[0]?.events[0];
  if (!event) throw new Error("missing event");
  return event;
}

function errorFor(entry: CorpusMelody): string {
  const result = normalizeMelody(entry);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("expected normalization to fail");
  return result.error;
}

test.describe("melody normalization", () => {
  test("normalizes sequential voices, rests, beat groups, and changing measure lengths", () => {
    const melody = normalize(fixture());

    expect(melody.durationTicks).toBe(264);
    expect(melody.measures).toEqual([
      { startTicks: 0, endTicks: 24, beatDurationsTicks: [24] },
      { startTicks: 24, endTicks: 96, beatDurationsTicks: [24, 24, 24] },
      { startTicks: 96, endTicks: 168, beatDurationsTicks: [36, 36] },
      { startTicks: 168, endTicks: 264, beatDurationsTicks: [24, 24, 48] },
    ]);
    expect(melody.voices.map(({ id }) => id)).toEqual(["melody", "harmony"]);
    expect(
      melody.voices[0]?.events.map(({ onsetTicks, durationTicks }) => ({
        onsetTicks,
        durationTicks,
      })),
    ).toEqual([
      { onsetTicks: 6, durationTicks: 18 },
      { onsetTicks: 24, durationTicks: 24 },
      { onsetTicks: 60, durationTicks: 36 },
      { onsetTicks: 96, durationTicks: 36 },
      { onsetTicks: 132, durationTicks: 36 },
      { onsetTicks: 168, durationTicks: 48 },
    ]);
    expect(
      melody.voices[1]?.events.map(({ onsetTicks, durationTicks }) => ({
        onsetTicks,
        durationTicks,
      })),
    ).toEqual([
      { onsetTicks: 0, durationTicks: 24 },
      { onsetTicks: 132, durationTicks: 36 },
      { onsetTicks: 168, durationTicks: 48 },
      { onsetTicks: 216, durationTicks: 48 },
    ]);
  });

  test("materializes self-contained zero-based phrases with every voice", () => {
    const melody = normalize(fixture());

    expect(melody.phrases).toHaveLength(2);
    const [first, second] = melody.phrases;
    expect(first).toMatchObject({
      id: "changing-meter:phrase-1",
      melodyId: "changing-meter",
      phraseIndex: 0,
      noteIdentification: "independent",
      durationTicks: 96,
    });
    expect(first?.measures).toEqual([
      { startTicks: 0, endTicks: 24, beatDurationsTicks: [24] },
      { startTicks: 24, endTicks: 96, beatDurationsTicks: [24, 24, 24] },
    ]);
    expect(first?.voices.map(({ id }) => id)).toEqual(["melody", "harmony"]);
    expect(
      first?.voices[1]?.events.map(({ onsetTicks }) => onsetTicks),
    ).toEqual([0]);

    expect(second).toMatchObject({
      id: "changing-meter:phrase-2",
      melodyId: "changing-meter",
      phraseIndex: 1,
      noteIdentification: "context-required",
      durationTicks: 168,
    });
    expect(second?.measures).toEqual([
      { startTicks: 0, endTicks: 72, beatDurationsTicks: [36, 36] },
      { startTicks: 72, endTicks: 168, beatDurationsTicks: [24, 24, 48] },
    ]);
    expect(
      second?.voices[0]?.events.map(({ onsetTicks }) => onsetTicks),
    ).toEqual([0, 36, 72]);
    expect(
      second?.voices[1]?.events.map(({ onsetTicks }) => onsetTicks),
    ).toEqual([36, 72, 120]);
  });

  test("does not share mutable score data between corpus, melody, and phrases", () => {
    const entry = fixture();
    const original = structuredClone(entry);
    const melody = normalize(entry);
    const phrase = melody.phrases[0];
    if (!phrase) throw new Error("missing phrase");

    phrase.measures[0]?.beatDurationsTicks.push(99);
    const phraseNote = phrase.voices[0]?.events[0]?.notes[0];
    if (phraseNote) phraseNote.degree = 7;

    expect(entry).toEqual(original);
    expect(melody.measures[0]?.beatDurationsTicks).toEqual([24]);
    expect(melody.voices[0]?.events[0]?.notes[0]?.degree).toBe(1);
  });

  test("finds natural tonic events by concrete voice without including accompaniment", () => {
    const melody = normalize(fixture());
    const first = melody.phrases[0];
    const second = melody.phrases[1];
    if (!first || !second) throw new Error("missing phrase");

    expect(voice(first, "melody")?.events).toHaveLength(3);
    expect(voice(first, "missing")).toBeUndefined();
    expect(tonicEventIndexes(first, "melody")).toEqual([0, 2]);
    expect(tonicEventIndexes(second, "melody")).toEqual([2]);
    expect(tonicEventIndexes(second, "harmony")).toEqual([0]);
    expect(tonicEventIndexes(second, "missing")).toEqual([]);
  });

  test("covers source measures exactly once across phrase boundaries", () => {
    const melody = normalize(fixture());
    expect(
      melody.phrases.flatMap((phrase) =>
        phrase.measures.map((measure) => measure.endTicks - measure.startTicks),
      ),
    ).toEqual([24, 72, 72, 96]);
    expect(
      melody.phrases.reduce((sum, phrase) => sum + phrase.durationTicks, 0),
    ).toBe(melody.durationTicks);
  });

  test("normalizes pickup, simple triple, and compound grouping without meter metadata", () => {
    for (const [durationTicks, beatDurationsTicks] of [
      [24, [24]],
      [72, [24, 24, 24]],
      [72, [36, 36]],
    ] as const) {
      const entry = validSingleMeasure();
      const measure = entry.measures[0];
      if (!measure) throw new Error("missing measure");
      measure.durationTicks = durationTicks;
      measure.beatDurationsTicks = [...beatDurationsTicks];
      const event = measure.voices[0]?.events[0];
      if (!event) throw new Error("missing event");
      event.durationTicks = durationTicks;
      const normalized = normalize(entry);
      expect(normalized.measures[0]?.beatDurationsTicks).toEqual(
        beatDurationsTicks,
      );
      expect(normalized.durationTicks).toBe(durationTicks);
      const normalizedMeasure = normalized.measures[0];
      if (!normalizedMeasure) throw new Error("missing normalized measure");
      expect("meter" in normalizedMeasure).toBe(false);
    }
  });
});

test.describe("melody validation", () => {
  test("includes the melody ID in every validation error", () => {
    const entry = validSingleMeasure();
    singleMeasure(entry).durationTicks = 0;
    expect(errorFor(entry)).toContain("validation-fixture:");
  });

  test("rejects nonpositive and fractional measure durations", () => {
    for (const duration of [0, -1, 24.5]) {
      const entry = validSingleMeasure();
      singleMeasure(entry).durationTicks = duration;
      expect(errorFor(entry)).toContain(
        "measure 1 durationTicks must be a positive integer",
      );
    }
  });

  test("rejects nonpositive and fractional event durations", () => {
    for (const duration of [0, -1, 12.5]) {
      const entry = validSingleMeasure();
      firstEvent(entry).durationTicks = duration;
      expect(errorFor(entry)).toContain(
        "event 1 durationTicks must be a positive integer",
      );
    }
  });

  test("rejects overfilled and underfilled voices", () => {
    const overfilled = validSingleMeasure();
    firstEvent(overfilled).durationTicks = 25;
    expect(errorFor(overfilled)).toContain("overfilled by 1 ticks");

    const underfilled = validSingleMeasure();
    firstEvent(underfilled).durationTicks = 23;
    expect(errorFor(underfilled)).toContain("underfilled by 1 ticks");
  });

  test("rejects duplicate voice declarations that would overlap", () => {
    const entry = validSingleMeasure();
    singleMeasure(entry).voices.push({
      voiceId: "melody",
      events: [{ notes: [note(5)], durationTicks: 24 }],
    });
    expect(errorFor(entry)).toContain(
      "would overlap on the normalized timeline",
    );
  });

  test("rejects empty, nonpositive, fractional, and mismatched beat groupings", () => {
    const empty = validSingleMeasure();
    singleMeasure(empty).beatDurationsTicks = [];
    expect(errorFor(empty)).toContain("beatDurationsTicks must not be empty");

    for (const duration of [0, -1, 12.5]) {
      const entry = validSingleMeasure();
      singleMeasure(entry).beatDurationsTicks = [duration, 24 - duration];
      expect(errorFor(entry)).toContain("duration must be a positive integer");
    }

    const mismatched = validSingleMeasure();
    singleMeasure(mismatched).beatDurationsTicks = [12, 11];
    expect(errorFor(mismatched)).toContain(
      "beat durations total 23, expected 24",
    );
  });

  test("requires a nonempty rationale on supported phrase boundaries", () => {
    const entry = validSingleMeasure();
    const phraseEnd = singleMeasure(entry).phraseEnd;
    if (!phraseEnd) throw new Error("missing phrase boundary");
    phraseEnd.rationale = "  ";
    expect(errorFor(entry)).toContain("must have a rationale");
  });

  test("requires the final phrase boundary at the final measure", () => {
    const entry = validSingleMeasure();
    delete singleMeasure(entry).phraseEnd;
    expect(errorFor(entry)).toContain(
      "final phrase must end at final measure 1",
    );
  });
});

function score(voices: Score["voices"]): Score {
  const durationTicks = Math.max(
    ...voices.flatMap((v) =>
      v.events.map((e) => e.onsetTicks + e.durationTicks),
    ),
  );
  return {
    context: "major-cadence",
    tempoBpm: 96,
    durationTicks,
    harmony: [],
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

function ev(
  notes: Note[],
  onsetTicks: number,
  durationTicks: number,
): TimedEvent {
  return { notes, onsetTicks, durationTicks };
}

function cellNotes(cellList: Cell[], ids: readonly CellId[]): string[] {
  const byId = cellsById(cellList);
  return ids.map((id) => {
    const cell = byId.get(id);
    if (!cell) throw new Error(`missing cell ${id}`);
    return `${cell.voiceId}:${cell.note.degree}^${cell.note.octave}`;
  });
}

test.describe("cells, lanes, and onsets", () => {
  test("groups simultaneous attacks of two voices into one onset, highest first", () => {
    const value = score([
      { id: "melody", events: [ev([note(3)], 0, 24), ev([note(5)], 24, 24)] },
      { id: "harmony", events: [ev([note(1)], 0, 24), ev([note(2)], 24, 24)] },
    ]);
    const cellList = cells(value);
    const onsetList = onsets(cellList);
    expect(onsetList.map((onset) => onset.onsetTicks)).toEqual([0, 24]);
    expect(cellNotes(cellList, onsetList[0]?.cellIds ?? [])).toEqual([
      "melody:3^0",
      "harmony:1^0",
    ]);
  });

  test("gives a harmony note attacking under a held melody note its own onset", () => {
    const value = score([
      { id: "melody", events: [ev([note(5)], 0, 48)] },
      { id: "harmony", events: [ev([note(1)], 0, 24), ev([note(3)], 24, 24)] },
    ]);
    const cellList = cells(value);
    const onsetList = onsets(cellList);
    expect(onsetList.map((onset) => onset.onsetTicks)).toEqual([0, 24]);
    expect(cellNotes(cellList, onsetList[1]?.cellIds ?? [])).toEqual([
      "harmony:3^0",
    ]);
  });

  test("yields one onset per event for a single-voice phrase", () => {
    const melody = normalize(fixture());
    for (const phrase of melody.phrases) {
      const melodyVoice = voice(phrase, "melody");
      if (!melodyVoice) throw new Error("missing melody voice");
      const singleVoicePhrase = { ...phrase, voices: [melodyVoice] };
      const onsetList = onsets(cells(singleVoicePhrase));
      expect(onsetList.map((onset) => onset.onsetTicks)).toEqual(
        melodyVoice.events.map((event) => event.onsetTicks),
      );
    }
  });

  test("orders a chord authored in one event by pitch, highest first", () => {
    const value = score([
      {
        id: "melody",
        events: [ev([note(3), note(1, 0, 1), note(5)], 0, 24)],
      },
    ]);
    const cellList = cells(value);
    const onsetList = onsets(cellList);
    expect(onsetList).toHaveLength(1);
    expect(cellNotes(cellList, onsetList[0]?.cellIds ?? [])).toEqual([
      "melody:1^1",
      "melody:5^0",
      "melody:3^0",
    ]);
  });

  test("reports notes still ringing and excludes notes that already ended", () => {
    const value = score([
      { id: "melody", events: [ev([note(5)], 0, 48)] },
      {
        id: "harmony",
        events: [
          ev([note(1)], 0, 12),
          ev([note(3)], 12, 12),
          ev([note(4)], 24, 24),
        ],
      },
    ]);
    const cellList = cells(value);
    expect(cellNotes(cellList, cellsSoundingAt(cellList, 12))).toEqual([
      "melody:5^0",
      "harmony:3^0",
    ]);
    expect(cellNotes(cellList, cellsSoundingAt(cellList, 48))).toEqual([]);
  });

  test("derives one lane per voice slot, ordered by descending mean pitch", () => {
    const value = score([
      {
        id: "harmony",
        events: [
          ev([note(1), note(3), note(5)], 0, 24),
          ev([note(1), note(4), note(6)], 24, 24),
        ],
      },
      { id: "melody", events: [ev([note(1, 0, 1)], 0, 48)] },
    ]);
    expect(lanes(value)).toEqual([
      { voiceId: "melody", slot: 0 },
      { voiceId: "harmony", slot: 0 },
      { voiceId: "harmony", slot: 1 },
      { voiceId: "harmony", slot: 2 },
    ]);
    const cellList = cells(value);
    const sustained = cellList.filter((cell) => cell.voiceId === "melody");
    expect(sustained).toHaveLength(1);
    expect(sustained[0]?.laneIndex).toBe(0);
    for (const tick of [0, 24]) {
      const top = cellList.find(
        (cell) =>
          cell.voiceId === "harmony" &&
          cell.onsetTicks === tick &&
          cell.laneIndex === 1,
      );
      expect(top?.note.degree).toBe(tick === 0 ? 5 : 6);
    }
  });

  test("reproduces the same cell ids when recomputed", () => {
    const value = score([
      { id: "melody", events: [ev([note(5)], 0, 48)] },
      { id: "harmony", events: [ev([note(1)], 0, 24), ev([note(3)], 24, 24)] },
    ]);
    expect(cells(value).map((cell) => cell.id)).toEqual(
      cells(value).map((cell) => cell.id),
    );
    const onsetList = onsets(cells(value));
    expect(onsetAt(onsetList, 24)?.cellIds).toHaveLength(1);
    expect(onsetAt(onsetList, 30)).toBeUndefined();
  });
});

test.describe("harmony track", () => {
  function chord(root: Note["degree"], quality: "major" | "minor"): Chord {
    return { root, alteration: 0, quality };
  }
  function harmonized(
    harmonies: (CorpusHarmony[] | undefined)[],
  ): CorpusMelody {
    return {
      id: "harmonized",
      title: "Harmonized",
      context: "major-cadence",
      tempoBpm: 96,
      source: { description: "Test fixture", status: "original" },
      measures: harmonies.map((harmony, index) => ({
        durationTicks: 48,
        beatDurationsTicks: [24, 24],
        harmony,
        voices: [
          {
            voiceId: "melody",
            events: [{ notes: [note(1)], durationTicks: 48 }],
          },
        ],
        phraseEnd:
          index === harmonies.length - 1
            ? {
                noteIdentification: "independent" as const,
                chordIdentification: "independent" as const,
                rationale: "The tonic is explicit.",
              }
            : undefined,
      })),
    };
  }

  test("normalizes authored harmony onto absolute tick bounds", () => {
    const melody = normalize(
      harmonized([
        [
          { durationTicks: 24, chord: chord(2, "minor") },
          { durationTicks: 24, chord: chord(5, "major") },
        ],
        undefined,
        [{ durationTicks: 48, chord: chord(1, "major") }],
      ]),
    );
    expect(
      melody.harmony.map(({ startTicks, endTicks, chord: authored }) => [
        startTicks,
        endTicks,
        authored.root,
      ]),
    ).toEqual([
      [0, 24, 2],
      [24, 48, 5],
      [96, 144, 1],
    ]);
    expect(chordAt(melody.harmony, 30)?.root).toBe(5);
    expect(chordAt(melody.harmony, 60)).toBeUndefined();
  });

  test("rejects harmony that does not tile its measure", () => {
    expect(
      errorFor(harmonized([[{ durationTicks: 24, chord: chord(1, "major") }]])),
    ).toContain("underfilled");
    expect(
      errorFor(harmonized([[{ durationTicks: 96, chord: chord(1, "major") }]])),
    ).toContain("overfilled");
  });

  test("requires a chordIdentification on a phrase that states harmony", () => {
    const entry = harmonized([
      [{ durationTicks: 48, chord: chord(1, "major") }],
    ]);
    const phraseEnd = entry.measures.at(-1)?.phraseEnd;
    if (!phraseEnd) throw new Error("missing phrase boundary");
    delete phraseEnd.chordIdentification;
    expect(errorFor(entry)).toContain("must declare chordIdentification");
  });

  test("collapses a chord repeated across measures", () => {
    const melody = normalize(
      harmonized([
        [{ durationTicks: 48, chord: chord(1, "major") }],
        [{ durationTicks: 48, chord: chord(1, "major") }],
        [{ durationTicks: 48, chord: chord(5, "major") }],
      ]),
    );
    expect(
      chordSequence(melody.harmony).map(({ startTicks, endTicks }) => [
        startTicks,
        endTicks,
      ]),
    ).toEqual([
      [0, 96],
      [96, 144],
    ]);
  });

  test("reads realization from the cells, not the authored bass", () => {
    const region = {
      id: "harmony:0" as HarmonyRegion["id"],
      startTicks: 0,
      endTicks: 72,
      chord: { ...chord(1, "major"), bass: 1 as Note["degree"] },
    };
    const blocked = score([
      {
        id: "melody",
        events: [ev([note(1), note(3), note(5)], 0, 72)],
      },
    ]);
    expect(realizationOf(cells(blocked), region)).toEqual({
      bass: "root",
      texture: "block",
    });
    const arpeggiated = score([
      {
        id: "melody",
        events: [
          ev([note(3, 0, -1)], 0, 24),
          ev([note(5)], 24, 24),
          ev([note(1, 0, 1)], 48, 24),
        ],
      },
    ]);
    expect(realizationOf(cells(arpeggiated), region)).toEqual({
      bass: "first",
      texture: "arpeggiated",
    });
    const mixed = score([
      {
        id: "melody",
        events: [ev([note(5, 0, -1), note(1)], 0, 24), ev([note(3)], 24, 48)],
      },
    ]);
    expect(realizationOf(cells(mixed), region)).toEqual({
      bass: "second",
      texture: "mixed",
    });
  });
});
