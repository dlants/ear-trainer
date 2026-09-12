import { soundfontEngine } from "./audio/engine.ts";
import { type Profile, ProfileStore } from "./deck/profiles.ts";
import { DeckStore } from "./deck/store.ts";
import type { Midi } from "./music/pitch.ts";
import {
  initialState,
  type Msg,
  type State,
  type TrialCtx,
  TrialView,
  update,
} from "./views/trial.ts";

const container = document.getElementById("app");
if (!container) throw new Error("missing #app");

const DEFAULT_PROFILE: Profile = {
  id: "default",
  name: "me",
  color: "#4478ff",
  tonicMode: "fixed",
  tonic: 60,
};

const TONIC_RANGE: [Midi, Midi] = [55, 67];

const profiles = new ProfileStore(localStorage);
let profile = profiles.active();
if (!profile) {
  profile = profiles.list()[0] ?? DEFAULT_PROFILE;
  profiles.save(profile);
  profiles.setActive(profile.id);
}

const ctx: TrialCtx = {
  audio: soundfontEngine("acoustic_grand_piano"),
  deck: new DeckStore(profile.id, localStorage),
  profile,
  now: () => new Date(),
  randomTonic: () => {
    const [low, high] = TONIC_RANGE;
    return low + Math.floor(Math.random() * (high - low + 1));
  },
};

const state: State = initialState(ctx);
let dispatching = false;

function dispatch(msg: Msg): void {
  if (dispatching) throw new Error("dispatch-in-dispatch");
  dispatching = true;
  update(state, msg, ctx, dispatch);
  view.sync(state);
  dispatching = false;
}

const view = new TrialView(container, dispatch, state);
