import { registerSW } from "virtual:pwa-register";
import "./theme.ts";
import { type AudioEngine, soundfontEngine } from "./audio/engine.ts";
import { PlayController } from "./audio/play-controller.ts";

import { type Profile, ProfileStore } from "./deck/profiles.ts";
import { DeckStore } from "./deck/store.ts";
import { INVENTORY } from "./inventory/patterns.ts";
import { SONGS } from "./inventory/songs.ts";
import type { Midi } from "./music/pitch.ts";
import { currentRoute, RouterController, RouterView } from "./router.ts";
import { startStartup } from "./startup.ts";
import { noop } from "./vamp.ts";
import type { AddPatternsCtx } from "./views/add-patterns.ts";
import {
  type AppCtx,
  type Msg as AppMsg,
  AppView,
  initialState as appInitialState,
  update as appUpdate,
} from "./views/app.ts";
import { DismissStack } from "./views/dropdown.ts";
import type { SongsCtx } from "./views/songs.ts";
import type { TrialCtx } from "./views/trial.ts";

function requireElement(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
}

const app = requireElement("app");

const DEFAULT_PROFILE: Profile = {
  id: "default",
  name: "me",
  color: "#4478ff",
  tonicMode: "fixed",
  tonic: 60,
};

const TONIC_RANGE: [Midi, Midi] = [55, 67];

function startApp(audio: AudioEngine): void {
  const profiles = new ProfileStore(localStorage);
  let profile = profiles.active();
  if (!profile) {
    profile = profiles.list()[0] ?? DEFAULT_PROFILE;
    profiles.save(profile);
    profiles.setActive(profile.id);
  }

  const trialCtx: TrialCtx = {
    audio,
    deck: new DeckStore(profile.id, localStorage),
    profile,
    now: () => new Date(),
    randomTonic: () => {
      const [low, high] = TONIC_RANGE;
      return low + Math.floor(Math.random() * (high - low + 1));
    },
  };
  const songsCtx: SongsCtx = {
    deck: trialCtx.deck,
    now: trialCtx.now,
    songs: SONGS,
  };
  const cardsCtx: AddPatternsCtx = {
    deck: trialCtx.deck,
    now: trialCtx.now,
    inventory: INVENTORY,
  };
  const initialRoute = currentRoute();
  const play = new PlayController(audio, noop);
  const router = new RouterController(initialRoute);
  const ctx: AppCtx = {
    play,
    router,
    dismissStack: new DismissStack(),
    trial: trialCtx,
    cards: cardsCtx,
    songs: songsCtx,
  };
  const state = appInitialState(initialRoute, ctx);
  let dispatching = false;
  let view: AppView;
  let routerView: RouterView;

  const dispatch = (msg: AppMsg): void => {
    if (dispatching) throw new Error("dispatch-in-dispatch");
    dispatching = true;
    appUpdate(state, msg, ctx, dispatch);
    view.sync(state);
    routerView.sync();
    dispatching = false;
  };

  state.route = router.update({
    type: "NAVIGATE",
    route: initialRoute,
    kind: "replace",
  });
  view = new AppView(app, dispatch, state, ctx);
  routerView = new RouterView(router, dispatch);
  routerView.sync();
  routerView.mount();
}

const audio = soundfontEngine("acoustic_grand_piano");
startStartup({
  container: app,
  audio,
  window,
  storage: localStorage,
  ready: startApp,
});

registerSW({ immediate: true });
