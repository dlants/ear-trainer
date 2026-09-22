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
import type { PlayController, PlayState } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import { ProfileStore } from "../deck/profiles.ts";
import type { KeyValueStore } from "../deck/store.ts";
import { MELODIES } from "../inventory/melodies.ts";
import type { Score } from "../music/melody.ts";
import type { Context, Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import { RouterController } from "../router.ts";
import type { AppCtx, State } from "../views/app.ts";
import { situationPhraseIndex } from "../views/tonic-practice.ts";
import { DismissStack } from "../views/dropdown.ts";

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
  unlockCalls = 0;
  readonly handles: ControlledHandle[] = [];

  async unlock(): Promise<void> {
    this.unlockCalls += 1;
    this.unlocked = true;
  }

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

  playNotes(_notes: Midi[]): PlaybackHandle {
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
  state: PlayState = { status: "idle" };
  readonly stop: unknown[][] = [];
  readonly autoplay: unknown[][] = [];
  readonly setDrone: unknown[][] = [];
  readonly toggle: unknown[][] = [];

  asController(): PlayController {
    return {
      stop: (...args: unknown[]) => this.stop.push(args),
      autoplay: (...args: unknown[]) => this.autoplay.push(args),
      toggle: (...args: unknown[]) => this.toggle.push(args),
      update: () => {},
      getState: () => this.state,
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

export function emptyState(route: State["route"]): State {
  return {
    route,
    identifyNotes: {
      screen: "practice",
      selectedSituationIds: ["tonic"],
      phraseIndex: situationPhraseIndex([]),
      trial: undefined,
      tonic: 60,
      droneOn: false,
    },
    melodies: { expandedId: undefined },
    options: {
      lowNote: 53,
      highNote: 72,
      cadenceSpeed: "medium",
      mic: { status: "off" },
      error: undefined,
    },
    audioUnlocked: true,
    audioUnlocking: false,
    pendingIdentifyMsg: undefined,
    pendingOptionsMsg: undefined,
    pendingMelodiesMsg: undefined,
    pendingMelodyPageMsg: undefined,
  };
}

export function appContext(
  play: PlayController,
  route: State["route"],
  audio?: AudioEngine,
): AppCtx {
  const storage = memoryStorage();
  const profiles = new ProfileStore(storage);
  const profile: Profile = {
    id: "p1",
    name: "me",
    color: "#000000",
    tonic: 60,
    lowNote: 53,
    highNote: 72,
    cadenceSpeed: "medium",
    drone: true,
  };
  profiles.save(profile);
  return {
    audio: audio ?? new FakeAudio(),
    play,
    router: new RouterController(route),
    dismissStack: new DismissStack(),
    identifyNotes: {
      play,
      profile,
      melodies: MELODIES,
      storage,
      random: () => 0,
    },
    melodies: { play, profile, melodies: MELODIES },
    melodyPage: { play, profile, melodies: MELODIES },
    options: {
      play,
      profile,
      profiles,
      mic: { stop: () => {} },
    },
  } as unknown as AppCtx;
}
