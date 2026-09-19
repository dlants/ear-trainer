import type {
  PlayButtonId,
  PlayController,
  PlayState,
  PlayStep,
} from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import type { KeyValueStore } from "../deck/store.ts";
import type { Phrase, TimedEvent } from "../music/melody.ts";
import type { Degree, Note } from "../music/note.ts";
import {
  IDENTIFY_NOTE_DEGREES,
  type IdentifyNotesCtx,
  type IdentifyNotesMsg,
  type IdentifyNotesState,
  initialIdentifyNotesState,
  updateIdentifyNotes,
} from "../views/tonic-practice.ts";
import { IdentifyNotesView } from "../views/tonic-practice-view.ts";

export class FakeIdentifyNotesPlay {
  calls: string[] = [];
  state: PlayState = { status: "idle" };
  drones: (number | undefined)[] = [];

  getState(): PlayState {
    return this.state;
  }

  autoplay(steps: PlayStep[]): void {
    this.calls.push(`autoplay:${steps.map((step) => step.buttonId).join(",")}`);
    const first = steps[0];
    this.state = first
      ? {
          status: "playing",
          buttonId: first.buttonId,
          durationMs: 1000,
          queueLength: Math.max(0, steps.length - 1),
        }
      : { status: "idle" };
  }

  toggle(buttonId: PlayButtonId, _step: PlayStep): void {
    this.calls.push(`toggle:${buttonId}`);
    this.state =
      this.state.status === "playing" && this.state.buttonId === buttonId
        ? { status: "idle" }
        : {
            status: "playing",
            buttonId,
            durationMs: 1000,
            queueLength: 0,
          };
  }

  setDrone(tonic: number | undefined): void {
    this.drones.push(tonic);
  }

  stop(): void {
    this.calls.push("stop");
    this.state = { status: "idle" };
  }
}

export const profile: Profile = {
  id: "test",
  name: "Test",
  color: "green",
  tonic: 60,
  lowNote: 53,
  highNote: 72,
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
    harmony: [],
    tempoBpm: 120,
    durationTicks: measureCount * 96,
    measures,
    voices: [{ id: "melody", events }],
  };
}

export function memoryStorage(): KeyValueStore {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

function ctx(
  play: FakeIdentifyNotesPlay,
  phrases: Phrase[],
  storage: KeyValueStore = memoryStorage(),
): IdentifyNotesCtx {
  return {
    play: play as unknown as PlayController,
    profile,
    melodies: phrases.map((candidate) => ({
      ...candidate,
      title: candidate.id,
      phrases: [candidate],
      source: { description: "Test", status: "original" as const },
    })),
    storage,
    random: () => 0,
  };
}

export function mountIdentifySelector(
  phrases: Phrase[] = [phrase(4)],
  storage: KeyValueStore = memoryStorage(),
): {
  container: HTMLElement;
  state: IdentifyNotesState;
  dispatch: (msg: IdentifyNotesMsg) => void;
  play: FakeIdentifyNotesPlay;
  view: IdentifyNotesView;
} {
  const play = new FakeIdentifyNotesPlay();
  const context = ctx(play, phrases, storage);
  const state = initialIdentifyNotesState(context);
  state.screen = "situations";
  state.trial = undefined;
  const container = document.createElement("div");
  container.style.width = "420px";
  document.body.appendChild(container);
  let view: IdentifyNotesView;
  const dispatch = (msg: IdentifyNotesMsg) => {
    updateIdentifyNotes(state, msg, context);
    view.sync(state);
  };
  view = new IdentifyNotesView(container, dispatch, state, context);
  return { container, state, dispatch, play, view };
}

export function mountIdentify(measureCount = 4): {
  container: HTMLElement;
  state: IdentifyNotesState;
  dispatch: (msg: IdentifyNotesMsg) => void;
  play: FakeIdentifyNotesPlay;
  view: IdentifyNotesView;
} {
  const play = new FakeIdentifyNotesPlay();
  const selected = phrase(measureCount);
  const state: IdentifyNotesState = {
    screen: "practice",
    selectedSituationIds: ["tonic"],
    tonic: 60,
    droneOn: false,
    trial: {
      phrase: selected,
      targetSituationId: "tonic",
      phase: "answering",
      promptDegrees: [...IDENTIFY_NOTE_DEGREES],
      answers: new Array(selected.voices[0].events.length).fill(undefined),
      cursorEventIndex: 0,
      firstVisibleMeasureIndex: 0,
    },
  };
  const context = ctx(play, [selected]);
  const container = document.createElement("div");
  container.style.width = "420px";
  document.body.appendChild(container);
  let view: IdentifyNotesView;
  const dispatch = (msg: IdentifyNotesMsg) => {
    updateIdentifyNotes(state, msg, context);
    view.sync(state);
  };
  view = new IdentifyNotesView(container, dispatch, state, context);
  return { container, state, dispatch, play, view };
}
