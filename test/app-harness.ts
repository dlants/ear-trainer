/**
 * Browser-side fixtures for the app specs. The specs run their bodies inside
 * `page.evaluate`, so the shared setup has to live in a module the page can
 * import rather than in the Node-side test file.
 */
import type {
  AudioEngine,
  PlaybackEnd,
  PlaybackHandle,
} from "../audio/engine.ts";
import type { PlayController } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import { ProfileStore } from "../deck/profiles.ts";
import { DeckStore, type KeyValueStore } from "../deck/store.ts";
import { parsePattern } from "../music/format.ts";
import type { Score } from "../music/melody.ts";
import type { Context, Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import { RouterController } from "../router.ts";
import type { AppCtx, State } from "../views/app.ts";

export class ControlledHandle implements PlaybackHandle {
  readonly durationMs = 100;
  readonly cues = [];
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

export class FakeAudio implements AudioEngine {
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

  playScore(_score: Score, _tonic: Midi): PlaybackHandle {
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

/** Records every controller call the way `vi.fn()` used to. */
export class RecordingPlay {
  readonly stop: unknown[][] = [];
  readonly autoplay: unknown[][] = [];
  readonly setDrone: unknown[][] = [];

  asController(): PlayController {
    return {
      stop: (...args: unknown[]) => this.stop.push(args),
      autoplay: (...args: unknown[]) => this.autoplay.push(args),
      update: () => {},
      setDrone: (...args: unknown[]) => this.setDrone.push(args),
    } as unknown as PlayController;
  }
}

function memoryStorage(): KeyValueStore {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

export function emptyState(page: State["route"]["page"]): State {
  return {
    route: { page },
    trial: { trial: undefined, error: undefined },
    cards: { rows: [], showKnown: false, showDeck: true },
    songs: { songs: [] },
    options: {
      tonic: 60,
      cadenceSpeed: "medium",
      mic: { status: "off" },
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

export function appContext(
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
    options: { mic: { stop: () => {} } },
  } as unknown as AppCtx;
}
