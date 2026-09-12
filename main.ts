import { soundfontEngine } from "./audio/engine.ts";
import { type Profile, ProfileStore } from "./deck/profiles.ts";
import { DeckStore } from "./deck/store.ts";
import { INVENTORY } from "./inventory/patterns.ts";
import type { Midi } from "./music/pitch.ts";
import {
  type Msg as AddMsg,
  type AddPatternsCtx,
  AddPatternsView,
  type State as AddState,
  initialState as addInitialState,
  update as addUpdate,
  rows,
} from "./views/add-patterns.ts";
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
type Page = "trial" | "add";

const trialState: State = initialState(ctx);
const addState: AddState = addInitialState(addCtx);
let trialView: TrialView | undefined;
let addView: AddPatternsView | undefined;
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

function show(page: Page): void {
  trialView?.destroy();
  addView?.destroy();
  trialView = undefined;
  addView = undefined;
  if (page === "trial") {
    trialView = new TrialView(app, dispatch, trialState);
  } else {
    addView = new AddPatternsView(app, addDispatch, addState);
  }
}

document
  .getElementById("nav-practice")
  ?.addEventListener("click", () => show("trial"));
document.getElementById("nav-add")?.addEventListener("click", () => {
  addState.rows = rows(addCtx);
  show("add");
});

show("trial");
