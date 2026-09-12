import {
  type Alteration,
  type Context,
  type Degree,
  type Event,
  isDegree,
  makePattern,
  type Note,
  type Pattern,
  sortEventNotes,
} from "./note.ts";

export type Formatter = "numeric" | "solfege";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const SOLFEGE_NATURAL = ["do", "re", "mi", "fa", "sol", "la", "ti"];
const SOLFEGE_SHARP: (string | null)[] = [
  "di",
  "ri",
  null,
  "fi",
  "si",
  "li",
  null,
];
const SOLFEGE_FLAT: (string | null)[] = [
  null,
  "ra",
  "me",
  null,
  "se",
  "le",
  "te",
];

function accidentalGlyph(alteration: Alteration): string {
  return alteration === 1 ? "♯" : alteration === -1 ? "♭" : "";
}

function octaveGlyphs(octave: number): string {
  return (octave > 0 ? "↑" : "↓").repeat(Math.abs(octave));
}

function formatNote(note: Note, formatter: Formatter): string {
  const octave = octaveGlyphs(note.octave);
  if (formatter === "numeric") {
    return `${accidentalGlyph(note.alteration)}${note.degree}${octave}`;
  }
  const i = note.degree - 1;
  const syllable =
    note.alteration === 1
      ? SOLFEGE_SHARP[i]
      : note.alteration === -1
        ? SOLFEGE_FLAT[i]
        : SOLFEGE_NATURAL[i];
  if (syllable) return `${syllable}${octave}`;
  return `${accidentalGlyph(note.alteration)}${SOLFEGE_NATURAL[i]}${octave}`;
}

export function formatPattern(p: Pattern, formatter: Formatter): string {
  return p.events
    .map((e) =>
      sortEventNotes(e.notes)
        .map((n) => formatNote(n, formatter))
        .join("+"),
    )
    .join("-");
}

const FLATS = new Set(["b", "♭"]);
const SHARPS = new Set(["#", "♯"]);
const UP = new Set(["^", "↑", "'"]);
const DOWN = new Set(["v", "↓", ","]);

function parseNote(token: string): Result<Note> {
  const chars = [...token.trim()];
  if (chars.length === 0) return { ok: false, error: "empty note" };
  let i = 0;
  let alteration: Alteration = 0;
  const first = chars[i] as string;
  if (FLATS.has(first)) {
    alteration = -1;
    i++;
  } else if (SHARPS.has(first)) {
    alteration = 1;
    i++;
  }
  const digit = Number(chars[i]);
  if (!isDegree(digit)) {
    return { ok: false, error: `expected a degree 1-7 in "${token}"` };
  }
  i++;
  let octave = 0;
  for (; i < chars.length; i++) {
    const c = chars[i] as string;
    if (UP.has(c)) octave++;
    else if (DOWN.has(c)) octave--;
    else return { ok: false, error: `unexpected "${c}" in "${token}"` };
  }
  return { ok: true, value: { degree: digit as Degree, alteration, octave } };
}

/**
 * `-` separates events in time, `+` stacks notes within one event and binds
 * tighter than `-`.
 */
export function parsePattern(input: string, context: Context): Result<Pattern> {
  const trimmed = input.trim();
  if (trimmed === "") return { ok: false, error: "empty pattern" };
  const events: Event[] = [];
  for (const eventToken of trimmed.split("-")) {
    const notes: Note[] = [];
    for (const noteToken of eventToken.split("+")) {
      const note = parseNote(noteToken);
      if (!note.ok) return note;
      notes.push(note.value);
    }
    events.push({ notes });
  }
  return { ok: true, value: makePattern(context, events) };
}

export { canonicalForm } from "./note.ts";
