import type {
  ChordQuality,
  CorpusEvent,
  CorpusHarmony,
  CorpusMeasure,
  CorpusMeasureVoice,
  CorpusMelody,
} from "../music/melody.ts";
import type { Degree } from "../music/note.ts";

export const e = 12;
export const q = 24;
export const dq = 36;
export const h = 48;
export const dh = 72;
export const w = 96;

type Pitch = Degree | "rest";
type EventSpec = readonly [
  pitch: Pitch,
  durationTicks: number,
  octave?: number,
];
export type PhraseSpec = {
  measures: CorpusMeasure[];
  noteIdentification: "independent" | "context-required" | "exclude";
  chordIdentification?: "independent" | "context-required" | "exclude";
  rationale: string;
};
type NoteSpec = readonly [degree: Degree, octave?: number];
/** One event of a hand-authored voice; several notes means a struck chord. */
export function ev(durationTicks: number, ...notes: NoteSpec[]): CorpusEvent {
  return {
    notes: notes.map(([degree, octave = 0]) => ({
      degree,
      alteration: 0 as const,
      octave,
    })),
    durationTicks,
  };
}
export function voiceOf(voiceId: string, ...events: CorpusEvent[]) {
  return { voiceId, events } satisfies CorpusMeasureVoice;
}
export function region(
  durationTicks: number,
  root: Degree,
  quality: ChordQuality = "major",
): CorpusHarmony {
  return { durationTicks, chord: { root, alteration: 0, quality } };
}
/** A common-time measure with explicit voices and an authored chord track. */
export function polyBar(
  voices: CorpusMeasureVoice[],
  harmony: CorpusHarmony[],
): CorpusMeasure {
  return {
    durationTicks: w,
    beatDurationsTicks: [q, q, q, q],
    voices,
    harmony,
  };
}
/** Root-position triads voiced below a melody written at octave 0. */
export const triadI: NoteSpec[] = [
  [1, -1],
  [3, -1],
  [5, -1],
];
export const triadIV: NoteSpec[] = [
  [4, -2],
  [6, -2],
  [1, -1],
];
export const triadV: NoteSpec[] = [
  [5, -2],
  [7, -2],
  [2, -1],
];
/** Adds an accompaniment voice and chord track under an already-authored melody bar. */
export function accompany(
  authored: CorpusMeasure,
  harmony: CorpusHarmony[],
  ...events: CorpusEvent[]
): CorpusMeasure {
  return {
    ...authored,
    voices: [...authored.voices, voiceOf("harmony", ...events)],
    harmony,
  };
}
export function withHarmony(
  authored: CorpusMeasure,
  harmony: CorpusHarmony[],
): CorpusMeasure {
  return { ...authored, harmony };
}

export function measure(
  beatDurationsTicks: number[],
  ...specs: EventSpec[]
): CorpusMeasure {
  return {
    durationTicks: beatDurationsTicks.reduce(
      (sum, duration) => sum + duration,
      0,
    ),
    beatDurationsTicks,
    voices: [
      {
        voiceId: "melody",
        events: specs.map(([pitch, durationTicks, octave = 0]) => ({
          notes:
            pitch === "rest"
              ? []
              : [{ degree: pitch, alteration: 0 as const, octave }],
          durationTicks,
        })),
      },
    ],
  };
}

export const bar4 = (...specs: EventSpec[]) => measure([q, q, q, q], ...specs);
export const bar3 = (...specs: EventSpec[]) => measure([q, q, q], ...specs);
export const bar6 = (...specs: EventSpec[]) => measure([dq, dq], ...specs);
export const pickup = (...specs: EventSpec[]) => measure([q], ...specs);

export function phrase(
  measures: CorpusMeasure[],
  noteIdentification: PhraseSpec["noteIdentification"],
  rationale: string,
  chordIdentification?: PhraseSpec["chordIdentification"],
): PhraseSpec {
  return { measures, noteIdentification, chordIdentification, rationale };
}

function splitPhrase(spec: PhraseSpec): PhraseSpec[] {
  const measureCounts =
    spec.measures.length % 2 === 0
      ? Array(spec.measures.length / 2).fill(2)
      : [3, ...Array((spec.measures.length - 3) / 2).fill(2)];
  let startMeasureIndex = 0;

  return measureCounts.map((measureCount) => {
    const measures = spec.measures.slice(
      startMeasureIndex,
      startMeasureIndex + measureCount,
    );
    startMeasureIndex += measureCount;
    const events = measures.flatMap(
      (authoredMeasure) =>
        authoredMeasure.voices
          .find(({ voiceId }) => voiceId === "melody")
          ?.events.filter(({ notes }) => notes.length > 0) ?? [],
    );
    const tonicIndexes = events.flatMap((event, eventIndex) =>
      event.notes.some(
        ({ degree, alteration }) => degree === 1 && alteration === 0,
      )
        ? [eventIndex]
        : [],
    );
    const hasStrongTonicEvidence =
      tonicIndexes.length >= 2 ||
      tonicIndexes.includes(0) ||
      tonicIndexes.includes(events.length - 1);
    const isPracticeLength = events.length >= 4 && events.length <= 8;
    const noteIdentification =
      spec.noteIdentification === "independent" &&
      (!isPracticeLength || !hasStrongTonicEvidence)
        ? "context-required"
        : spec.noteIdentification;

    return {
      measures,
      noteIdentification,
      chordIdentification: measures.some(
        (authoredMeasure) => authoredMeasure.harmony !== undefined,
      )
        ? spec.chordIdentification
        : undefined,
      rationale:
        noteIdentification === spec.noteIdentification
          ? spec.rationale
          : `This short excerpt is retained for context; it has ${events.length} sounded notes and does not meet the compact independent-phrase rubric.`,
    };
  });
}

export function melody(
  id: string,
  title: string,
  tempoBpm: number,
  status: CorpusMelody["source"]["status"],
  provenance: string,
  phrases: PhraseSpec[],
  context: CorpusMelody["context"] = "major-cadence",
): CorpusMelody {
  return {
    id,
    title,
    context,
    tempoBpm,
    source: {
      description: `${provenance} Independent tonic-relative transcription for this corpus.`,
      status,
    },
    measures: phrases
      .flatMap(splitPhrase)
      .flatMap(
        ({ measures, noteIdentification, chordIdentification, rationale }) =>
          measures.map((authoredMeasure, index) =>
            index === measures.length - 1
              ? {
                  ...authoredMeasure,
                  phraseEnd: {
                    noteIdentification,
                    chordIdentification,
                    rationale,
                  },
                }
              : authoredMeasure,
          ),
      ),
  };
}
