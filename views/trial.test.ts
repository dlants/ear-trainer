import { beforeEach, describe, expect, it } from "vitest";
import type {
  PlayButtonId,
  PlayController,
  PlayStep,
} from "../audio/play-controller.ts";
import { makeCardId } from "../deck/card.ts";
import type { Profile } from "../deck/profiles.ts";
import { ProfileStore } from "../deck/profiles.ts";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import { parsePattern } from "../music/format.ts";
import type { Pattern } from "../music/note.ts";
import {
  initialState,
  type Msg,
  type State,
  type TrialCtx,
  TrialView,
  update,
} from "./trial.ts";

type PlayCall =
  | { type: "autoplay"; steps: PlayStep[] }
  | { type: "toggle"; buttonId: PlayButtonId; step: PlayStep }
  | { type: "stop" };

class FakePlay {
  calls: PlayCall[] = [];
  state: ReturnType<PlayController["getState"]> = { status: "idle" };

  getState(): ReturnType<PlayController["getState"]> {
    return this.state;
  }

  autoplay(steps: PlayStep[]): void {
    this.calls.push({ type: "autoplay", steps });
  }

  toggle(buttonId: PlayButtonId, step: PlayStep): void {
    this.calls.push({ type: "toggle", buttonId, step });
  }

  drones: (number | undefined)[] = [];
  setDrone(tonic: number | undefined): void {
    this.drones.push(tonic);
  }
  stop(): void {
    this.calls.push({ type: "stop" });
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
    tonic: 60,
    cadenceSpeed: "medium",
    drone: true,
    ...overrides,
  };
  const deck = new DeckStore(profile.id, memoryStorage());
  const profiles = new ProfileStore(memoryStorage());
  const play = new FakePlay();
  const ctx: TrialCtx = {
    play: play as unknown as PlayController,
    deck,
    profile,
    now: () => new Date("2026-01-01T00:00:00Z"),
    profiles,
  };
  return { ctx, deck, play, profile, profiles };
}

function start(ctx: TrialCtx): {
  state: State;
  dispatch: (msg: Msg) => void;
} {
  const state = initialState(ctx);
  const dispatch = (msg: Msg) => update(state, msg, ctx);
  dispatch({ type: "NEXT_TRIAL" });
  return { state, dispatch };
}

function preferMode(
  deck: DeckStore,
  patternId: Pattern["id"],
  mode: "transcription" | "audiation",
): void {
  const other = mode === "transcription" ? "audiation" : "transcription";
  const card = deck.getState().cards[makeCardId(patternId, other)];
  if (!card) throw new Error("no card");
  card.fsrs.due = new Date("2027-01-01T00:00:00Z");
}

function expectAutoplay(call: PlayCall | undefined): PlayStep[] {
  expect(call?.type).toBe("autoplay");
  return call?.type === "autoplay" ? call.steps : [];
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

  it("autoplays context then pattern for a transcription presentation", () => {
    const { state } = start(env.ctx);
    const trial = state.trial;
    expect(trial?.card.mode).toBe("transcription");
    expect(expectAutoplay(env.play.calls[0])).toEqual([
      {
        buttonId: "trial:context",
        type: "context",
        context: trial?.pattern.context,
        tonic: 60,
        speed: "medium",
      },
      {
        buttonId: "trial:pattern",
        type: "pattern",
        pattern: trial?.pattern,
        tonic: 60,
      },
    ]);
  });

  it("autoplays only context and gates manual pattern play in audiation", () => {
    const patternId = pattern("1-3-5").id;
    preferMode(env.deck, patternId, "audiation");
    const { state, dispatch } = start(env.ctx);

    expect(state.trial?.card.mode).toBe("audiation");
    expect(expectAutoplay(env.play.calls[0])).toEqual([
      {
        buttonId: "trial:context",
        type: "context",
        context: state.trial?.pattern.context,
        tonic: 60,
        speed: "medium",
      },
    ]);
    env.play.calls = [];
    dispatch({ type: "PLAY_PATTERN" });
    expect(env.play.calls).toEqual([]);
  });

  it("audiation reveal replaces presentation playback with only the pattern", () => {
    const { state, dispatch } = start(env.ctx);
    withMode(state, env.deck, "audiation");
    env.play.calls = [];

    dispatch({ type: "COMMIT", confidence: "known" });

    expect(expectAutoplay(env.play.calls[0])).toEqual([
      {
        buttonId: "trial:pattern",
        type: "pattern",
        pattern: state.trial?.pattern,
        tonic: 60,
      },
    ]);
    dispatch({ type: "PLAY_PATTERN" });
    expect(env.play.calls[1]?.type).toBe("toggle");
  });

  it("does not autoplay again when revealing a transcription trial", () => {
    const { dispatch } = start(env.ctx);
    env.play.calls = [];

    dispatch({ type: "COMMIT", confidence: "known" });

    expect(env.play.calls).toEqual([]);
  });

  it("plays pattern audio in transcription during presentation", () => {
    const { state, dispatch } = start(env.ctx);
    withMode(state, env.deck, "transcription");
    dispatch({ type: "PLAY_PATTERN" });
    expect(env.play.calls.at(-1)).toMatchObject({
      type: "toggle",
      buttonId: "trial:pattern",
    });
  });

  it("uses the configured tonic on every trial", () => {
    const { state, dispatch } = start(env.ctx);
    expect(state.trial?.tonic).toBe(60);
    dispatch({ type: "COMMIT", confidence: "known" });
    dispatch({ type: "GRADE", outcome: "missed" });
    expect(state.trial?.tonic).toBe(60);
  });

  it("replaces active trial playback when grading selects the next trial", () => {
    const { dispatch } = start(env.ctx);
    dispatch({ type: "COMMIT", confidence: "known" });
    env.play.calls = [];

    dispatch({ type: "GRADE", outcome: "got-it" });

    expect(env.play.calls).toHaveLength(1);
    expect(expectAutoplay(env.play.calls[0])).toHaveLength(1);
  });

  it("holds the trial tonic under the drone by default", () => {
    start(env.ctx);
    expect(env.play.drones).toEqual([60]);
  });
  it("toggling the drone persists on the profile and survives the next trial", () => {
    const { dispatch } = start(env.ctx);

    dispatch({ type: "TOGGLE_DRONE" });

    expect(env.profile.drone).toBe(false);
    expect(env.profiles.get("p1")?.drone).toBe(false);
    expect(env.play.drones.at(-1)).toBeUndefined();

    dispatch({ type: "COMMIT", confidence: "known" });
    dispatch({ type: "GRADE", outcome: "got-it" });
    expect(env.play.drones.at(-1)).toBeUndefined();
  });
  it("clears the drone when nothing is due", () => {
    const empty = setup();
    start(empty.ctx);
    expect(empty.play.drones).toEqual([undefined]);
  });
  it("stops playback when nothing is due", () => {
    const empty = setup();
    const { state } = start(empty.ctx);
    expect(state.trial).toBeUndefined();
    expect(empty.play.calls).toEqual([{ type: "stop" }]);
  });

  it("shows mode-specific instructions and the confident action", () => {
    const { state, dispatch } = start(env.ctx);
    const container = document.createElement("div");
    const view = new TrialView(container, dispatch, state, env.ctx);

    expect(container.textContent).toContain("identify the notes");
    expect(container.textContent).toContain("confident");

    withMode(state, env.deck, "audiation");
    view.sync(state);
    expect(container.textContent).toContain("sing these notes");
  });

  it("renders sequence spacing, stacked harmonies, and octave modifiers", () => {
    const { state, dispatch } = start(env.ctx);
    const trial = state.trial;
    if (!trial) throw new Error("no trial");
    state.trial = {
      ...trial,
      pattern: pattern("5^-3v-1+3+5"),
      phase: "revealing",
    };
    const container = document.createElement("div");
    new TrialView(container, dispatch, state, env.ctx);

    const events = [...container.querySelectorAll("[data-notation-event]")];
    expect(events).toHaveLength(3);
    expect(
      events.map((event) =>
        [...event.querySelectorAll("[data-notation-note]")]
          .map((note) => note.textContent?.trim())
          .join(""),
      ),
    ).toEqual(["5↑", "3↓", "135"]);
    expect(events[2]?.querySelectorAll("[data-notation-note]")).toHaveLength(3);
    expect(events[0]?.querySelector("sup")?.textContent).toBe("↑");
    expect(events[1]?.querySelector("sub")?.textContent).toBe("↓");
    expect(container.textContent).not.toContain("5↑-");
  });

  it("moves the active treatment from context to pattern during autoplay", () => {
    const { state, dispatch } = start(env.ctx);
    const container = document.createElement("div");
    const view = new TrialView(container, dispatch, state, env.ctx);
    const contextButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="play key"]',
    );
    const patternButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="play pattern"]',
    );

    env.play.state = {
      status: "playing",
      buttonId: "trial:context",
      durationMs: 900,
      queueLength: 1,
    };
    view.sync(state);
    expect(contextButton?.getAttribute("aria-pressed")).toBe("true");
    expect(patternButton?.getAttribute("aria-pressed")).toBe("false");

    env.play.state = {
      status: "playing",
      buttonId: "trial:pattern",
      durationMs: 700,
      queueLength: 0,
    };
    view.sync(state);
    expect(contextButton?.getAttribute("aria-pressed")).toBe("false");
    expect(patternButton?.getAttribute("aria-pressed")).toBe("true");
    expect(patternButton?.style.getPropertyValue("--play-duration")).toBe(
      "700ms",
    );
  });
});
