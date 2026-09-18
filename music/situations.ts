import { type Phrase, voice } from "./melody.ts";
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
  | "stepwise-5";

export type SituationDefinition = {
  id: SituationId;
  label: string;
  description: string;
  degrees: readonly Degree[];
};

export type SituationOccurrence = {
  situationId: SituationId;
  eventIndexes: readonly number[];
};

export const SITUATIONS: readonly SituationDefinition[] = [
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

function naturalNote(notes: readonly Note[]): Note | undefined {
  const note = notes.length === 1 ? notes[0] : undefined;
  return note?.alteration === 0 ? note : undefined;
}

function occurrence(
  situationId: SituationId,
  eventIndexes: number[],
): SituationOccurrence {
  return { situationId, eventIndexes };
}

function findPairOccurrences(
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
      occurrences.push(occurrence(situationId, [index, index + 1]));
    }
  }
  return occurrences;
}

function findTriadOccurrences(
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
          occurrence(
            "tonic-triad-movement",
            Array.from(
              { length: end - start + 1 },
              (_, offset) => start + offset,
            ),
          ),
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
    occurrences.push(occurrence(situationId, [index - 1, index, index + 1]));
  }
  return occurrences;
}

export function findSituationOccurrences(
  phrase: Phrase,
  situationId: SituationId,
): SituationOccurrence[] {
  const events = voice(phrase, "melody")?.events ?? [];
  const notes = events.map((event) => naturalNote(event.notes));

  if (situationId === "tonic") {
    return notes.flatMap((note, index) =>
      note?.degree === 1 ? [occurrence(situationId, [index])] : [],
    );
  }
  if (situationId === "tonic-triad-movement") {
    return findTriadOccurrences(notes);
  }
  const pair = PAIR_DEGREES[situationId];
  if (pair) return findPairOccurrences(notes, situationId, pair);
  const stepwise = STEPWISE_DEGREES[situationId];
  if (stepwise) {
    return findStepwiseOccurrences(
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
  return findSituationOccurrences(phrase, situationId).length > 0;
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
