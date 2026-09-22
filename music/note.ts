export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Alteration = -1 | 0 | 1;

/**
 * `octave: 0` is the home register — the band `[tonic, tonic + 12)` established
 * by the context. Octaves are never normalized: they are part of identity.
 */
export type Note = { degree: Degree; alteration: Alteration; octave: number };
export type Event = { notes: Note[] };

export type Context = "major-cadence" | "minor-cadence";

export type PatternId = string & { readonly __brand: "PatternId" };
export type Pattern = { id: PatternId; context: Context; events: Event[] };

/** Semitones above the tonic for each degree of the major scale. */
const DEGREE_SEMITONES: Record<Degree, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
};

/** Signed semitone offset from the tonic. Used for ordering, not for pitch. */
export function noteOffset(note: Note): number {
  return DEGREE_SEMITONES[note.degree] + note.alteration + 12 * note.octave;
}

export function isDegree(n: number): n is Degree {
  return Number.isInteger(n) && n >= 1 && n <= 7;
}

/**
 * Notes within an event are serialized low to high, so `1+5` and `5+1` are the
 * same pattern. Ties (e.g. `#4` and `b5`) are broken by degree so the order is
 * total and stable.
 */
export function sortEventNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => noteOffset(a) - noteOffset(b) || a.degree - b.degree,
  );
}

/** Highest first, for displays that stack an event's notes top to bottom. */
export function notesHighestFirst(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => noteOffset(b) - noteOffset(a) || b.degree - a.degree,
  );
}

function canonicalNote(note: Note): string {
  const accidental =
    note.alteration === 1 ? "#" : note.alteration === -1 ? "b" : "";
  const mark = note.octave > 0 ? "^" : "v";
  const octave = mark.repeat(Math.abs(note.octave));
  return `${accidental}${note.degree}${octave}`;
}

/**
 * ASCII-only, stable serialization of a pattern. `PatternId` embeds this, so it
 * must never change with the display formatter.
 */
export function canonicalForm(context: Context, events: Event[]): string {
  const body = events
    .map((e) => sortEventNotes(e.notes).map(canonicalNote).join("+"))
    .join("-");
  return `${context}|${body}`;
}

export function makePattern(context: Context, events: Event[]): Pattern {
  const normalized = events.map((e) => ({ notes: sortEventNotes(e.notes) }));
  return {
    id: canonicalForm(context, normalized) as PatternId,
    context,
    events: normalized,
  };
}
