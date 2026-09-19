import type { AudioEngine } from "../audio/engine.ts";
import type { PlayController, PlayMsg } from "../audio/play-controller.ts";
import type { Route, RouterController, RouterMsg } from "../router.ts";
import { Binder, noop, ref, sanitize, show, type View } from "../vamp.ts";
import {
  type ActivityCatalogMsg,
  ActivityCatalogView,
} from "./activity-catalog.ts";
import type { DismissStack } from "./dropdown.ts";
import { NavView } from "./nav.ts";
import {
  type OptionsCtx,
  type Msg as OptionsMsg,
  type State as OptionsState,
  OptionsView,
  initialState as optionsInitialState,
  update as optionsUpdate,
} from "./options.ts";
import {
  type IdentifyNotesCtx,
  type IdentifyNotesMsg,
  type IdentifyNotesState,
  initialIdentifyNotesState,
  updateIdentifyNotes,
} from "./tonic-practice.ts";
import { IdentifyNotesView } from "./tonic-practice-view.ts";

export type State = {
  route: Route;
  identifyNotes: IdentifyNotesState;
  options: OptionsState;
  audioUnlocked: boolean;
  audioUnlocking: boolean;
  pendingIdentifyMsg: IdentifyNotesMsg | undefined;
  pendingOptionsMsg: OptionsMsg | undefined;
};

export type Msg =
  | RouterMsg
  | { type: "PLAY_MSG"; msg: PlayMsg }
  | { type: "IDENTIFY_NOTES_MSG"; msg: IdentifyNotesMsg }
  | { type: "OPTIONS_MSG"; msg: OptionsMsg }
  | { type: "CATALOG_MSG"; msg: ActivityCatalogMsg }
  | { type: "AUDIO_UNLOCKED" }
  | { type: "AUDIO_UNLOCK_ERROR" };

export type AppCtx = {
  audio: AudioEngine;
  play: PlayController;
  router: RouterController;
  dismissStack: DismissStack;
  identifyNotes: IdentifyNotesCtx;
  options: OptionsCtx;
};

export function initialState(route: Route, ctx: AppCtx): State {
  return {
    route,
    identifyNotes: initialIdentifyNotesState(ctx.identifyNotes),
    options: optionsInitialState(ctx.options),
    audioUnlocked: ctx.audio.unlocked,
    audioUnlocking: false,
    pendingIdentifyMsg: undefined,
    pendingOptionsMsg: undefined,
  };
}

function sameRoute(left: Route, right: Route): boolean {
  return (
    left.page === right.page &&
    (left.page !== "activity" ||
      (right.page === "activity" && left.activity === right.activity))
  );
}

function stopActivityAudio(state: State, ctx: AppCtx): void {
  ctx.play.stop();
  ctx.play.setDrone(undefined);
  state.identifyNotes.droneOn = false;
}

function resetActivity(state: State, ctx: AppCtx): void {
  if (state.route.page === "activity") {
    state.identifyNotes = initialIdentifyNotesState(ctx.identifyNotes);
  }
}

function identifyNotesMsgNeedsAudio(msg: IdentifyNotesMsg): boolean {
  return [
    "BEGIN",
    "PLAY_CONTEXT",
    "CHANGE_KEY",
    "TOGGLE_DRONE",
    "PLAY_PAUSE",
    "PLAY_FROM_BEGINNING",
    "PLAY_ONSET",
    "PLAY_CELL",
    "NEXT",
  ].includes(msg.type);
}

function optionsMsgNeedsAudio(msg: OptionsMsg): boolean {
  return ["PREVIEW", "SET_CADENCE_SPEED", "USE_HEARD_NOTE"].includes(msg.type);
}

function requestAudioUnlock(
  state: State,
  ctx: AppCtx,
  dispatch: (msg: Msg) => void,
): void {
  if (state.audioUnlocked || state.audioUnlocking) return;
  state.audioUnlocking = true;
  ctx.audio.unlock().then(
    () => dispatch({ type: "AUDIO_UNLOCKED" }),
    () => dispatch({ type: "AUDIO_UNLOCK_ERROR" }),
  );
}

export function update(
  state: State,
  msg: Msg,
  ctx: AppCtx,
  dispatch: (msg: Msg) => void,
): void {
  switch (msg.type) {
    case "NAVIGATE": {
      const previousRoute = state.route;
      const route = ctx.router.update(msg);
      const routeChanged = !sameRoute(previousRoute, route);
      if (routeChanged) {
        state.pendingIdentifyMsg = undefined;
        state.pendingOptionsMsg = undefined;
        stopActivityAudio(state, ctx);
        if (previousRoute.page === "options") ctx.options.mic.stop();
      }
      state.route = route;
      if (routeChanged) {
        if (route.page === "activity") resetActivity(state, ctx);
        else if (route.page === "options") {
          state.options = optionsInitialState(ctx.options);
        }
      }
      break;
    }
    case "PLAY_MSG":
      ctx.play.update(msg.msg);
      if (
        state.route.page === "activity" &&
        state.route.activity === "identify-notes"
      ) {
        updateIdentifyNotes(
          state.identifyNotes,
          { type: "SYNC_PLAYBACK" },
          ctx.identifyNotes,
        );
      }
      break;
    case "IDENTIFY_NOTES_MSG":
      if (identifyNotesMsgNeedsAudio(msg.msg) && !state.audioUnlocked) {
        state.pendingIdentifyMsg = msg.msg;
        requestAudioUnlock(state, ctx, dispatch);
        break;
      }
      updateIdentifyNotes(state.identifyNotes, msg.msg, ctx.identifyNotes);
      break;
    case "OPTIONS_MSG":
      if (optionsMsgNeedsAudio(msg.msg) && !state.audioUnlocked) {
        state.pendingOptionsMsg = msg.msg;
        requestAudioUnlock(state, ctx, dispatch);
        break;
      }
      optionsUpdate(state.options, msg.msg, ctx.options);
      break;
    case "CATALOG_MSG":
      requestAudioUnlock(state, ctx, dispatch);
      break;
    case "AUDIO_UNLOCKED":
      state.audioUnlocked = true;
      state.audioUnlocking = false;
      if (
        state.pendingIdentifyMsg &&
        state.route.page === "activity" &&
        state.route.activity === "identify-notes"
      ) {
        const pending = state.pendingIdentifyMsg;
        state.pendingIdentifyMsg = undefined;
        updateIdentifyNotes(state.identifyNotes, pending, ctx.identifyNotes);
      }
      if (state.pendingOptionsMsg && state.route.page === "options") {
        const pending = state.pendingOptionsMsg;
        state.pendingOptionsMsg = undefined;
        optionsUpdate(state.options, pending, ctx.options);
      }
      break;
    case "AUDIO_UNLOCK_ERROR":
      state.audioUnlocking = false;
      state.pendingIdentifyMsg = undefined;
      state.pendingOptionsMsg = undefined;
      break;
  }
}

export class AppView implements View<State, Msg, AppCtx> {
  container: HTMLElement;
  private readonly b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
    ctx: AppCtx,
  ) {
    const navRef = ref("nav");
    const pageRef = ref("page");

    this.container = container;
    container.innerHTML = sanitize`
      <div data-ref="${navRef}"></div>
      <main data-ref="${pageRef}"></main>
    `;
    this.b = new Binder(container, initial);

    this.b.bindSlot(navRef, (state) =>
      show(
        NavView,
        { page: state.route.page },
        { dismissStack: ctx.dismissStack },
        noop,
      ),
    );
    this.b.bindSlot(pageRef, (state) => {
      switch (state.route.page) {
        case "catalog":
          return show(ActivityCatalogView, {}, {}, (msg) =>
            dispatch({ type: "CATALOG_MSG", msg }),
          );
        case "activity":
          return show(
            IdentifyNotesView,
            state.identifyNotes,
            ctx.identifyNotes,
            (msg) => dispatch({ type: "IDENTIFY_NOTES_MSG", msg }),
          );
        case "options":
          return show(OptionsView, state.options, ctx.options, (msg) =>
            dispatch({ type: "OPTIONS_MSG", msg }),
          );
      }
    });
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
