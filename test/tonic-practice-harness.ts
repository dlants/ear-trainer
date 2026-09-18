import type {
  PlayButtonId,
  PlayController,
  PlayState,
  PlayStep,
} from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import type { Phrase, TimedEvent } from "../music/melody.ts";
import type { Degree, Note } from "../music/note.ts";
import {
  type IdentifyTonicMsg,
  type IdentifyTonicState,
  type SingTonicMsg,
  type SingTonicState,
  type TonicPracticeCtx,
  updateIdentifyTonic,
  updateSingTonic,
} from "../views/tonic-practice.ts";
import {
  IdentifyTonicNotesView,
  SingTonicView,
} from "../views/tonic-practice-view.ts";

export class FakeTonicPlay {
  calls: string[] = [];
  state: PlayState = { status: "idle" };
  drones: (number | undefined)[] = [];

  getState(): PlayState {
    return this.state;
  }

  autoplay(steps: PlayStep[]): void {
    this.calls.push(`autoplay:${steps.map((step) => step.buttonId).join(",")}`);
  }

  toggle(buttonId: PlayButtonId, _step: PlayStep): void {
    this.calls.push(`toggle:${buttonId}`);
  }

  setDrone(tonic: number | undefined): void {
    this.drones.push(tonic);
  }

  stop(): void {
    this.calls.push("stop");
  }
}

export const profile: Profile = {
  id: "test",
  name: "Test",
  color: "green",
  tonic: 60,
  cadenceSpeed: "medium",
  drone: true,
};

function note(degree: Degree, octave = 0): Note {
  return { degree, alteration: 0, octave };
}

export function phrase(
  measureCount: number,
  id = `fixture-${measureCount}`,
): Phrase {
  const measures = Array.from({ length: measureCount }, (_, index) => ({
    startTicks: index * 96,
    endTicks: (index + 1) * 96,
    beatDurationsTicks: [24, 24, 24, 24],
  }));
  const events: TimedEvent[] = [];
  for (let index = 0; index < measureCount; index += 1) {
    const start = index * 96;
    events.push({
      notes: [note(index % 2 === 0 ? 1 : 5, (index % 3) - 1)],
      onsetTicks: start,
      durationTicks: 24,
    });
    events.push({
      notes: [note(index % 2 === 0 ? 3 : 1)],
      onsetTicks: start + 48,
      durationTicks: 48,
    });
  }
  return {
    id,
    melodyId: id,
    phraseIndex: 0,
    noteIdentification: "independent",
    rationale: "Test phrase.",
    context: "major-cadence",
    tempoBpm: 120,
    durationTicks: measureCount * 96,
    measures,
    voices: [{ id: "melody", events }],
  };
}

function ctx(play: FakeTonicPlay, phrases: Phrase[]): TonicPracticeCtx {
  return {
    play: play as unknown as PlayController,
    profile,
    melodies: phrases.map((candidate) => ({
      ...candidate,
      title: candidate.id,
      phrases: [candidate],
      source: { description: "Test", status: "original" as const },
    })),
    random: () => 0,
  };
}

export function mountIdentify(
  measureCount = 4,
  promptDegrees: Degree[] = [1],
): {
  container: HTMLElement;
  state: IdentifyTonicState;
  dispatch: (msg: IdentifyTonicMsg) => void;
  play: FakeTonicPlay;
  view: IdentifyTonicNotesView;
} {
  const play = new FakeTonicPlay();
  const selected = phrase(measureCount);
  const state: IdentifyTonicState = {
    activity: "identify-tonic-notes",
    droneOn: false,
    trial: {
      phrase: selected,
      phase: "answering",
      promptDegrees,
      answers: new Array(selected.voices[0].events.length).fill(undefined),
      firstVisibleMeasureIndex: 0,
    },
  };
  const context = ctx(play, [selected]);
  const container = document.createElement("div");
  container.style.width = "420px";
  document.body.appendChild(container);
  let view: IdentifyTonicNotesView;
  const dispatch = (msg: IdentifyTonicMsg) => {
    updateIdentifyTonic(state, msg, context);
    view.sync(state);
  };
  view = new IdentifyTonicNotesView(container, dispatch, state, context);
  return { container, state, dispatch, play, view };
}

export function mountSing(): {
  container: HTMLElement;
  state: SingTonicState;
  dispatch: (msg: SingTonicMsg) => void;
  play: FakeTonicPlay;
  view: SingTonicView;
} {
  const play = new FakeTonicPlay();
  const selected = phrase(2, "sing");
  const state: SingTonicState = {
    activity: "sing-tonic",
    droneOn: false,
    trial: { phrase: selected, phase: "presenting" },
  };
  const context = ctx(play, [selected]);
  const container = document.createElement("div");
  document.body.appendChild(container);
  let view: SingTonicView;
  const dispatch = (msg: SingTonicMsg) => {
    updateSingTonic(state, msg, context);
    view.sync(state);
  };
  view = new SingTonicView(container, dispatch, state, context);
  return { container, state, dispatch, play, view };
}
