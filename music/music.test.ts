import { describe, expect, it } from "vitest";
import { formatPattern, parsePattern, type Result } from "./format.ts";
import type { Note, Pattern } from "./note.ts";
import { cadenceMidi, noteToMidi } from "./pitch.ts";

function parse(
  input: string,
  context: "major-cadence" | "minor-cadence" = "major-cadence",
): Pattern {
  const r: Result<Pattern> = parsePattern(input, context);
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

function firstNote(p: Pattern): Note {
  const note = p.events[0]?.notes[0];
  if (!note) throw new Error("no notes");
  return note;
}

describe("pattern identity", () => {
  it("keeps octaves distinct", () => {
    const ids = ["5-1", "5-1^", "5v-1"].map((s) => parse(s).id);
    expect(new Set(ids).size).toBe(3);
  });

  it("is scoped by context", () => {
    expect(parse("1-3-5").id).not.toBe(parse("1-3-5", "minor-cadence").id);
  });

  it("distinguishes #4 from b5 even though they sound the same", () => {
    const sharp4 = parse("#4");
    const flat5 = parse("b5");
    expect(sharp4.id).not.toBe(flat5.id);
    expect(formatPattern(sharp4, "numeric")).toBe("♯4");
    expect(formatPattern(flat5, "numeric")).toBe("♭5");
    const midi = (p: Pattern) => noteToMidi(firstNote(p), 60);
    expect(midi(sharp4)).toBe(midi(flat5));
  });

  it("is independent of tonic", () => {
    const p = parse("1-♭3-5");
    expect(p.id).toBe(parse("1-b3-5").id);
    const at60 = p.events.map((e) => e.notes.map((n) => noteToMidi(n, 60)));
    const at65 = p.events.map((e) => e.notes.map((n) => noteToMidi(n, 65)));
    expect(at65).toEqual(at60.map((e) => e.map((m) => m + 5)));
  });

  it("transposes the cadence by the same amount as the pattern", () => {
    const at60 = cadenceMidi("major-cadence", 60);
    const at67 = cadenceMidi("major-cadence", 67);
    expect(at67).toEqual(at60.map((c) => c.map((m) => m + 7)));
  });

  it("sorts notes within an event", () => {
    expect(parse("5+1").id).toBe(parse("1+5").id);
  });
});

describe("parsing", () => {
  it("binds + tighter than -", () => {
    const p = parse("1+3-5");
    expect(p.events.length).toBe(2);
    expect(p.events[0]?.notes.length).toBe(2);
  });

  it("accepts ascii aliases", () => {
    expect(parse("b3-#4-1^-5v").id).toBe(parse("♭3-♯4-1↑-5↓").id);
    expect(parse("1'-5,").id).toBe(parse("1^-5v").id);
  });

  it("stacks octave marks", () => {
    expect(firstNote(parse("1^^")).octave).toBe(2);
    expect(firstNote(parse("1vv")).octave).toBe(-2);
  });

  it("rejects garbage", () => {
    for (const bad of ["", "8", "x", "1-", "b", "1$"]) {
      expect(parsePattern(bad, "major-cadence").ok).toBe(false);
    }
  });

  it("round-trips through the numeric formatter", () => {
    for (const input of [
      "1-2-3-4-5-6-7",
      "1+3+5-4+6",
      "♭3-♯4-♭7",
      "5↓-1-5↑",
      "1↓↓-1↑↑",
      "♯4+♭5",
    ]) {
      const p = parse(input);
      expect(parse(formatPattern(p, "numeric"))).toEqual(p);
    }
  });
});

describe("formatting", () => {
  it("formats solfege", () => {
    expect(formatPattern(parse("1-b3-5"), "solfege")).toBe("do-me-sol");
    expect(formatPattern(parse("#4-1^"), "solfege")).toBe("fi-do↑");
  });
});

describe("noteToMidi", () => {
  it("matches a hand-written table", () => {
    const cases: [string, number, number][] = [
      ["1", 60, 60],
      ["5", 60, 67],
      ["7", 60, 71],
      ["1^", 60, 72],
      ["5v", 60, 55],
      ["b3", 62, 65],
      ["1vv", 60, 36],
    ];
    for (const [input, tonic, midi] of cases) {
      expect(noteToMidi(firstNote(parse(input)), tonic)).toBe(midi);
    }
  });

  it("voices a major cadence as I-IV-V-I", () => {
    expect(cadenceMidi("major-cadence", 60)).toEqual([
      [60, 64, 67],
      [53, 57, 60],
      [55, 59, 62],
      [60, 64, 67],
    ]);
  });

  it("voices a minor cadence as i-iv-V-i", () => {
    expect(cadenceMidi("minor-cadence", 60)).toEqual([
      [60, 63, 67],
      [53, 56, 60],
      [55, 59, 62],
      [60, 63, 67],
    ]);
  });
});
