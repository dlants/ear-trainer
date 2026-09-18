import { expect, test } from "@playwright/test";
import type {
  AudioEngine,
  PlaybackHandle,
  ScorePlaybackRange,
} from "../audio/engine.ts";
import { PlayController } from "../audio/play-controller.ts";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import type { Melody, Phrase } from "../music/melody.ts";
import type { Context, Note, Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import { phraseMatchesSituation } from "../music/situations.ts";
import {
  type IdentifyNotesCtx,
  initialIdentifyNotesState,
  selectIdentifyNotesPhrase,
  updateIdentifyNotes,
} from "./tonic-practice.ts";

function note(
  degree: Note["degree"],
  alteration: Note["alteration"] = 0,
  octave = 0,
): Note {
  return { degree, alteration, octave };
}

function phrase(
  melodyId: string,
  phraseIndex: number,
  suitability: Phrase["noteIdentification"] = "independent",
  measureCount = 2,
): Phrase {
  const durationTicks = measureCount * 48;
  return {
    id: `${melodyId}:phrase-${phraseIndex + 1}`,
    melodyId,
    phraseIndex,
    noteIdentification: suitability,
    rationale: "Test rationale.",
    context: "major-cadence",
    tempoBpm: 120,
    durationTicks,
    measures: Array.from({ length: measureCount }, (_, index) => ({
      startTicks: index * 48,
      endTicks: (index + 1) * 48,
      beatDurationsTicks: [24, 24],
    })),
    voices: [
      {
        id: "melody",
        events: [
          { notes: [note(1, 0, -1)], onsetTicks: 0, durationTicks: 12 },
          { notes: [note(1, 1)], onsetTicks: 24, durationTicks: 12 },
          { notes: [note(1, 0, 1)], onsetTicks: 48, durationTicks: 12 },
          { notes: [note(5)], onsetTicks: 72, durationTicks: 12 },
        ].filter((event) => event.onsetTicks < durationTicks),
      },
      {
        id: "accompaniment",
        events: [{ notes: [note(1)], onsetTicks: 12, durationTicks: 24 }],
      },
    ],
  };
}

function phraseWithDegrees(
  melodyId: string,
  phraseIndex: number,
  degrees: readonly Note["degree"][],
): Phrase {
  const selected = phrase(melodyId, phraseIndex);
  selected.voices[0] = {
    id: "melody",
    events: degrees.map((degree, index) => ({
      notes: [note(degree)],
      onsetTicks: index * 12,
      durationTicks: 12,
    })),
  };
  return selected;
}

function melody(id: string, phrases: Phrase[]): Melody {
  const durationTicks = phrases.reduce(
    (total, candidate) => total + candidate.durationTicks,
    0,
  );
  return {
    id,
    title: id,
    context: "major-cadence",
    tempoBpm: 120,
    durationTicks,
    measures: [],
    voices: [],
    phrases,
    source: { description: "Test fixture", status: "original" },
  };
}

class FakeAudio implements AudioEngine {
  unlocked = true;
  readonly calls: string[] = [];

  async unlock(): Promise<void> {}

  setDrone(_tonic: Midi | undefined): void {}

  playContext(_context: Context, _tonic: Midi): PlaybackHandle {
    return this.handle("context");
  }

  playPattern(_pattern: Pattern, _tonic: Midi): PlaybackHandle {
    return this.handle("pattern");
  }

  playScore(
    score: Phrase,
    tonic: Midi,
    range?: ScorePlaybackRange,
  ): PlaybackHandle {
    const suffix = range ? `:${range.startTicks}-${range.endTicks}` : "";
    return this.handle(`score:${score.id}:${tonic}${suffix}`);
  }

  playNote(noteMidi: Midi): PlaybackHandle {
    return this.handle(`note:${noteMidi}`);
  }

  private handle(call: string): PlaybackHandle {
    this.calls.push(call);
    return {
      durationMs: 100,
      cues: [],
      ended: new Promise(() => {}),
      cancel() {},
    };
  }
}

function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

function setup(melodies: Melody[], random: () => number = () => 0) {
  const audio = new FakeAudio();
  const play = new PlayController(audio, () => {});
  const ctx: IdentifyNotesCtx = {
    play,
    profile: {
      id: "profile",
      name: "Test",
      color: "blue",
      tonic: 60,
      cadenceSpeed: "medium",
      drone: false,
    },
    melodies,
    random,
  };
  return { audio, ctx };
}

test.describe("identify-notes phrase selection", () => {
  test("chooses an eligible target situation before choosing its phrase", () => {
    const commonFirst = phraseWithDegrees("common-first", 0, [1, 2, 2]);
    const commonSecond = phraseWithDegrees("common-second", 0, [1, 4, 4]);
    const rare = phraseWithDegrees("rare", 0, [1, 5]);
    const selected = selectIdentifyNotesPhrase(
      [
        melody("common-first", [commonFirst]),
        melody("common-second", [commonSecond]),
        melody("rare", [rare]),
      ],
      ["tonic", "dominant-adjacent-tonic"],
      undefined,
      sequence(0.75, 0, 0),
    );

    expect(selected).toEqual({
      phrase: rare,
      targetSituationId: "dominant-adjacent-tonic",
    });
  });

  test("supports focused and cumulative selection without frequency weighting", () => {
    const tonicOnly = phraseWithDegrees("tonic-only", 0, [1, 2, 2]);
    const dominant = phraseWithDegrees("dominant", 0, [5, 1]);
    const melodies = [
      melody("tonic-only", [tonicOnly]),
      melody("dominant", [dominant]),
    ];

    const focused = selectIdentifyNotesPhrase(
      melodies,
      ["dominant-adjacent-tonic"],
      undefined,
      sequence(0, 0, 0),
    );
    expect(focused?.targetSituationId).toBe("dominant-adjacent-tonic");
    expect(
      focused &&
        phraseMatchesSituation(focused.phrase, "dominant-adjacent-tonic"),
    ).toBe(true);

    expect(
      selectIdentifyNotesPhrase(
        melodies,
        ["tonic", "dominant-adjacent-tonic"],
        undefined,
        sequence(0, 0, 0),
      )?.targetSituationId,
    ).toBe("tonic");
    expect(
      selectIdentifyNotesPhrase(
        melodies,
        ["tonic", "dominant-adjacent-tonic"],
        undefined,
        sequence(0.99, 0, 0),
      )?.targetSituationId,
    ).toBe("dominant-adjacent-tonic");
  });

  test("skips uncovered targets and returns undefined when none are covered", () => {
    const tonic = phraseWithDegrees("tonic", 0, [1, 4]);
    expect(
      selectIdentifyNotesPhrase(
        [melody("tonic", [tonic])],
        ["stepwise-2", "tonic"],
        undefined,
        sequence(0.99, 0, 0),
      )?.targetSituationId,
    ).toBe("tonic");
    expect(
      selectIdentifyNotesPhrase(
        [melody("tonic", [tonic])],
        ["stepwise-2"],
        undefined,
        () => 0,
      ),
    ).toBeUndefined();
    expect(
      selectIdentifyNotesPhrase([], [], undefined, () => 0),
    ).toBeUndefined();
  });

  test("avoids immediate melody and phrase repeats within the chosen target", () => {
    const first = phraseWithDegrees("first", 0, [1, 5]);
    const firstAlternative = phraseWithDegrees("first", 1, [5, 1]);
    const second = phraseWithDegrees("second", 0, [1, 5]);
    const melodies = [
      melody("first", [first, firstAlternative]),
      melody("second", [second]),
    ];

    expect(
      selectIdentifyNotesPhrase(
        melodies,
        ["dominant-adjacent-tonic"],
        first,
        sequence(0, 0, 0),
      )?.phrase,
    ).toBe(second);
    expect(
      selectIdentifyNotesPhrase(
        [melody("first", [first, firstAlternative])],
        ["dominant-adjacent-tonic"],
        first,
        sequence(0, 0, 0),
      )?.phrase,
    ).toBe(firstAlternative);
  });
});

test.describe("identify-notes reducer", () => {
  test("starts on the selector with only tonic enabled and no audio", () => {
    const state = initialIdentifyNotesState();
    expect(state).toEqual({
      screen: "situations",
      selectedSituationIds: ["tonic"],
      trial: undefined,
      droneOn: false,
    });
  });

  test("allows an empty selection but begins only with an eligible target", () => {
    const tonic = phraseWithDegrees("tonic", 0, [1, 4]);
    const { audio, ctx } = setup([melody("tonic", [tonic])]);
    const state = initialIdentifyNotesState();

    updateIdentifyNotes(
      state,
      { type: "TOGGLE_SITUATION", situationId: "tonic" },
      ctx,
    );
    updateIdentifyNotes(state, { type: "BEGIN" }, ctx);
    expect(state.screen).toBe("situations");
    expect(state.trial).toBeUndefined();
    expect(audio.calls).toEqual([]);

    updateIdentifyNotes(
      state,
      { type: "TOGGLE_SITUATION", situationId: "stepwise-2" },
      ctx,
    );
    updateIdentifyNotes(state, { type: "BEGIN" }, ctx);
    expect(state.screen).toBe("situations");
    expect(state.trial).toBeUndefined();

    updateIdentifyNotes(
      state,
      { type: "TOGGLE_SITUATION", situationId: "tonic" },
      ctx,
    );
    updateIdentifyNotes(state, { type: "BEGIN" }, ctx);
    expect(state.screen).toBe("practice");
    expect(state.trial?.targetSituationId).toBe("tonic");
    expect(audio.calls).toEqual([`score:${tonic.id}:60`]);
  });

  test("stores the target and snapshots the union vocabulary for each trial", () => {
    const dominant = phraseWithDegrees("dominant", 0, [1, 5]);
    const { ctx } = setup(
      [melody("dominant", [dominant])],
      sequence(0.99, 0, 0),
    );
    const state = initialIdentifyNotesState();
    updateIdentifyNotes(
      state,
      {
        type: "TOGGLE_SITUATION",
        situationId: "dominant-adjacent-tonic",
      },
      ctx,
    );
    updateIdentifyNotes(state, { type: "BEGIN" }, ctx);

    expect(state.trial?.targetSituationId).toBe("dominant-adjacent-tonic");
    expect(state.trial?.promptDegrees).toEqual([1, 5]);
    updateIdentifyNotes(
      state,
      { type: "TOGGLE_SITUATION", situationId: "stepwise-2" },
      ctx,
    );
    expect(state.trial?.promptDegrees).toEqual([1, 5]);
  });

  test("rejects answers outside the trial vocabulary and locks after reveal", () => {
    const tonic = phraseWithDegrees("tonic", 0, [1, 4]);
    const { ctx } = setup([melody("tonic", [tonic])]);
    const state = initialIdentifyNotesState();
    updateIdentifyNotes(state, { type: "BEGIN" }, ctx);
    updateIdentifyNotes(state, { type: "SELECT_SLOT", eventIndex: 0 }, ctx);
    updateIdentifyNotes(state, { type: "SET_ANSWER", answer: 3 }, ctx);
    expect(state.trial?.answers[0]).toBeUndefined();
    updateIdentifyNotes(state, { type: "SET_ANSWER", answer: "other" }, ctx);
    expect(state.trial?.answers[0]).toBe("other");
    updateIdentifyNotes(state, { type: "SET_ANSWER", answer: undefined }, ctx);
    expect(state.trial?.answers[0]).toBeUndefined();
    updateIdentifyNotes(state, { type: "REVEAL" }, ctx);
    updateIdentifyNotes(state, { type: "SET_ANSWER", answer: 1 }, ctx);
    expect(state.trial?.answers[0]).toBeUndefined();
  });

  test("owns guesses, playback cursor, reveal, next, and bounded viewport state", () => {
    const first = phrase("only", 0, "independent", 5);
    const second = phrase("only", 1, "independent", 4);
    const { audio, ctx } = setup(
      [melody("only", [first, second])],
      sequence(0, 0, 0, 0, 0, 0),
    );
    const state = initialIdentifyNotesState();

    updateIdentifyNotes(state, { type: "BEGIN" }, ctx);
    expect(state.trial?.answers).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    updateIdentifyNotes(state, { type: "SELECT_SLOT", eventIndex: 2 }, ctx);
    updateIdentifyNotes(state, { type: "SET_ANSWER", answer: 1 }, ctx);
    expect(state.trial?.answers).toEqual([undefined, undefined, 1, undefined]);

    if (!state.trial) throw new Error("missing trial");
    updateIdentifyNotes(state, { type: "SCROLL", delta: 1 }, ctx);
    updateIdentifyNotes(state, { type: "SCROLL", delta: 1 }, ctx);
    updateIdentifyNotes(state, { type: "SCROLL", delta: 1 }, ctx);
    expect(state.trial.firstVisibleMeasureIndex).toBe(2);

    updateIdentifyNotes(state, { type: "PLAY_EVENT", eventIndex: 2 }, ctx);
    expect(state.trial.cursorEventIndex).toBe(2);
    updateIdentifyNotes(state, { type: "PLAY_PAUSE" }, ctx);
    expect(ctx.play.getState()).toEqual({ status: "idle" });
    updateIdentifyNotes(state, { type: "PLAY_PAUSE" }, ctx);
    updateIdentifyNotes(state, { type: "PLAY_FROM_BEGINNING" }, ctx);
    expect(state.trial.cursorEventIndex).toBe(0);
    expect(state.trial.firstVisibleMeasureIndex).toBe(0);

    updateIdentifyNotes(state, { type: "REVEAL" }, ctx);
    expect(state.trial.phase).toBe("revealed");
    updateIdentifyNotes(state, { type: "NEXT" }, ctx);
    expect(state.trial?.phrase).toBe(second);
    expect(state.trial?.answers.every((answer) => answer === undefined)).toBe(
      true,
    );
    expect(audio.calls).toEqual([
      `score:${first.id}:60`,
      `score:${first.id}:60:48-60`,
      `score:${first.id}:60:48-240`,
      `score:${first.id}:60`,
      `score:${second.id}:60`,
    ]);
  });

  test("returns to the selector with playback, drone, and trial cleaned up", () => {
    const tonic = phraseWithDegrees("tonic", 0, [1, 4]);
    const { ctx } = setup([melody("tonic", [tonic])]);
    const state = initialIdentifyNotesState();
    updateIdentifyNotes(state, { type: "BEGIN" }, ctx);
    updateIdentifyNotes(state, { type: "TOGGLE_DRONE" }, ctx);
    expect(state.droneOn).toBe(true);

    updateIdentifyNotes(state, { type: "CHANGE_SITUATIONS" }, ctx);

    expect(state.screen).toBe("situations");
    expect(state.selectedSituationIds).toEqual(["tonic"]);
    expect(state.trial).toBeUndefined();
    expect(state.droneOn).toBe(false);
    expect(ctx.play.getState()).toEqual({ status: "idle" });
  });
});

test("exercise generation is independent from deck persistence", () => {
  const storageWrites: string[] = [];
  const storage: KeyValueStore = {
    getItem: () => null,
    setItem: (key) => storageWrites.push(key),
  };
  const deck = new DeckStore("profile", storage);
  const before = deck.getState();
  const selected = phrase("selected", 0);
  const { ctx } = setup([melody("selected", [selected])]);
  const state = initialIdentifyNotesState();

  updateIdentifyNotes(state, { type: "BEGIN" }, ctx);

  expect(deck.getState()).toEqual(before);
  expect(storageWrites).toEqual([]);
});
