/**
 * Browser-side fixtures for the options screen tests. `views/options.ts` mounts
 * a stylesheet on import, so its specs run inside `page.evaluate` and share
 * their setup through a module the page can import.
 */
import { MicPitchDetector } from "../audio/mic-pitch.ts";
import type {
  PlayButtonId,
  PlayController,
  PlayState,
  PlayStep,
} from "../audio/play-controller.ts";
import { type Profile, ProfileStore } from "../deck/profiles.ts";
import type { KeyValueStore } from "../deck/store.ts";
import type { OptionsCtx } from "../views/options.ts";

export class FakePlay {
  state: PlayState = { status: "idle" };
  toggles: { buttonId: PlayButtonId; step: PlayStep }[] = [];

  getState(): PlayState {
    return this.state;
  }

  toggle(buttonId: PlayButtonId, step: PlayStep): void {
    this.toggles.push({ buttonId, step });
  }
}

function memoryStorage(): KeyValueStore {
  const data: Record<string, string> = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

export function setup(): {
  ctx: OptionsCtx;
  storage: KeyValueStore;
  play: FakePlay;
} {
  const storage = memoryStorage();
  const profiles = new ProfileStore(storage);
  const profile: Profile = {
    id: "p1",
    name: "me",
    color: "#000000",
    tonic: 60,
    cadenceSpeed: "medium",
    drone: true,
  };
  profiles.save(profile);
  const play = new FakePlay();
  return {
    ctx: {
      play: play as unknown as PlayController,
      profile,
      profiles,
      mic: new MicPitchDetector(() => {}),
    },
    storage,
    play,
  };
}

export { ProfileStore };
