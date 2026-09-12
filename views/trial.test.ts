import { beforeEach, describe, expect, it } from "vitest";
import type { AudioEngine, PlaybackHandle } from "../audio/engine.ts";
import { makeCardId } from "../deck/card.ts";
import type { Profile } from "../deck/profiles.ts";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import { parsePattern } from "../music/format.ts";
import type { Context, Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import {
  initialState,
  type Msg,
  type State,
  type TrialCtx,
  update,
} from "./trial.ts";

const HANDLE: PlaybackHandle = { cancel() {} };

class FakeAudio implements AudioEngine {
  unlocked = true;
  calls: string[] = [];
  async unlock(): Promise<void> {
    this.unlocked = true;
  }
  playContext(context: Context, tonic: Midi): PlaybackHandle {
    this.calls.push(`context:${context}:${tonic}`);
    return HANDLE;
  }
  playPattern(pattern: Pattern, tonic: Midi): PlaybackHandle {
    this.calls.push(`pattern:${pattern.id}:${tonic}`);
    return HANDLE;
  }
}

function memoryStorage(): KeyValueStore {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

function pattern(input: string): Pattern {
  const result = parsePattern(input, "major-cadence");
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

function setup(overrides: Partial<Profile> = {}) {
  const profile: Profile = {
    id: "p1",
    name: "a",
    color: "#000",
    tonicMode: "fixed",
    tonic: 60,
    ...overrides,
  };
  const deck = new DeckStore(profile.id, memoryStorage());
  const audio = new FakeAudio();
  const tonics = [61, 62, 63, 64];
  let tonicIndex = 0;
  const ctx: TrialCtx = {
    audio,
    deck,
    profile,
    now: () => new Date("2026-01-01T00:00:00Z"),
    randomTonic: () => tonics[tonicIndex++ % tonics.length],
  };
  return { ctx, deck, audio, profile };
}

function start(ctx: TrialCtx): {
  state: State;
  dispatch: (msg: Msg) => void;
} {
  const state = initialState(ctx);
  const dispatch = (msg: Msg) => update(state, msg, ctx, dispatch);
  return { state, dispatch };
}

function withMode(
  state: State,
  deck: DeckStore,
  mode: "transcription" | "audiation",
): void {
  const trial = state.trial;
  if (!trial) throw new Error("no trial");
  const card = deck.getState().cards[makeCardId(trial.pattern.id, mode)];
  if (!card) throw new Error("no card");
  state.trial = { ...trial, card };
}

describe("trial flow", () => {
  let env: ReturnType<typeof setup>;

  beforeEach(() => {
    env = setup();
    env.deck.addPattern(pattern("1-3-5").id, new Date("2025-12-31T00:00:00Z"));
  });

  it("writes exactly one log entry per trial with the committed pair", () => {
    const { state, dispatch } = start(env.ctx);
    const cardId = state.trial?.card.id;
    dispatch({ type: "COMMIT", confidence: "unsure" });
    expect(state.trial?.phase).toBe("revealing");
    dispatch({ type: "GRADE", outcome: "got-it" });

    const log = env.deck.getState().log;
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({
      cardId,
      confidence: "unsure",
      outcome: "got-it",
    });
  });

  it("replays nothing into the deck, in either phase", () => {
    const { state, dispatch } = start(env.ctx);
    const before = JSON.stringify(env.deck.getState());
    dispatch({ type: "PLAY_CONTEXT" });
    dispatch({ type: "PLAY_PATTERN" });
    dispatch({ type: "COMMIT", confidence: "known" });
    dispatch({ type: "PLAY_CONTEXT" });
    dispatch({ type: "PLAY_PATTERN" });
    expect(JSON.stringify(env.deck.getState())).toBe(before);
    expect(state.trial?.phase).toBe("revealing");
  });

  it("gates pattern audio in audiation until reveal", () => {
    const { state, dispatch } = start(env.ctx);
    withMode(state, env.deck, "audiation");

    dispatch({ type: "PLAY_PATTERN" });
    expect(env.audio.calls).toEqual([]);

    dispatch({ type: "COMMIT", confidence: "known" });
    dispatch({ type: "PLAY_PATTERN" });
    expect(env.audio.calls).toHaveLength(1);
  });

  it("plays pattern audio in transcription during presentation", () => {
    const { state, dispatch } = start(env.ctx);
    withMode(state, env.deck, "transcription");
    dispatch({ type: "PLAY_PATTERN" });
    expect(env.audio.calls).toHaveLength(1);
  });

  it("uses the configured tonic on every trial when fixed", () => {
    const { state, dispatch } = start(env.ctx);
    expect(state.trial?.tonic).toBe(60);
    dispatch({ type: "COMMIT", confidence: "known" });
    dispatch({ type: "GRADE", outcome: "missed" });
    expect(state.trial?.tonic).toBe(60);
  });

  it("re-randomizes the tonic per trial when moving", () => {
    const moving = setup({ tonicMode: "moving" });
    moving.deck.addPattern(
      pattern("1-3-5").id,
      new Date("2025-12-31T00:00:00Z"),
    );
    const { state, dispatch } = start(moving.ctx);
    expect(state.trial?.tonic).toBe(61);
    dispatch({ type: "COMMIT", confidence: "known" });
    dispatch({ type: "GRADE", outcome: "missed" });
    expect(state.trial?.tonic).toBe(62);
  });

  it("leaves FSRS state untouched when tonicMode changes", () => {
    const { dispatch } = start(env.ctx);
    dispatch({ type: "COMMIT", confidence: "known" });
    dispatch({ type: "GRADE", outcome: "got-it" });
    const graded = JSON.stringify(env.deck.getState().cards);

    env.ctx.profile.tonicMode = "moving";
    start(env.ctx);
    expect(JSON.stringify(env.deck.getState().cards)).toBe(graded);
  });

  it("has no trial when nothing is due", () => {
    const empty = setup();
    const { state } = start(empty.ctx);
    expect(state.trial).toBeUndefined();
  });
});
