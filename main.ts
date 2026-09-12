import { registerSW } from "virtual:pwa-register";
import { soundfontEngine } from "./audio/engine.ts";
import { type Profile, ProfileStore } from "./deck/profiles.ts";
import { DeckStore } from "./deck/store.ts";
import { INVENTORY } from "./inventory/patterns.ts";
import { SONGS } from "./inventory/songs.ts";
import type { Midi } from "./music/pitch.ts";
import { DISMISS_KEY, installEnv, shouldShowInstall } from "./pwa/install.ts";
import {
  type Msg as AddMsg,
  type AddPatternsCtx,
  AddPatternsView,
  type State as AddState,
  initialState as addInitialState,
  update as addUpdate,
  rows,
} from "./views/add-patterns.ts";
import { InstallView } from "./views/install.ts";
import {
  type SongsCtx,
  type Msg as SongsMsg,
  type State as SongsState,
  SongsView,
  rows as songRows,
  initialState as songsInitialState,
  update as songsUpdate,
} from "./views/songs.ts";
import {
  initialState,
  type Msg,
  type State,
  type TrialCtx,
  TrialView,
  update,
} from "./views/trial.ts";

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

const addCtx: AddPatternsCtx = {
  deck: ctx.deck,
  now: ctx.now,
  inventory: INVENTORY,
};

/**
 * A real router lands with the app shell; for now the two screens are swapped
 * by remounting, each with its own dispatch loop.
 */
type Page = "trial" | "add" | "songs";

const trialState: State = initialState(ctx);
const songsCtx: SongsCtx = { deck: ctx.deck, now: ctx.now, songs: SONGS };

const addState: AddState = addInitialState(addCtx);
let trialView: TrialView | undefined;
let addView: AddPatternsView | undefined;
const songsState: SongsState = songsInitialState(songsCtx);
let songsView: SongsView | undefined;
let dispatching = false;

function guard<M>(run: (msg: M) => void): (msg: M) => void {
  return (msg) => {
    if (dispatching) throw new Error("dispatch-in-dispatch");
    dispatching = true;
    run(msg);
    dispatching = false;
  };
}

const dispatch = guard<Msg>((msg) => {
  update(trialState, msg, ctx, dispatch);
  trialView?.sync(trialState);
});

const addDispatch = guard<AddMsg>((msg) => {
  addUpdate(addState, msg, addCtx);
  addView?.sync(addState);
});

const songsDispatch = guard<SongsMsg>((msg) => {
  songsUpdate(songsState, msg, songsCtx);
  songsView?.sync(songsState);
});

function show(page: Page): void {
  trialView?.destroy();
  addView?.destroy();
  songsView?.destroy();
  trialView = undefined;
  addView = undefined;
  songsView = undefined;
  if (page === "trial") {
    trialView = new TrialView(app, dispatch, trialState);
  } else if (page === "add") {
    addView = new AddPatternsView(app, addDispatch, addState);
  } else {
    songsView = new SongsView(app, songsDispatch, songsState);
  }
}

document
  .getElementById("nav-practice")
  ?.addEventListener("click", () => show("trial"));
document.getElementById("nav-add")?.addEventListener("click", () => {
  addState.rows = rows(addCtx);
  show("add");
});

document.getElementById("nav-songs")?.addEventListener("click", () => {
  songsState.songs = songRows(songsCtx);
  show("songs");
});

const nav = requireElement("nav");

function startApp(): void {
  nav.style.display = "";
  show("trial");
}

const installState = { env: installEnv(window, localStorage) };
if (shouldShowInstall(installState.env)) {
  nav.style.display = "none";
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
