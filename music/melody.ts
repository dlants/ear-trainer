import type { Result } from "./format.ts";
import {
  type Alteration,
  type Context,
  type Degree,
  type Event,
  type Note,
  noteOffset,
  notesHighestFirst,
} from "./note.ts";

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

/** Authored harmony, in scale degrees so it stays key-agnostic. */
export type ChordQuality = "major" | "minor" | "diminished" | "augmented";
export type Chord = {
  root: Degree;
  alteration: Alteration;
  quality: ChordQuality;
  seventh?: "minor" | "major";
  /** Authored intent for the bass. Matching uses the realization from cells. */
  bass?: Degree;
};

/** `harmony:${startTicks}` — unique because regions never overlap. */
export type RegionId = string & { readonly __brand: "RegionId" };

/** Chord regions tile the phrase; gaps are legal and mean "no stated harmony". */
export type HarmonyRegion = {
  id: RegionId;
  startTicks: number;
  endTicks: number;
  chord: Chord;
};

export type CorpusHarmony = {
  durationTicks: number;
  /** Omitted where the author does not want to commit to a harmony. */
  chord?: Chord;
};

export type Score = {
  context: Context;
  tempoBpm: number;
  durationTicks: number;
  voices: Voice[];
  measures: Measure[];
  harmony: HarmonyRegion[];
};

export type IdentificationPhraseSuitability =
  "independent" | "context-required" | "exclude";

export type Phrase = Score & {
  id: string;
  melodyId: string;
  phraseIndex: number;
  noteIdentification: IdentificationPhraseSuitability;
  /**
   * Suitability of this phrase's stated harmony for chord identification.
   * Phrases without stated harmony are "exclude".
   */
  chordIdentification: IdentificationPhraseSuitability;
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
  /** Tiles the measure exactly when present; omitted means no stated harmony. */
  harmony?: CorpusHarmony[];
  phraseEnd?: {
    noteIdentification: IdentificationPhraseSuitability;
    chordIdentification?: IdentificationPhraseSuitability;
    rationale: string;
  };
};

export type CorpusMelody = Omit<
  Melody,
  "durationTicks" | "voices" | "measures" | "phrases" | "harmony"
> & {
  measures: CorpusMeasure[];
};

type PhraseBoundary = {
  firstMeasureIndex: number;
  lastMeasureIndex: number;
  noteIdentification: IdentificationPhraseSuitability;
  chordIdentification: IdentificationPhraseSuitability;
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
  const harmony: HarmonyRegion[] = [];
  let scoreCursor = 0;
  let firstPhraseMeasureIndex = 0;
  let phraseHasHarmony = false;

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

    if (authoredMeasure.harmony) {
      phraseHasHarmony = true;
      let harmonyCursor = measureStart;
      for (const [regionIndex, region] of authoredMeasure.harmony.entries()) {
        if (!isPositiveInteger(region.durationTicks)) {
          return failure(
            entry.id,
            `measure ${measureNumber} harmony ${regionIndex + 1} durationTicks must be a positive integer`,
          );
        }
        const regionEnd = harmonyCursor + region.durationTicks;
        if (regionEnd > measureEnd) {
          return failure(
            entry.id,
            `measure ${measureNumber} harmony is overfilled by ${regionEnd - measureEnd} ticks`,
          );
        }
        if (region.chord) {
          harmony.push({
            id: `harmony:${harmonyCursor}` as RegionId,
            startTicks: harmonyCursor,
            endTicks: regionEnd,
            chord: { ...region.chord },
          });
        }
        harmonyCursor = regionEnd;
      }
      if (harmonyCursor < measureEnd) {
        return failure(
          entry.id,
          `measure ${measureNumber} harmony is underfilled by ${measureEnd - harmonyCursor} ticks`,
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
      const { noteIdentification, chordIdentification, rationale } =
        authoredMeasure.phraseEnd;
      if (!isSuitability(noteIdentification)) {
        return failure(
          entry.id,
          `phrase ending at measure ${measureNumber} has unsupported noteIdentification "${String(noteIdentification)}"`,
        );
      }
      if (phraseHasHarmony && chordIdentification === undefined) {
        return failure(
          entry.id,
          `phrase ending at measure ${measureNumber} states harmony, so it must declare chordIdentification`,
        );
      }
      if (
        chordIdentification !== undefined &&
        !isSuitability(chordIdentification)
      ) {
        return failure(
          entry.id,
          `phrase ending at measure ${measureNumber} has unsupported chordIdentification "${String(chordIdentification)}"`,
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
        chordIdentification: chordIdentification ?? "exclude",
        rationale,
      });
      firstPhraseMeasureIndex = measureIndex + 1;
      phraseHasHarmony = false;
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
    const phraseHarmony = harmony
      .filter(
        (region) =>
          region.startTicks >= phraseStart && region.startTicks < phraseEnd,
      )
      .map((region) => ({
        id: `harmony:${region.startTicks - phraseStart}` as RegionId,
        startTicks: region.startTicks - phraseStart,
        endTicks: Math.min(region.endTicks, phraseEnd) - phraseStart,
        chord: { ...region.chord },
      }));
    return {
      id: `${entry.id}:phrase-${phraseIndex + 1}`,
      melodyId: entry.id,
      phraseIndex,
      noteIdentification: boundary.noteIdentification,
      chordIdentification: boundary.chordIdentification,
      rationale: boundary.rationale,
      context: entry.context,
      tempoBpm: entry.tempoBpm,
      durationTicks: phraseEnd - phraseStart,
      voices: phraseVoices,
      measures: phraseMeasures,
      harmony: phraseHarmony,
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
      harmony,
      phrases,
      source: { ...entry.source },
    },
  };
}

/** `${onsetTicks}:${laneIndex}` — unique because a lane holds one note at a time. */
export type CellId = string & { readonly __brand: "CellId" };

/** One note: the unit of display, tap, playback, and answer. */
export type Cell = {
  id: CellId;
  note: Note;
  voiceId: string;
  onsetTicks: number;
  durationTicks: number;
  /** Row in the display grid; see lanes(). */
  laneIndex: number;
};

/** Cells attacking at this tick, highest-sounding first. */
export type Onset = {
  onsetTicks: number;
  cellIds: CellId[];
};

/** One row of the display grid: one slot of one voice. */
export type Lane = {
  voiceId: string;
  slot: number;
};

function laneKey(lane: Lane): string {
  return `${lane.voiceId}:${lane.slot}`;
}

type LaneStats = { lane: Lane; offsetTotal: number; noteCount: number };

function laneStats(score: Score): LaneStats[] {
  const stats = new Map<string, LaneStats>();
  for (const scoreVoice of score.voices) {
    for (const event of scoreVoice.events) {
      for (const [slot, note] of notesHighestFirst(event.notes).entries()) {
        const lane: Lane = { voiceId: scoreVoice.id, slot };
        const key = laneKey(lane);
        const existing = stats.get(key);
        if (existing) {
          existing.offsetTotal += noteOffset(note);
          existing.noteCount += 1;
        } else {
          stats.set(key, {
            lane,
            offsetTotal: noteOffset(note),
            noteCount: 1,
          });
        }
      }
    }
  }
  return [...stats.values()].sort(
    (a, b) =>
      b.offsetTotal / b.noteCount - a.offsetTotal / a.noteCount ||
      a.lane.voiceId.localeCompare(b.lane.voiceId) ||
      a.lane.slot - b.lane.slot,
  );
}

/** Display rows, ordered top to bottom by descending mean pitch. */
export function lanes(score: Score): Lane[] {
  return laneStats(score).map((entry) => entry.lane);
}

/**
 * Ordered by onset ascending, then pitch descending; drives reading and
 * auto-advance order.
 */
export function cells(score: Score): Cell[] {
  const laneIndexes = new Map<string, number>();
  for (const [index, lane] of lanes(score).entries()) {
    laneIndexes.set(laneKey(lane), index);
  }
  const result: Cell[] = [];
  for (const scoreVoice of score.voices) {
    for (const event of scoreVoice.events) {
      for (const [slot, note] of notesHighestFirst(event.notes).entries()) {
        const laneIndex = laneIndexes.get(
          laneKey({ voiceId: scoreVoice.id, slot }),
        );
        if (laneIndex === undefined) {
          throw new Error(
            `melody: no lane for voice "${scoreVoice.id}" slot ${slot}`,
          );
        }
        result.push({
          id: `${event.onsetTicks}:${laneIndex}` as CellId,
          note: { ...note },
          voiceId: scoreVoice.id,
          onsetTicks: event.onsetTicks,
          durationTicks: event.durationTicks,
          laneIndex,
        });
      }
    }
  }
  return result.sort(
    (a, b) =>
      a.onsetTicks - b.onsetTicks ||
      noteOffset(b.note) - noteOffset(a.note) ||
      b.note.degree - a.note.degree ||
      a.voiceId.localeCompare(b.voiceId),
  );
}

export function cellsById(cellList: Cell[]): ReadonlyMap<CellId, Cell> {
  return new Map(cellList.map((cell) => [cell.id, cell]));
}

/** Attack map: onsets in time order, each listing the cells that start there. */
export function onsets(cellList: Cell[]): Onset[] {
  const result: Onset[] = [];
  for (const cell of cellList) {
    const last = result.at(-1);
    if (last && last.onsetTicks === cell.onsetTicks) {
      last.cellIds.push(cell.id);
    } else {
      result.push({ onsetTicks: cell.onsetTicks, cellIds: [cell.id] });
    }
  }
  return result.sort((a, b) => a.onsetTicks - b.onsetTicks);
}

export function onsetAt(onsetList: Onset[], ticks: number): Onset | undefined {
  return onsetList.find((onset) => onset.onsetTicks === ticks);
}

/**
 * Cells audible at `ticks`, including ones attacked earlier and still ringing.
 * Highest first.
 */
export function cellsSoundingAt(cellList: Cell[], ticks: number): CellId[] {
  return cellList
    .filter(
      (cell) =>
        cell.onsetTicks <= ticks &&
        ticks < cell.onsetTicks + cell.durationTicks,
    )
    .sort(
      (a, b) =>
        noteOffset(b.note) - noteOffset(a.note) ||
        b.note.degree - a.note.degree ||
        a.onsetTicks - b.onsetTicks ||
        a.voiceId.localeCompare(b.voiceId),
    )
    .map((cell) => cell.id);
}

export function chordAt(
  harmony: HarmonyRegion[],
  ticks: number,
): Chord | undefined {
  return harmony.find(
    (region) => region.startTicks <= ticks && ticks < region.endTicks,
  )?.chord;
}

function sameChord(a: Chord, b: Chord): boolean {
  return (
    a.root === b.root &&
    a.alteration === b.alteration &&
    a.quality === b.quality &&
    a.seventh === b.seventh
  );
}

/**
 * Regions with immediate repeats of the same chord collapsed; the form
 * progressions match against.
 */
export function chordSequence(harmony: HarmonyRegion[]): HarmonyRegion[] {
  const ordered = [...harmony].sort((a, b) => a.startTicks - b.startTicks);
  const result: HarmonyRegion[] = [];
  for (const region of ordered) {
    const previous = result.at(-1);
    if (
      previous &&
      previous.endTicks === region.startTicks &&
      sameChord(previous.chord, region.chord)
    ) {
      previous.endTicks = region.endTicks;
      continue;
    }
    result.push({ ...region, chord: { ...region.chord } });
  }
  return result;
}

/** How a region was actually played, derived from its cells. */
export type BassPosition = "root" | "first" | "second" | "third" | "non-chord";
export type Texture = "block" | "arpeggiated" | "mixed";
export type Realization = {
  bass: BassPosition;
  texture: Texture;
};

/** Scale degree a diatonic third-stack step above `root`. */
function stackedDegree(root: Degree, steps: number): Degree {
  return (((root - 1 + steps * 2) % 7) + 1) as Degree;
}

function bassPosition(chord: Chord, bass: Note): BassPosition {
  const positions: BassPosition[] = ["root", "first", "second", "third"];
  const slots = chord.seventh ? 4 : 3;
  for (let step = 0; step < slots; step += 1) {
    if (bass.degree === stackedDegree(chord.root, step)) {
      return positions[step];
    }
  }
  return "non-chord";
}

export function cellsInRegion(cellList: Cell[], region: HarmonyRegion): Cell[] {
  return cellList.filter(
    (cell) =>
      cell.onsetTicks < region.endTicks &&
      cell.onsetTicks + cell.durationTicks > region.startTicks,
  );
}

export function realizationOf(
  cellList: Cell[],
  region: HarmonyRegion,
): Realization {
  const inRegion = cellsInRegion(cellList, region);
  const attacks = inRegion.filter(
    (cell) =>
      cell.onsetTicks >= region.startTicks && cell.onsetTicks < region.endTicks,
  );
  const sounding = inRegion.length > 0 ? inRegion : attacks;
  const lowest = sounding.reduce<Cell | undefined>(
    (best, cell) =>
      best === undefined || noteOffset(cell.note) < noteOffset(best.note)
        ? cell
        : best,
    undefined,
  );
  const attackTicks = new Set(attacks.map((cell) => cell.onsetTicks));
  const texture: Texture =
    attackTicks.size <= 1
      ? "block"
      : attackTicks.size === attacks.length
        ? "arpeggiated"
        : "mixed";
  return {
    bass: lowest ? bassPosition(region.chord, lowest.note) : "non-chord",
    texture,
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
