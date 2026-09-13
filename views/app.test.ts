import { describe, expect, it, vi } from "vitest";
import type {
  AudioEngine,
  PlaybackEnd,
  PlaybackHandle,
} from "../audio/engine.ts";
import { PlayController, type PlayMsg } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import { ProfileStore } from "../deck/profiles.ts";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import { parsePattern } from "../music/format.ts";
import type { Context, Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import { RouterController } from "../router.ts";
import { type AppCtx, type Msg, type State, update } from "./app.ts";

class ControlledHandle implements PlaybackHandle {
  readonly durationMs = 100;
  readonly ended: Promise<PlaybackEnd>;
  private resolveEnded: (end: PlaybackEnd) => void = () => {};

  constructor() {
    this.ended = new Promise((resolve) => {
      this.resolveEnded = resolve;
    });
  }

  cancel(): void {
    this.resolveEnded("cancelled");
  }

  complete(): void {
    this.resolveEnded("completed");
  }
}

class FakeAudio implements AudioEngine {
  unlocked = true;
  readonly handles: ControlledHandle[] = [];

  async unlock(): Promise<void> {}

  drone: Midi | undefined;
  setDrone(tonic: Midi | undefined): void {
    this.drone = tonic;
  }
  playContext(_context: Context, _tonic: Midi): PlaybackHandle {
    return this.handle();
  }

  playPattern(_pattern: Pattern, _tonic: Midi): PlaybackHandle {
    return this.handle();
  }

  playNote(_note: Midi): PlaybackHandle {
    return this.handle();
  }

  private handle(): ControlledHandle {
    const handle = new ControlledHandle();
    this.handles.push(handle);
    return handle;
  }
}

function memoryStorage(): KeyValueStore {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

function emptyState(page: State["route"]["page"]): State {
  return {
    route: { page },
    trial: { trial: undefined, error: undefined },
    cards: { rows: [], showKnown: false, showDeck: true },
    songs: { songs: [] },
    options: {
      tonic: 60,
      cadenceSpeed: "medium",
      error: undefined,
    },
    start: { status: "idle", error: undefined },
    audioUnlocked: true,
  };
}

function trialContext(play: PlayController): AppCtx["trial"] {
  const profile: Profile = {
    id: "p1",
    name: "me",
    color: "#000000",
    tonic: 60,
    cadenceSpeed: "medium",
    drone: true,
  };
  const deck = new DeckStore(profile.id, memoryStorage());
  const parsed = parsePattern("1-3-5", "major-cadence");
  if (!parsed.ok) throw new Error(parsed.error);
  deck.addPattern(parsed.value.id, new Date("2026-09-11T00:00:00Z"));
  return {
    play,
    deck,
    profile,
    now: () => new Date("2026-09-12T00:00:00Z"),
    profiles: new ProfileStore(memoryStorage()),
  };
}

function appContext(
  play: PlayController,
  route: State["route"],
  audio?: AudioEngine,
): AppCtx {
  const trial = trialContext(play);
  return {
    audio: audio ?? new FakeAudio(),
    play,
    router: new RouterController(route),
    trial,
    cards: { deck: trial.deck, now: trial.now, inventory: [] },
  } as unknown as AppCtx;
}

describe("app playback lifecycle", () => {
  it("routes controller completion through update and the root sync path", async () => {
    const audio = new FakeAudio();
    let dispatch: (msg: Msg) => void;
    const play = new PlayController(audio, (msg: PlayMsg) =>
      dispatch({ type: "PLAY_MSG", msg }),
    );
    const state = emptyState("cards");
    const ctx = appContext(play, state.route);
    const sync = vi.fn();
    dispatch = (msg) => {
      update(state, msg, ctx, dispatch);
      sync(state);
    };

    play.autoplay([{ buttonId: "options:tonic", type: "note", note: 60 }]);
    audio.handles[0].complete();
    await Promise.resolve();

    expect(play.getState()).toEqual({ status: "idle" });
    expect(sync).toHaveBeenCalledOnce();
  });

  it.each(["practice", "options"] as const)(
    "stops playback when leaving %s",
    (page) => {
      const play = {
        stop: vi.fn(),
        autoplay: vi.fn(),
        update: vi.fn(),
        setDrone: vi.fn(),
      } as unknown as PlayController;
      const state = emptyState(page);
      const ctx = appContext(play, state.route);

      update(
        state,
        { type: "NAVIGATE", route: { page: "cards" } },
        ctx,
        () => {},
      );

      expect(play.stop).toHaveBeenCalledOnce();
    },
  );

  it("requests one autoplay sequence when entering practice", () => {
    const play = {
      stop: vi.fn(),
      autoplay: vi.fn(),
      update: vi.fn(),
      setDrone: vi.fn(),
    } as unknown as PlayController;
    const state = emptyState("cards");
    const ctx = appContext(play, state.route);

    update(
      state,
      { type: "NAVIGATE", route: { page: "practice" } },
      ctx,
      () => {},
    );

    expect(play.autoplay).toHaveBeenCalledOnce();
    expect(play.autoplay).toHaveBeenCalledWith([
      {
        buttonId: "trial:context",
        type: "context",
        context: "major-cadence",
        tonic: 60,
        speed: "medium",
      },
      {
        buttonId: "trial:pattern",
        type: "pattern",
        pattern: state.trial.trial?.pattern,
        tonic: 60,
      },
    ]);
  });

  it("starts practice after the audio gate unlocks", () => {
    const audio = new FakeAudio();
    audio.unlocked = false;
    const play = {
      stop: vi.fn(),
      autoplay: vi.fn(),
      update: vi.fn(),
      setDrone: vi.fn(),
    } as unknown as PlayController;
    const state = emptyState("practice");
    state.audioUnlocked = false;
    const ctx = appContext(play, state.route, audio);

    update(
      state,
      { type: "START_MSG", msg: { type: "UNLOCKED" } },
      ctx,
      () => {},
    );

    expect(state.audioUnlocked).toBe(true);
    expect(play.autoplay).toHaveBeenCalledOnce();
  });

  it("leaves other pages reachable while audio is locked", () => {
    const audio = new FakeAudio();
    audio.unlocked = false;
    const play = {
      stop: vi.fn(),
      autoplay: vi.fn(),
      update: vi.fn(),
      setDrone: vi.fn(),
    } as unknown as PlayController;
    const state = emptyState("cards");
    state.audioUnlocked = false;
    const ctx = appContext(play, state.route, audio);

    update(
      state,
      { type: "NAVIGATE", route: { page: "practice" } },
      ctx,
      () => {},
    );

    expect(state.route.page).toBe("practice");
    expect(play.autoplay).not.toHaveBeenCalled();
  });
});
