import type { AudioEngine } from "../audio/engine.ts";
import type { PlayController, PlayMsg } from "../audio/play-controller.ts";
import type { Route, RouterController, RouterMsg } from "../router.ts";
import { Binder, noop, ref, sanitize, show, type View } from "../vamp.ts";
import { ActivityCatalogView } from "./activity-catalog.ts";
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
  type Msg as StartMsg,
  type State as StartState,
  StartView,
  initialState as startInitialState,
  update as startUpdate,
} from "./start.ts";
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
  start: StartState;
  audioUnlocked: boolean;
};

export type Msg =
  | RouterMsg
  | { type: "PLAY_MSG"; msg: PlayMsg }
  | { type: "IDENTIFY_NOTES_MSG"; msg: IdentifyNotesMsg }
  | { type: "OPTIONS_MSG"; msg: OptionsMsg }
  | { type: "START_MSG"; msg: StartMsg };

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
    identifyNotes: initialIdentifyNotesState(),
    options: optionsInitialState(ctx.options),
    start: startInitialState(),
    audioUnlocked: ctx.audio.unlocked,
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

function resetActivity(state: State): void {
  if (state.route.page === "activity" && state.audioUnlocked) {
    state.identifyNotes = initialIdentifyNotesState();
  }
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
        stopActivityAudio(state, ctx);
        if (previousRoute.page === "options") ctx.options.mic.stop();
      }
      state.route = route;
      if (routeChanged) {
        if (route.page === "activity") resetActivity(state);
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
      updateIdentifyNotes(state.identifyNotes, msg.msg, ctx.identifyNotes);
      break;
    case "OPTIONS_MSG":
      optionsUpdate(state.options, msg.msg, ctx.options);
      break;
    case "START_MSG":
      startUpdate(state.start, msg.msg, { audio: ctx.audio }, (startMsg) =>
        dispatch({ type: "START_MSG", msg: startMsg }),
      );
      if (msg.msg.type === "UNLOCKED") {
        state.audioUnlocked = true;
        resetActivity(state);
      }
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
          return show(ActivityCatalogView, {}, {}, noop);
        case "activity":
          if (!state.audioUnlocked) {
            return show(StartView, state.start, { audio: ctx.audio }, (msg) =>
              dispatch({ type: "START_MSG", msg }),
            );
          }
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
