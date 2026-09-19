import {
  type Cell,
  type CellId,
  cells,
  cellsById,
  cellsSoundingAt,
  onsets,
  type Phrase,
} from "./melody.ts";
import { type Degree, type Note, noteOffset } from "./note.ts";

export type SituationId =
  | "tonic"
  | "dominant-adjacent-tonic"
  | "third-adjacent-tonic"
  | "tonic-triad-movement"
  | "stepwise-2"
  | "stepwise-4"
  | "seventh-adjacent-tonic"
  | "stepwise-6"
  | "stepwise-7"
  | "stepwise-1"
  | "stepwise-3"
  | "stepwise-5"
  | "harmonic-third"
  | "harmonic-fifth"
  | "harmonic-octave"
  | "triad-together"
  | "arpeggiated-triad"
  | "pedal-tone"
  | "ascending-run"
  | "descending-run";

/** Detection family: what a situation is defined over. */
export type SituationKind = "cells";

/** Selector grouping; independent of how the situation is detected. */
export type SituationGroup = "melodic" | "harmony";

export type SituationDefinition = {
  id: SituationId;
  kind: SituationKind;
  group: SituationGroup;
  label: string;
  description: string;
  degrees: readonly Degree[];
};

export type SituationOccurrence = {
  situationId: SituationId;
  cellIds: readonly CellId[];
};

type SituationEntry = Omit<SituationDefinition, "kind" | "group">;

const MELODIC_SITUATIONS: readonly SituationEntry[] = [
  {
    id: "tonic",
    label: "Tonic",
    description: "Natural 1",
    degrees: [1],
  },
  {
    id: "dominant-adjacent-tonic",
    label: "Dominant adjacent to tonic",
    description: "A direct 1 ↔ 5 move",
    degrees: [1, 5],
  },
  {
    id: "third-adjacent-tonic",
    label: "3 adjacent to tonic",
    description: "A direct 1 ↔ 3 move",
    degrees: [1, 3],
  },
  {
    id: "tonic-triad-movement",
    label: "Movement within the tonic triad",
    description: "A run using 1, 3, and 5",
    degrees: [1, 3, 5],
  },
  {
    id: "stepwise-2",
    label: "Stepwise 2",
    description: "1 or 3 moving through 2",
    degrees: [1, 2, 3],
  },
  {
    id: "stepwise-4",
    label: "Stepwise 4",
    description: "3 or 5 moving through 4",
    degrees: [3, 4, 5],
  },
  {
    id: "seventh-adjacent-tonic",
    label: "7 adjacent to tonic",
    description: "A direct 7 ↔ 1 move",
    degrees: [1, 7],
  },
  {
    id: "stepwise-6",
    label: "Stepwise 6",
    description: "5 or 7 moving through 6",
    degrees: [5, 6, 7],
  },
  {
    id: "stepwise-7",
    label: "Stepwise 7",
    description: "6 or 1 moving through 7",
    degrees: [1, 6, 7],
  },
  {
    id: "stepwise-1",
    label: "Stepwise tonic",
    description: "7 or 2 moving through 1",
    degrees: [1, 2, 7],
  },
  {
    id: "stepwise-3",
    label: "Stepwise 3",
    description: "2 or 4 moving through 3",
    degrees: [2, 3, 4],
  },
  {
    id: "stepwise-5",
    label: "Stepwise 5",
    description: "4 or 6 moving through 5",
    degrees: [4, 5, 6],
  },
  {
    id: "ascending-run",
    label: "Ascending run",
    description: "Three or more stepwise notes rising",
    degrees: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: "descending-run",
    label: "Descending run",
    description: "Three or more stepwise notes falling",
    degrees: [1, 2, 3, 4, 5, 6, 7],
  },
];

const HARMONY_SITUATIONS: readonly SituationEntry[] = [
  {
    id: "harmonic-third",
    label: "Third together",
    description: "Two notes a third apart sounding at once",
    degrees: [1, 3],
  },
  {
    id: "harmonic-fifth",
    label: "Fifth together",
    description: "Two notes a fifth apart sounding at once",
    degrees: [1, 5],
  },
  {
    id: "harmonic-octave",
    label: "Octave together",
    description: "The same degree sounding in two registers",
    degrees: [1],
  },
  {
    id: "triad-together",
    label: "Triad together",
    description: "1, 3, and 5 struck as a block",
    degrees: [1, 3, 5],
  },
  {
    id: "arpeggiated-triad",
    label: "Arpeggiated triad",
    description: "1, 3, and 5 stated one after another",
    degrees: [1, 3, 5],
  },
  {
    id: "pedal-tone",
    label: "Pedal tone",
    description: "One note held while others move under or over it",
    degrees: [1, 3, 5],
  },
];

function catalog(
  entries: readonly SituationEntry[],
  group: SituationGroup,
): SituationDefinition[] {
  return entries.map((entry) => ({ ...entry, kind: "cells", group }));
}

export const SITUATIONS: readonly SituationDefinition[] = [
  ...catalog(MELODIC_SITUATIONS, "melodic"),
  ...catalog(HARMONY_SITUATIONS, "harmony"),
];

const DEFINITIONS = new Map(
  SITUATIONS.map((situation) => [situation.id, situation] as const),
);

const PAIR_DEGREES: Partial<Record<SituationId, readonly [Degree, Degree]>> = {
  "dominant-adjacent-tonic": [1, 5],
  "third-adjacent-tonic": [1, 3],
  "seventh-adjacent-tonic": [1, 7],
};

const STEPWISE_DEGREES: Partial<
  Record<SituationId, { center: Degree; neighbors: readonly [Degree, Degree] }>
> = {
  "stepwise-2": { center: 2, neighbors: [1, 3] },
  "stepwise-4": { center: 4, neighbors: [3, 5] },
  "stepwise-6": { center: 6, neighbors: [5, 7] },
  "stepwise-7": { center: 7, neighbors: [6, 1] },
  "stepwise-1": { center: 1, neighbors: [7, 2] },
  "stepwise-3": { center: 3, neighbors: [2, 4] },
  "stepwise-5": { center: 5, neighbors: [4, 6] },
};

/** The highest note attacking at each onset, in time order. */
function topCells(cellList: Cell[]): Cell[] {
  const byId = cellsById(cellList);
  return onsets(cellList).flatMap((onset) => {
    const cell = byId.get(onset.cellIds[0]);
    return cell ? [cell] : [];
  });
}

function naturalNote(cell: Cell | undefined): Note | undefined {
  return cell?.note.alteration === 0 ? cell.note : undefined;
}

function occurrence(
  situationId: SituationId,
  occurrenceCells: readonly Cell[],
): SituationOccurrence {
  return { situationId, cellIds: occurrenceCells.map((cell) => cell.id) };
}

function findPairOccurrences(
  series: Cell[],
  notes: readonly (Note | undefined)[],
  situationId: SituationId,
  degrees: readonly [Degree, Degree],
): SituationOccurrence[] {
  const occurrences: SituationOccurrence[] = [];
  for (let index = 0; index < notes.length - 1; index += 1) {
    const first = notes[index];
    const second = notes[index + 1];
    if (!first || !second) continue;
    if (
      (first.degree === degrees[0] && second.degree === degrees[1]) ||
      (first.degree === degrees[1] && second.degree === degrees[0])
    ) {
      occurrences.push(
        occurrence(situationId, [series[index], series[index + 1]]),
      );
    }
  }
  return occurrences;
}

function findTriadOccurrences(
  series: Cell[],
  notes: readonly (Note | undefined)[],
): SituationOccurrence[] {
  const occurrences: SituationOccurrence[] = [];
  for (let start = 0; start < notes.length; start += 1) {
    const seen = new Set<Degree>();
    for (let end = start; end < notes.length; end += 1) {
      const note = notes[end];
      if (!note || !([1, 3, 5] as const).includes(note.degree as 1 | 3 | 5)) {
        break;
      }
      seen.add(note.degree);
      if (seen.has(1) && seen.has(3) && seen.has(5)) {
        occurrences.push(
          occurrence("tonic-triad-movement", series.slice(start, end + 1)),
        );
      }
    }
  }
  return occurrences;
}

function scalePosition(note: Note): number {
  return note.octave * 7 + note.degree - 1;
}

function isAdjacentScaleStep(first: Note, second: Note): boolean {
  return (
    Math.abs(scalePosition(first) - scalePosition(second)) === 1 &&
    Math.abs(noteOffset(first) - noteOffset(second)) <= 2
  );
}

function findStepwiseOccurrences(
  series: Cell[],
  notes: readonly (Note | undefined)[],
  situationId: SituationId,
  center: Degree,
  neighbors: readonly [Degree, Degree],
): SituationOccurrence[] {
  const occurrences: SituationOccurrence[] = [];
  for (let index = 1; index < notes.length - 1; index += 1) {
    const previous = notes[index - 1];
    const current = notes[index];
    const next = notes[index + 1];
    if (!previous || !current || !next || current.degree !== center) continue;
    if (
      !neighbors.includes(previous.degree) ||
      !neighbors.includes(next.degree) ||
      !isAdjacentScaleStep(previous, current) ||
      !isAdjacentScaleStep(current, next)
    ) {
      continue;
    }
    occurrences.push(
      occurrence(situationId, series.slice(index - 1, index + 2)),
    );
  }
  return occurrences;
}

/** Maximal stepwise runs of three or more top cells moving one direction. */
function findRunOccurrences(
  series: Cell[],
  notes: readonly (Note | undefined)[],
  situationId: SituationId,
  direction: 1 | -1,
): SituationOccurrence[] {
  const occurrences: SituationOccurrence[] = [];
  let start = 0;
  for (let index = 1; index <= notes.length; index += 1) {
    const previous = notes[index - 1];
    const current = notes[index];
    const continues =
      previous !== undefined &&
      current !== undefined &&
      isAdjacentScaleStep(previous, current) &&
      Math.sign(scalePosition(current) - scalePosition(previous)) === direction;
    if (continues) continue;
    if (index - start >= 3) {
      occurrences.push(occurrence(situationId, series.slice(start, index)));
    }
    start = index;
  }
  return occurrences;
}

const TRIAD_DEGREES = [1, 3, 5] as const;

function isTriadTone(note: Note): boolean {
  return (
    note.alteration === 0 &&
    (TRIAD_DEGREES as readonly Degree[]).includes(note.degree)
  );
}

/** Ticks where something attacks, in time order. */
function attackTicks(cellList: Cell[]): number[] {
  return onsets(cellList).map((onset) => onset.onsetTicks);
}

/** Every set of cells audible together, one per attack tick. */
function soundingSets(cellList: Cell[]): Cell[][] {
  const byId = cellsById(cellList);
  return attackTicks(cellList).map((ticks) =>
    cellsSoundingAt(cellList, ticks).flatMap((cellId) => {
      const cell = byId.get(cellId);
      return cell ? [cell] : [];
    }),
  );
}

function findIntervalOccurrences(
  cellList: Cell[],
  situationId: SituationId,
  scaleSteps: number,
): SituationOccurrence[] {
  const occurrences: SituationOccurrence[] = [];
  const seen = new Set<string>();
  for (const sounding of soundingSets(cellList)) {
    for (let a = 0; a < sounding.length; a += 1) {
      for (let b = a + 1; b < sounding.length; b += 1) {
        const [first, second] = [sounding[a], sounding[b]];
        if (first.note.alteration !== 0 || second.note.alteration !== 0) {
          continue;
        }
        const distance = Math.abs(
          scalePosition(first.note) - scalePosition(second.note),
        );
        if (distance !== scaleSteps) continue;
        const key = `${first.id}|${second.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        occurrences.push(occurrence(situationId, [first, second]));
      }
    }
  }
  return occurrences;
}

/** 1, 3, and 5 all sounding at the same instant. */
function findTriadTogetherOccurrences(cellList: Cell[]): SituationOccurrence[] {
  const occurrences: SituationOccurrence[] = [];
  const seen = new Set<string>();
  for (const sounding of soundingSets(cellList)) {
    const tones = sounding.filter((cell) => isTriadTone(cell.note));
    const degrees = new Set(tones.map((cell) => cell.note.degree));
    if (!TRIAD_DEGREES.every((degree) => degrees.has(degree))) continue;
    const key = tones.map((cell) => cell.id).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    occurrences.push(occurrence("triad-together", tones));
  }
  return occurrences;
}

/** 1, 3, and 5 stated one at a time across consecutive single-note onsets. */
function findArpeggiatedTriadOccurrences(
  cellList: Cell[],
): SituationOccurrence[] {
  const sounding = soundingSets(cellList);
  const byId = cellsById(cellList);
  const solo = attackTicks(cellList).map((ticks, index) =>
    sounding[index].length === 1
      ? byId.get(cellsSoundingAt(cellList, ticks)[0])
      : undefined,
  );
  const occurrences: SituationOccurrence[] = [];
  for (let start = 0; start + 2 < solo.length; start += 1) {
    const window = solo.slice(start, start + 3);
    if (window.some((cell) => !cell || !isTriadTone(cell.note))) continue;
    const degrees = new Set(window.map((cell) => cell?.note.degree));
    if (!TRIAD_DEGREES.every((degree) => degrees.has(degree))) continue;
    occurrences.push(
      occurrence("arpeggiated-triad", window.filter(Boolean) as Cell[]),
    );
  }
  return occurrences;
}

/** A cell held across two or more attacks of other cells. */
function findPedalToneOccurrences(cellList: Cell[]): SituationOccurrence[] {
  const occurrences: SituationOccurrence[] = [];
  for (const pedal of cellList) {
    const under = cellList.filter(
      (other) =>
        other.id !== pedal.id &&
        other.onsetTicks > pedal.onsetTicks &&
        other.onsetTicks < pedal.onsetTicks + pedal.durationTicks,
    );
    if (under.length < 2) continue;
    occurrences.push(occurrence("pedal-tone", [pedal, ...under]));
  }
  return occurrences;
}

export function findSituationOccurrences(
  _phrase: Phrase,
  cellList: Cell[],
  situationId: SituationId,
): SituationOccurrence[] {
  switch (situationId) {
    case "harmonic-third":
      return findIntervalOccurrences(cellList, situationId, 2);
    case "harmonic-fifth":
      return findIntervalOccurrences(cellList, situationId, 4);
    case "harmonic-octave":
      return findIntervalOccurrences(cellList, situationId, 7);
    case "triad-together":
      return findTriadTogetherOccurrences(cellList);
    case "arpeggiated-triad":
      return findArpeggiatedTriadOccurrences(cellList);
    case "pedal-tone":
      return findPedalToneOccurrences(cellList);
    default:
      break;
  }

  const series = topCells(cellList);
  const notes = series.map(naturalNote);

  if (situationId === "tonic") {
    return notes.flatMap((note, index) =>
      note?.degree === 1 ? [occurrence(situationId, [series[index]])] : [],
    );
  }
  if (situationId === "tonic-triad-movement") {
    return findTriadOccurrences(series, notes);
  }
  if (situationId === "ascending-run" || situationId === "descending-run") {
    return findRunOccurrences(
      series,
      notes,
      situationId,
      situationId === "ascending-run" ? 1 : -1,
    );
  }
  const pair = PAIR_DEGREES[situationId];
  if (pair) return findPairOccurrences(series, notes, situationId, pair);
  const stepwise = STEPWISE_DEGREES[situationId];
  if (stepwise) {
    return findStepwiseOccurrences(
      series,
      notes,
      situationId,
      stepwise.center,
      stepwise.neighbors,
    );
  }
  return [];
}

export function phraseMatchesSituation(
  phrase: Phrase,
  situationId: SituationId,
): boolean {
  return (
    findSituationOccurrences(phrase, cells(phrase), situationId).length > 0
  );
}

export function promptDegreesForSituations(
  situationIds: readonly SituationId[],
): Degree[] {
  const degrees = new Set<Degree>();
  for (const situationId of situationIds) {
    for (const degree of DEFINITIONS.get(situationId)?.degrees ?? []) {
      degrees.add(degree);
    }
  }
  return [...degrees].sort((a, b) => a - b);
}
