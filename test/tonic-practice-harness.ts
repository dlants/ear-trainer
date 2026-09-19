import type {
  PlayButtonId,
  PlayController,
  PlayState,
  PlayStep,
} from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import type { KeyValueStore } from "../deck/store.ts";
import type {
  CellId,
  CorpusEvent,
  IdentificationPhraseSuitability,
  Phrase,
  TimedEvent,
} from "../music/melody.ts";
import { cells, lanes, normalizeMelody, onsets } from "../music/melody.ts";
import type { Degree, Note } from "../music/note.ts";
import {
  type CellAnswer,
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

function corpusEvent(notes: Note[], durationTicks: number): CorpusEvent {
  return { notes, durationTicks };
}

/**
 * A block chord, then a tone sustained over an arpeggio, with an authored
 * chord track whose second half is a gap.
 */
export function harmonyPhrase(
  chordIdentification: IdentificationPhraseSuitability = "independent",
): Phrase {
  const result = normalizeMelody({
    id: "fixture-harmony",
    title: "Harmony fixture",
    context: "major-cadence",
    tempoBpm: 120,
    source: { description: "Test", status: "original" },
    measures: [
      {
        durationTicks: 96,
        beatDurationsTicks: [24, 24, 24, 24],
        voices: [
          {
            voiceId: "melody",
            events: [
              corpusEvent([note(5), note(3), note(1)], 48),
              corpusEvent([note(5)], 48),
            ],
          },
        ],
        harmony: [
          {
            durationTicks: 96,
            chord: { root: 1, alteration: 0, quality: "major" },
          },
        ],
      },
      {
        durationTicks: 96,
        beatDurationsTicks: [24, 24, 24, 24],
        voices: [
          {
            voiceId: "melody",
            events: [corpusEvent([note(5)], 96)],
          },
          {
            voiceId: "harmony",
            events: [
              corpusEvent([note(1, -1)], 24),
              corpusEvent([note(3, -1)], 24),
              corpusEvent([note(5, -1)], 24),
              corpusEvent([note(7, -1)], 24),
            ],
          },
        ],
        harmony: [
          {
            durationTicks: 48,
            chord: { root: 5, alteration: 0, quality: "major" },
          },
          { durationTicks: 48 },
        ],
        phraseEnd: {
          noteIdentification: "independent",
          chordIdentification,
          rationale: "Test phrase.",
        },
      },
    ],
  });
  if (!result.ok) throw new Error(result.error);
  const phrase = result.value.phrases[0];
  if (!phrase) throw new Error("tonic-practice-harness: no harmony phrase");
  return phrase;
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

export function cellIdAt(state: IdentifyNotesState, index: number): CellId {
  const cell = state.trial?.cells[index];
  if (!cell) throw new Error(`tonic-practice-harness: no cell ${index}`);
  return cell.id;
}

export function selectedCellIndex(
  state: IdentifyNotesState,
): number | undefined {
  const selection = state.trial?.selection;
  if (selection?.kind !== "cell") return undefined;
  const index = state.trial?.cells.findIndex(
    (cell) => cell.id === selection.cellId,
  );
  return index === undefined || index < 0 ? undefined : index;
}

export function answerAt(state: IdentifyNotesState, index: number): CellAnswer {
  return state.trial?.cellAnswers[cellIdAt(state, index)];
}

export function mountIdentifyPhrase(selected: Phrase): {
  container: HTMLElement;
  state: IdentifyNotesState;
  dispatch: (msg: IdentifyNotesMsg) => void;
  play: FakeIdentifyNotesPlay;
  view: IdentifyNotesView;
} {
  const play = new FakeIdentifyNotesPlay();
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
      cells: cells(selected),
      onsets: onsets(cells(selected)),
      lanes: lanes(selected),
      cellAnswers: {},
      chordAnswers: {},
      cursorOnsetIndex: 0,
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

export function mountIdentify(measureCount = 4): {
  container: HTMLElement;
  state: IdentifyNotesState;
  dispatch: (msg: IdentifyNotesMsg) => void;
  play: FakeIdentifyNotesPlay;
  view: IdentifyNotesView;
} {
  return mountIdentifyPhrase(phrase(measureCount));
}
