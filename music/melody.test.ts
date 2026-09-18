import { expect, test } from "@playwright/test";
import {
  type CorpusMelody,
  normalizeMelody,
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
