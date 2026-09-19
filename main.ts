import { registerSW } from "virtual:pwa-register";
import "./theme.ts";
import { type AudioEngine, soundfontEngine } from "./audio/engine.ts";
import { MicPitchDetector } from "./audio/mic-pitch.ts";
import { PlayController } from "./audio/play-controller.ts";

import { type Profile, ProfileStore } from "./deck/profiles.ts";
import { MELODIES } from "./inventory/melodies.ts";
import { currentRoute, RouterController, RouterView } from "./router.ts";
import { startStartup } from "./startup.ts";
import {
  type AppCtx,
  type Msg as AppMsg,
  AppView,
  initialState as appInitialState,
  update as appUpdate,
} from "./views/app.ts";
import { DismissStack } from "./views/dropdown.ts";

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
  tonic: 60,
  lowNote: 48,
  highNote: 72,
  cadenceSpeed: "medium",
  drone: true,
};

function startApp(audio: AudioEngine): void {
  const profiles = new ProfileStore(localStorage);
  let profile = profiles.active();
  if (!profile) {
    profile = profiles.list()[0] ?? DEFAULT_PROFILE;
    profiles.save(profile);
    profiles.setActive(profile.id);
  }
  const activeProfile = profile;
  let dispatch: (msg: AppMsg) => void;
  const play = new PlayController(audio, (msg) =>
    dispatch({ type: "PLAY_MSG", msg }),
  );
  const initialRoute = currentRoute();
  const router = new RouterController(initialRoute);
  const ctx: AppCtx = {
    audio,
    play,
    router,
    dismissStack: new DismissStack(),
    identifyNotes: {
      play,
      profile: activeProfile,
      melodies: MELODIES,
      storage: localStorage,
      random: () => Math.random(),
    },
    melodies: {
      play,
      profile: activeProfile,
      melodies: MELODIES,
    },
    melodyPage: {
      play,
      profile: activeProfile,
      melodies: MELODIES,
    },
    options: {
      play,
      profile: activeProfile,
      profiles,
      mic: new MicPitchDetector((msg) =>
        dispatch({ type: "OPTIONS_MSG", msg: { type: "MIC_MSG", msg } }),
      ),
    },
  };
  const state = appInitialState(initialRoute, ctx);
  let dispatching = false;
  let view: AppView;
  let routerView: RouterView;

  dispatch = (msg: AppMsg): void => {
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

// A sung timbre sustains and matches the effector learners answer with.
const audio = soundfontEngine("voice_oohs");
startStartup({
  container: app,
  audio,
  window,
  storage: localStorage,
  ready: startApp,
});

registerSW({ immediate: true });
