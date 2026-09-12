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

/** Root-position voicings sitting just below and around the home register. */
export function cadenceChords(context: Context): Event[] {
  const tonicTriad: [number, number, number][] =
    context === "major-cadence"
      ? [
          [1, 0, 0],
          [3, 0, 0],
          [5, 0, 0],
        ]
      : [
          [1, 0, 0],
          [3, -1, 0],
          [5, 0, 0],
        ];
  const subdominant: [number, number, number][] =
    context === "major-cadence"
      ? [
          [4, 0, -1],
          [6, 0, -1],
          [1, 0, 0],
        ]
      : [
          [4, 0, -1],
          [6, -1, -1],
          [1, 0, 0],
        ];
  const dominant: [number, number, number][] = [
    [5, 0, -1],
    [7, 0, -1],
    [2, 0, 0],
  ];
  return [
    chord(tonicTriad),
    chord(subdominant),
    chord(dominant),
    chord(tonicTriad),
  ];
}

export function cadenceMidi(context: Context, tonic: Midi): Midi[][] {
  return cadenceChords(context).map((e) =>
    e.notes.map((n) => noteToMidi(n, tonic)),
  );
}
