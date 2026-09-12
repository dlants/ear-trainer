import type {
  PlayController,
  PlayMsg,
  PlayStep,
} from "../audio/play-controller.ts";
import type { Route, RouterController, RouterMsg } from "../router.ts";
import { Binder, noop, ref, sanitize, show, type View } from "../vamp.ts";
import {
  type Msg as AddMsg,
  type AddPatternsCtx,
  AddPatternsView,
  type State as AddState,
  initialState as addInitialState,
  rows as addRows,
  update as addUpdate,
} from "./add-patterns.ts";
import type { DismissStack } from "./dropdown.ts";
import { NavView } from "./nav.ts";
import {
  type SongsCtx,
  type Msg as SongsMsg,
  type State as SongsState,
  SongsView,
  rows as songRows,
  initialState as songsInitialState,
  update as songsUpdate,
} from "./songs.ts";
import {
  type TrialCtx,
  type Msg as TrialMsg,
  type State as TrialState,
  TrialView,
  initialState as trialInitialState,
  update as trialUpdate,
} from "./trial.ts";

export type State = {
  route: Route;
  trial: TrialState;
  cards: AddState;
  songs: SongsState;
};

export type Msg =
  | RouterMsg
  | { type: "PLAY_MSG"; msg: PlayMsg }
  | { type: "TRIAL_MSG"; msg: TrialMsg }
  | { type: "CARDS_MSG"; msg: AddMsg }
  | { type: "SONGS_MSG"; msg: SongsMsg };

export type AppCtx = {
  play: PlayController;
  router: RouterController;
  dismissStack: DismissStack;
  trial: TrialCtx;
  cards: AddPatternsCtx;
  songs: SongsCtx;
};

export function initialState(route: Route, ctx: AppCtx): State {
  return {
    route,
    trial: trialInitialState(ctx.trial),
    cards: addInitialState(ctx.cards),
    songs: songsInitialState(ctx.songs),
  };
}

function autoplaySelectedTrial(state: TrialState, play: PlayController): void {
  const trial = state.trial;
  if (!trial) {
    play.stop();
    return;
  }

  const steps: PlayStep[] = [
    {
      buttonId: "trial:context",
      type: "context",
      context: trial.pattern.context,
      tonic: trial.tonic,
    },
  ];
  if (trial.card.mode === "transcription") {
    steps.push({
      buttonId: "trial:pattern",
      type: "pattern",
      pattern: trial.pattern,
      tonic: trial.tonic,
    });
  }
  play.autoplay(steps);
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
      const routeChanged = previousRoute.page !== route.page;
      if (
        routeChanged &&
        (previousRoute.page === "practice" || previousRoute.page === "options")
      ) {
        ctx.play.stop();
      }
      state.route = route;
      if (route.page === "practice" && routeChanged) {
        trialUpdate(state.trial, { type: "NEXT_TRIAL" }, ctx.trial, (child) =>
          dispatch({ type: "TRIAL_MSG", msg: child }),
        );
        autoplaySelectedTrial(state.trial, ctx.play);
      } else if (route.page === "cards") {
        state.cards.rows = addRows(ctx.cards);
      } else if (route.page === "songs") {
        const selected = state.songs.songs.find((song) => song.selected)?.id;
        state.songs.songs = songRows(ctx.songs, selected);
      }
      break;
    }
    case "PLAY_MSG":
      ctx.play.update(msg.msg);
      break;
    case "TRIAL_MSG":
      trialUpdate(state.trial, msg.msg, ctx.trial, (child) =>
        dispatch({ type: "TRIAL_MSG", msg: child }),
      );
      break;
    case "CARDS_MSG":
      addUpdate(state.cards, msg.msg, ctx.cards);
      break;
    case "SONGS_MSG":
      songsUpdate(state.songs, msg.msg, ctx.songs);
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
        { route: state.route },
        { dismissStack: ctx.dismissStack },
        noop,
      ),
    );
    this.b.bindSlot(pageRef, (state) => {
      switch (state.route.page) {
        case "practice":
          return show(TrialView, state.trial, {}, (msg) =>
            dispatch({ type: "TRIAL_MSG", msg }),
          );
        case "cards":
          return show(AddPatternsView, state.cards, {}, (msg) =>
            dispatch({ type: "CARDS_MSG", msg }),
          );
        case "songs":
          return show(SongsView, state.songs, {}, (msg) =>
            dispatch({ type: "SONGS_MSG", msg }),
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
