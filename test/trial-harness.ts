/**
 * Browser-side fixtures for the trial view tests. The specs run their bodies
 * inside `page.evaluate`, so the shared setup has to live in a module the page
 * can import rather than in the Node-side test file.
 */
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
  update,
} from "../views/trial.ts";

export type PlayCall =
  | { type: "autoplay"; steps: PlayStep[] }
  | { type: "toggle"; buttonId: PlayButtonId; step: PlayStep }
  | { type: "stop" };

export class FakePlay {
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

export function pattern(input: string): Pattern {
  const result = parsePattern(input, "major-cadence");
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

export function setup(overrides: Partial<Profile> = {}): {
  ctx: TrialCtx;
  deck: DeckStore;
  play: FakePlay;
  profile: Profile;
  profiles: ProfileStore;
} {
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

/** The default environment for the trial flow: one pattern already due. */
export function setupDue(): ReturnType<typeof setup> {
  const env = setup();
  env.deck.addPattern(pattern("1-3-5").id, new Date("2025-12-31T00:00:00Z"));
  return env;
}

export function start(ctx: TrialCtx): {
  state: State;
  dispatch: (msg: Msg) => void;
} {
  const state = initialState(ctx);
  const dispatch = (msg: Msg) => update(state, msg, ctx);
  dispatch({ type: "NEXT_TRIAL" });
  return { state, dispatch };
}

export function preferMode(
  deck: DeckStore,
  patternId: Pattern["id"],
  mode: "transcription" | "audiation",
): void {
  const other = mode === "transcription" ? "audiation" : "transcription";
  const card = deck.getState().cards[makeCardId(patternId, other)];
  if (!card) throw new Error("no card");
  card.fsrs.due = new Date("2027-01-01T00:00:00Z");
}

export function withMode(
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
