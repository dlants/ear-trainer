import { registerSW } from "virtual:pwa-register";
import "./theme.ts";
import { soundfontEngine } from "./audio/engine.ts";
import { type Profile, ProfileStore } from "./deck/profiles.ts";
import { DeckStore } from "./deck/store.ts";
import { INVENTORY } from "./inventory/patterns.ts";
import { SONGS } from "./inventory/songs.ts";
import type { Midi } from "./music/pitch.ts";
import { DISMISS_KEY, installEnv, shouldShowInstall } from "./pwa/install.ts";
import { currentRoute, RouterController, RouterView } from "./router.ts";
import type { AddPatternsCtx } from "./views/add-patterns.ts";
import {
  type AppCtx,
  type Msg as AppMsg,
  AppView,
  initialState as appInitialState,
  update as appUpdate,
} from "./views/app.ts";
import { DismissStack } from "./views/dropdown.ts";
import { InstallView } from "./views/install.ts";
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

const profiles = new ProfileStore(localStorage);
let profile = profiles.active();
if (!profile) {
  profile = profiles.list()[0] ?? DEFAULT_PROFILE;
  profiles.save(profile);
  profiles.setActive(profile.id);
}

const trialCtx: TrialCtx = {
  audio: soundfontEngine("acoustic_grand_piano"),
  deck: new DeckStore(profile.id, localStorage),
  profile,
  now: () => new Date(),
  randomTonic: () => {
    const [low, high] = TONIC_RANGE;
    return low + Math.floor(Math.random() * (high - low + 1));
  },
};

const cardsCtx: AddPatternsCtx = {
  deck: trialCtx.deck,
  now: trialCtx.now,
  inventory: INVENTORY,
};

const songsCtx: SongsCtx = {
  deck: trialCtx.deck,
  now: trialCtx.now,
  songs: SONGS,
};

function startApp(): void {
  const initialRoute = currentRoute();
  const router = new RouterController(initialRoute);
  const ctx: AppCtx = {
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

const installState = { env: installEnv(window, localStorage) };
if (shouldShowInstall(installState.env)) {
  const installView = new InstallView(
    app,
    () => {
      localStorage.setItem(DISMISS_KEY, "1");
      installView.destroy();
      startApp();
    },
    installState,
  );
} else {
  startApp();
}

registerSW({ immediate: true });
