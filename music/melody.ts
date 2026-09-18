import type { Result } from "./format.ts";
import type { Context, Degree, Event, Note } from "./note.ts";

export const TICKS_PER_QUARTER = 24;

export type TimedEvent = Event & {
  onsetTicks: number;
  durationTicks: number;
};

export type Voice = {
  id: string;
  events: TimedEvent[];
};

export type Measure = {
  startTicks: number;
  endTicks: number;
  beatDurationsTicks: number[];
};

export type Score = {
  context: Context;
  tempoBpm: number;
  durationTicks: number;
  voices: Voice[];
  measures: Measure[];
};

export type IdentificationPhraseSuitability =
  | "independent"
  | "context-required"
  | "exclude";

export type Phrase = Score & {
  id: string;
  melodyId: string;
  phraseIndex: number;
  noteIdentification: IdentificationPhraseSuitability;
  rationale: string;
};

export type MelodySource = {
  description: string;
  status: "public-domain" | "traditional" | "original";
};

export type Melody = Score & {
  id: string;
  title: string;
  phrases: Phrase[];
  source: MelodySource;
};

export type CorpusEvent = Event & {
  durationTicks: number;
};

export type CorpusMeasureVoice = {
  voiceId: string;
  events: CorpusEvent[];
};

export type CorpusMeasure = {
  durationTicks: number;
  beatDurationsTicks: number[];
  voices: CorpusMeasureVoice[];
  phraseEnd?: {
    noteIdentification: IdentificationPhraseSuitability;
    rationale: string;
  };
};

export type CorpusMelody = Omit<
  Melody,
  "durationTicks" | "voices" | "measures" | "phrases"
> & {
  measures: CorpusMeasure[];
};

type PhraseBoundary = {
  firstMeasureIndex: number;
  lastMeasureIndex: number;
  noteIdentification: IdentificationPhraseSuitability;
  rationale: string;
};

function failure<T>(melodyId: string, detail: string): Result<T> {
  return { ok: false, error: `${melodyId}: ${detail}` };
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function cloneNotes(notes: Note[]): Note[] {
  return notes.map((note) => ({ ...note }));
}

function cloneTimedEvent(event: TimedEvent, onsetTicks: number): TimedEvent {
  return {
    notes: cloneNotes(event.notes),
    onsetTicks,
    durationTicks: event.durationTicks,
  };
}

function isSuitability(
  value: string,
): value is IdentificationPhraseSuitability {
  return (
    value === "independent" ||
    value === "context-required" ||
    value === "exclude"
  );
}

export function normalizeMelody(entry: CorpusMelody): Result<Melody> {
  if (!entry.id.trim()) return failure(entry.id, "melody ID must not be empty");
  if (!entry.title.trim()) return failure(entry.id, "title must not be empty");
  if (!Number.isFinite(entry.tempoBpm) || entry.tempoBpm <= 0) {
    return failure(entry.id, "tempoBpm must be a positive finite number");
  }
  if (entry.measures.length === 0) {
    return failure(entry.id, "melody must contain at least one measure");
  }

  const measures: Measure[] = [];
  const voiceEvents = new Map<string, TimedEvent[]>();
  const voiceOrder: string[] = [];
  const boundaries: PhraseBoundary[] = [];
  let scoreCursor = 0;
  let firstPhraseMeasureIndex = 0;

  for (const [measureIndex, authoredMeasure] of entry.measures.entries()) {
    const measureNumber = measureIndex + 1;
    if (!isPositiveInteger(authoredMeasure.durationTicks)) {
      return failure(
        entry.id,
        `measure ${measureNumber} durationTicks must be a positive integer`,
      );
    }
    if (authoredMeasure.beatDurationsTicks.length === 0) {
      return failure(
        entry.id,
        `measure ${measureNumber} beatDurationsTicks must not be empty`,
      );
    }
    for (const [
      beatIndex,
      duration,
    ] of authoredMeasure.beatDurationsTicks.entries()) {
      if (!isPositiveInteger(duration)) {
        return failure(
          entry.id,
          `measure ${measureNumber} beat ${beatIndex + 1} duration must be a positive integer`,
        );
      }
    }
    const beatTotal = authoredMeasure.beatDurationsTicks.reduce(
      (total, duration) => total + duration,
      0,
    );
    if (beatTotal !== authoredMeasure.durationTicks) {
      return failure(
        entry.id,
        `measure ${measureNumber} beat durations total ${beatTotal}, expected ${authoredMeasure.durationTicks}`,
      );
    }

    const measureStart = scoreCursor;
    const measureEnd = measureStart + authoredMeasure.durationTicks;
    const measureVoiceIds = new Set<string>();
    for (const authoredVoice of authoredMeasure.voices) {
      if (!authoredVoice.voiceId.trim()) {
        return failure(
          entry.id,
          `measure ${measureNumber} contains an empty voice ID`,
        );
      }
      if (measureVoiceIds.has(authoredVoice.voiceId)) {
        return failure(
          entry.id,
          `measure ${measureNumber} voice "${authoredVoice.voiceId}" is declared more than once and would overlap on the normalized timeline`,
        );
      }
      measureVoiceIds.add(authoredVoice.voiceId);

      let events = voiceEvents.get(authoredVoice.voiceId);
      if (!events) {
        events = [];
        voiceEvents.set(authoredVoice.voiceId, events);
        voiceOrder.push(authoredVoice.voiceId);
      }
      let voiceCursor = measureStart;
      for (const [eventIndex, event] of authoredVoice.events.entries()) {
        if (!isPositiveInteger(event.durationTicks)) {
          return failure(
            entry.id,
            `measure ${measureNumber} voice "${authoredVoice.voiceId}" event ${eventIndex + 1} durationTicks must be a positive integer`,
          );
        }
        const eventEnd = voiceCursor + event.durationTicks;
        if (eventEnd > measureEnd) {
          return failure(
            entry.id,
            `measure ${measureNumber} voice "${authoredVoice.voiceId}" is overfilled by ${eventEnd - measureEnd} ticks`,
          );
        }
        if (event.notes.length > 0) {
          const previous = events.at(-1);
          if (
            previous &&
            voiceCursor < previous.onsetTicks + previous.durationTicks
          ) {
            return failure(
              entry.id,
              `measure ${measureNumber} voice "${authoredVoice.voiceId}" has overlapping normalized events`,
            );
          }
          events.push({
            notes: cloneNotes(event.notes),
            onsetTicks: voiceCursor,
            durationTicks: event.durationTicks,
          });
        }
        voiceCursor = eventEnd;
      }
      if (voiceCursor < measureEnd) {
        return failure(
          entry.id,
          `measure ${measureNumber} voice "${authoredVoice.voiceId}" is underfilled by ${measureEnd - voiceCursor} ticks`,
        );
      }
    }

    measures.push({
      startTicks: measureStart,
      endTicks: measureEnd,
      beatDurationsTicks: [...authoredMeasure.beatDurationsTicks],
    });
    scoreCursor = measureEnd;

    if (authoredMeasure.phraseEnd) {
      const { noteIdentification, rationale } = authoredMeasure.phraseEnd;
      if (!isSuitability(noteIdentification)) {
        return failure(
          entry.id,
          `phrase ending at measure ${measureNumber} has unsupported noteIdentification "${String(noteIdentification)}"`,
        );
      }
      if (!rationale.trim()) {
        return failure(
          entry.id,
          `phrase ending at measure ${measureNumber} must have a rationale`,
        );
      }
      boundaries.push({
        firstMeasureIndex: firstPhraseMeasureIndex,
        lastMeasureIndex: measureIndex,
        noteIdentification,
        rationale,
      });
      firstPhraseMeasureIndex = measureIndex + 1;
    }
  }

  if (firstPhraseMeasureIndex !== entry.measures.length) {
    return failure(
      entry.id,
      `final phrase must end at final measure ${entry.measures.length}`,
    );
  }

  const voices = voiceOrder.map((id) => ({
    id,
    events: voiceEvents.get(id) ?? [],
  }));
  const phrases = boundaries.map((boundary, phraseIndex) => {
    const firstMeasure = measures[boundary.firstMeasureIndex];
    const lastMeasure = measures[boundary.lastMeasureIndex];
    if (!firstMeasure || !lastMeasure) {
      throw new Error(`${entry.id}: internal phrase boundary error`);
    }
    const phraseStart = firstMeasure.startTicks;
    const phraseEnd = lastMeasure.endTicks;
    const phraseMeasures = measures
      .slice(boundary.firstMeasureIndex, boundary.lastMeasureIndex + 1)
      .map((measure) => ({
        startTicks: measure.startTicks - phraseStart,
        endTicks: measure.endTicks - phraseStart,
        beatDurationsTicks: [...measure.beatDurationsTicks],
      }));
    const phraseVoices = voices.map((sourceVoice) => ({
      id: sourceVoice.id,
      events: sourceVoice.events
        .filter(
          (event) =>
            event.onsetTicks >= phraseStart && event.onsetTicks < phraseEnd,
        )
        .map((event) => cloneTimedEvent(event, event.onsetTicks - phraseStart)),
    }));
    return {
      id: `${entry.id}:phrase-${phraseIndex + 1}`,
      melodyId: entry.id,
      phraseIndex,
      noteIdentification: boundary.noteIdentification,
      rationale: boundary.rationale,
      context: entry.context,
      tempoBpm: entry.tempoBpm,
      durationTicks: phraseEnd - phraseStart,
      voices: phraseVoices,
      measures: phraseMeasures,
    } satisfies Phrase;
  });

  return {
    ok: true,
    value: {
      id: entry.id,
      title: entry.title,
      context: entry.context,
      tempoBpm: entry.tempoBpm,
      durationTicks: scoreCursor,
      voices,
      measures,
      phrases,
      source: { ...entry.source },
    },
  };
}

export function voice(phrase: Phrase, voiceId: string): Voice | undefined {
  return phrase.voices.find((candidate) => candidate.id === voiceId);
}

export function tonicEventIndexes(phrase: Phrase, voiceId: string): number[] {
  const selectedVoice = voice(phrase, voiceId);
  if (!selectedVoice) return [];
  const indexes: number[] = [];
  for (const [index, event] of selectedVoice.events.entries()) {
    if (
      event.notes.some(
        (note) => note.degree === (1 satisfies Degree) && note.alteration === 0,
      )
    ) {
      indexes.push(index);
    }
  }
  return indexes;
}
