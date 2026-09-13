import { type Context, type Event, type Note, noteOffset } from "./note.ts";

export type Midi = number;

export function noteToMidi(note: Note, tonic: Midi): Midi {
  return tonic + noteOffset(note);
}

function note(degree: number, alteration: number, octave: number): Note {
  return {
    degree: degree as Note["degree"],
    alteration: alteration as Note["alteration"],
    octave,
  };
}

function chord(spec: [number, number, number][]): Event {
  return { notes: spec.map(([d, a, o]) => note(d, a, o)) };
}

/**
 * Two voices only: a root-position bass line 1-4-5-1 below the home register
 * and a single guide tone above it. Thin voicings keep the bass root — the
 * strongest specifier of the tonal center — from being masked, and the upper
 * voice lands on the tonic so the cadence hands the learner the home note.
 */
export function cadenceChords(context: Context): Event[] {
  const major = context === "major-cadence";
  const third = major ? 0 : -1;
  const submediant = major ? 0 : -1;
  return [
    chord([
      [1, 0, -1],
      [3, third, 0],
    ]),
    chord([
      [4, 0, -1],
      [6, submediant, -1],
    ]),
    chord([
      [5, 0, -1],
      [7, 0, -1],
    ]),
    chord([
      [1, 0, -1],
      [1, 0, 0],
    ]),
  ];
}

export function cadenceMidi(context: Context, tonic: Midi): Midi[][] {
  return cadenceChords(context).map((e) =>
    e.notes.map((n) => noteToMidi(n, tonic)),
  );
}
