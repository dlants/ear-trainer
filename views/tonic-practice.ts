import type { PlayController, PlayStep } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import type { KeyValueStore } from "../deck/store.ts";
import {
  type Cell,
  type CellId,
  cells,
  cellsById,
  cellsSoundingAt,
  type Lane,
  lanes,
  type Melody,
  type Onset,
  onsets,
  type Phrase,
  type RegionId,
} from "../music/melody.ts";
import type { Degree } from "../music/note.ts";
import { type Midi, noteToMidi } from "../music/pitch.ts";
import {
  phraseMatchesSituation,
  SITUATIONS,
  type SituationId,
} from "../music/situations.ts";

export type Activity = "identify-notes";

export type IdentifyNotesScreen = "situations" | "practice";
export type IdentifyNotesPhase = "answering" | "revealed";
export type CellAnswer = Degree | "other" | "skip" | undefined;
/** Diatonic triad of the context, by root degree. */
export type ChordAnswer = Degree | "other" | "skip" | undefined;
export type Selection =
  | { kind: "cell"; cellId: CellId }
  | { kind: "chord"; regionId: RegionId };

export const VISIBLE_MEASURE_COUNT = 3;
export const KEY_PADDING_BELOW = 7;
export const KEY_PADDING_ABOVE = 12;
export const MIN_KEY_SPAN = 7;
export const IDENTIFY_NOTE_DEGREES = [
  1, 2, 3, 4, 5, 6, 7,
] as const satisfies readonly Degree[];

const DEFAULT_SITUATION_IDS: SituationId[] = ["tonic"];

export function situationSelectionKey(profileId: string): string {
  return `profile:${profileId}:identify-notes:situations`;
}

export type IdentifyNotesTrial = {
  phrase: Phrase;
  /** Cached: the view derives grid geometry from these on every sync. */
  cells: Cell[];
  onsets: Onset[];
  lanes: Lane[];
  targetSituationId: SituationId;
  phase: IdentifyNotesPhase;
  promptDegrees: Degree[];
  cellAnswers: Record<CellId, CellAnswer>;
  chordAnswers: Record<RegionId, ChordAnswer>;
  selection?: Selection;
  cursorOnsetIndex: number;
  firstVisibleMeasureIndex: number;
};

export type IdentifyNotesState = {
  screen: IdentifyNotesScreen;
  selectedSituationIds: SituationId[];
  trial: IdentifyNotesTrial | undefined;
  tonic: Midi;
  droneOn: boolean;
};

export type IdentifyNotesCtx = {
  play: PlayController;
  profile: Profile;
  melodies: Melody[];
  storage: KeyValueStore;
  random(): number;
};

export type IdentifyNotesMsg =
  | { type: "TOGGLE_SITUATION"; situationId: SituationId }
  | { type: "BEGIN" }
  | { type: "CHANGE_SITUATIONS" }
  | { type: "PLAY_CONTEXT" }
  | { type: "CHANGE_KEY" }
  | { type: "TOGGLE_DRONE" }
  | { type: "PLAY_PAUSE" }
  | { type: "PLAY_FROM_BEGINNING" }
  | { type: "PLAY_ONSET"; onsetIndex: number }
  | { type: "PLAY_CELL"; cellId: CellId }
  | { type: "SELECT_CELL"; cellId: CellId }
  | { type: "SELECT_REGION"; regionId: RegionId }
  | { type: "PLAY_REGION"; regionId: RegionId }
  | { type: "SET_ANSWER"; answer: CellAnswer }
  | { type: "SET_CHORD_ANSWER"; answer: ChordAnswer }
  | { type: "REVEAL" }
  | { type: "SCROLL"; delta: -1 | 1 }
  | { type: "SYNC_PLAYBACK" }
  | { type: "NEXT" };

function randomIndex(length: number, random: () => number): number {
  const value = random();
  if (!Number.isFinite(value)) return 0;
  return Math.min(length - 1, Math.max(0, Math.floor(value * length)));
}

export function identifyNotesTonics(profile: Profile): Midi[] {
  const padded = {
    minimum: profile.lowNote + KEY_PADDING_BELOW,
    maximum: profile.highNote - KEY_PADDING_ABOVE,
  };
  const center = Math.round((padded.minimum + padded.maximum) / 2);
  const minimum = Math.min(
    padded.minimum,
    center - Math.floor(MIN_KEY_SPAN / 2),
  );
  const maximum = Math.max(padded.maximum, minimum + MIN_KEY_SPAN);
  return Array.from(
    { length: Math.max(0, maximum - minimum + 1) },
    (_, index) => minimum + index,
  );
}

function chooseTonic(
  profile: Profile,
  previous: Midi | undefined,
  random: () => number,
): Midi {
  const candidates = identifyNotesTonics(profile);
  if (candidates.length === 0) return profile.tonic;
  const alternatives =
    previous === undefined || candidates.length === 1
      ? candidates
      : candidates.filter((candidate) => candidate !== previous);
  const fallback = candidates[0];
  if (fallback === undefined) return profile.tonic;
  return alternatives[randomIndex(alternatives.length, random)] ?? fallback;
}

function eligiblePhrases(melody: Melody): Phrase[] {
  return melody.phrases.filter(
    (phrase) =>
      phrase.noteIdentification === "independent" &&
      phrase.measures.length >= 2,
  );
}

export type PhraseSelection = {
  phrase: Phrase;
  targetSituationId: SituationId;
};

export function selectIdentifyNotesPhrase(
  melodies: Melody[],
  selectedSituationIds: readonly SituationId[],
  previous: Phrase | undefined,
  random: () => number,
): PhraseSelection | undefined {
  const situationCandidates = selectedSituationIds.flatMap((situationId) => {
    const candidates = melodies
      .map((melody) => ({
        melody,
        phrases: eligiblePhrases(melody).filter((phrase) =>
          phraseMatchesSituation(phrase, situationId),
        ),
      }))
      .filter(({ phrases }) => phrases.length > 0);
    return candidates.length > 0 ? [{ situationId, candidates }] : [];
  });
  if (situationCandidates.length === 0) return undefined;
  const selectedSituation =
    situationCandidates[randomIndex(situationCandidates.length, random)];
  if (!selectedSituation) return undefined;

  const otherMelodies = previous
    ? selectedSituation.candidates.filter(
        ({ melody }) => melody.id !== previous.melodyId,
      )
    : [];
  const melodyPool =
    otherMelodies.length > 0 ? otherMelodies : selectedSituation.candidates;
  const selectedMelody = melodyPool[randomIndex(melodyPool.length, random)];
  if (!selectedMelody) return undefined;

  const otherPhrases = previous
    ? selectedMelody.phrases.filter((phrase) => phrase.id !== previous.id)
    : selectedMelody.phrases;
  const phrasePool =
    otherPhrases.length > 0 ? otherPhrases : selectedMelody.phrases;
  const phrase = phrasePool[randomIndex(phrasePool.length, random)];
  return phrase
    ? { phrase, targetSituationId: selectedSituation.situationId }
    : undefined;
}

function storedSituationIds(ctx: IdentifyNotesCtx): SituationId[] {
  const stored = ctx.storage.getItem(situationSelectionKey(ctx.profile.id));
  if (stored === null) return [...DEFAULT_SITUATION_IDS];
  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) return [...DEFAULT_SITUATION_IDS];
  const knownIds = new Set<SituationId>(
    SITUATIONS.map((situation) => situation.id),
  );
  const selected = parsed.filter(
    (id): id is SituationId =>
      typeof id === "string" && knownIds.has(id as SituationId),
  );
  return selected.length > 0 ? selected : [...DEFAULT_SITUATION_IDS];
}

function persistSituationIds(
  state: IdentifyNotesState,
  ctx: IdentifyNotesCtx,
): void {
  ctx.storage.setItem(
    situationSelectionKey(ctx.profile.id),
    JSON.stringify(state.selectedSituationIds),
  );
}

export function initialIdentifyNotesState(
  ctx: IdentifyNotesCtx,
): IdentifyNotesState {
  const selectedSituationIds = storedSituationIds(ctx);
  const selection = selectIdentifyNotesPhrase(
    ctx.melodies,
    selectedSituationIds,
    undefined,
    ctx.random,
  );
  return {
    screen: "practice",
    selectedSituationIds,
    trial: selection ? identifyTrial(selection) : undefined,
    tonic: chooseTonic(ctx.profile, undefined, ctx.random),
    droneOn: false,
  };
}

function melodyStep(
  phrase: Phrase,
  tonic: Midi,
): Extract<PlayStep, { type: "score" }> {
  return {
    buttonId: "tonic:melody",
    type: "score",
    score: phrase,
    tonic,
  };
}

function playMelody(phrase: Phrase, tonic: Midi, ctx: IdentifyNotesCtx): void {
  ctx.play.autoplay([melodyStep(phrase, tonic)]);
}

function playNotes(
  cellIds: readonly CellId[],
  trial: IdentifyNotesTrial,
  tonic: Midi,
  ctx: IdentifyNotesCtx,
): void {
  const byId = cellsById(trial.cells);
  const notes = cellIds.flatMap((cellId) => {
    const cell = byId.get(cellId);
    return cell ? [noteToMidi(cell.note, tonic)] : [];
  });
  if (notes.length === 0) return;
  ctx.play.autoplay([{ buttonId: "tonic:melody-note", type: "notes", notes }]);
}

function playContext(phrase: Phrase, tonic: Midi, ctx: IdentifyNotesCtx): void {
  ctx.play.toggle("trial:context", {
    buttonId: "trial:context",
    type: "context",
    context: phrase.context,
    tonic,
    speed: ctx.profile.cadenceSpeed,
  });
}

function toggleDrone(state: IdentifyNotesState, ctx: IdentifyNotesCtx): void {
  state.droneOn = !state.droneOn;
  ctx.play.setDrone(state.droneOn ? state.tonic : undefined);
}

function identifyTrial(selection: PhraseSelection): IdentifyNotesTrial {
  const cellList = cells(selection.phrase);
  return {
    phrase: selection.phrase,
    cells: cellList,
    onsets: onsets(cellList),
    lanes: lanes(selection.phrase),
    targetSituationId: selection.targetSituationId,
    phase: "answering",
    promptDegrees: [...IDENTIFY_NOTE_DEGREES],
    cellAnswers: {},
    chordAnswers: {},
    cursorOnsetIndex: 0,
    firstVisibleMeasureIndex: 0,
  };
}

/** Harmony is answerable only where the author marked it independent. */
export function chordAnswerable(phrase: Phrase): boolean {
  return (
    phrase.harmony.length > 0 && phrase.chordIdentification === "independent"
  );
}

function selectedCellIndex(trial: IdentifyNotesTrial): number | undefined {
  if (trial.selection?.kind !== "cell") return undefined;
  const cellId = trial.selection.cellId;
  const index = trial.cells.findIndex((cell) => cell.id === cellId);
  return index < 0 ? undefined : index;
}

function answerable(
  trial: IdentifyNotesTrial,
  answer: CellAnswer | ChordAnswer,
): boolean {
  return (
    answer === undefined ||
    answer === "other" ||
    answer === "skip" ||
    trial.promptDegrees.includes(answer)
  );
}

/** Answers live only where the learner acted, so `undefined` clears the key. */
function setAnswer<Key extends string>(
  answers: Record<Key, CellAnswer>,
  key: Key,
  answer: CellAnswer,
): void {
  if (answer === undefined) delete answers[key];
  else answers[key] = answer;
}

function onsetIndexAt(trial: IdentifyNotesTrial, ticks: number): number {
  const index = trial.onsets.findIndex((onset) => onset.onsetTicks === ticks);
  return index < 0 ? trial.cursorOnsetIndex : index;
}

function selectIdentifyTrial(
  state: IdentifyNotesState,
  ctx: IdentifyNotesCtx,
): boolean {
  const selection = selectIdentifyNotesPhrase(
    ctx.melodies,
    state.selectedSituationIds,
    state.trial?.phrase,
    ctx.random,
  );
  if (!selection) {
    state.trial = undefined;
    ctx.play.stop();
    return false;
  }
  state.trial = identifyTrial(selection);
  playMelody(selection.phrase, state.tonic, ctx);
  return true;
}

function maxFirstVisibleMeasure(trial: IdentifyNotesTrial): number {
  return Math.max(0, trial.phrase.measures.length - VISIBLE_MEASURE_COUNT);
}

export function updateIdentifyNotes(
  state: IdentifyNotesState,
  msg: IdentifyNotesMsg,
  ctx: IdentifyNotesCtx,
): void {
  switch (msg.type) {
    case "TOGGLE_SITUATION": {
      const index = state.selectedSituationIds.indexOf(msg.situationId);
      if (index >= 0) {
        if (state.selectedSituationIds.length === 1) break;
        state.selectedSituationIds.splice(index, 1);
      } else state.selectedSituationIds.push(msg.situationId);
      persistSituationIds(state, ctx);
      break;
    }
    case "BEGIN":
      state.screen = "practice";
      selectIdentifyTrial(state, ctx);
      break;
    case "CHANGE_SITUATIONS":
      ctx.play.stop();
      ctx.play.setDrone(undefined);
      state.screen = "situations";
      state.trial = undefined;
      state.droneOn = false;
      break;
    case "NEXT":
      selectIdentifyTrial(state, ctx);
      break;
    case "PLAY_CONTEXT":
      if (state.trial) playContext(state.trial.phrase, state.tonic, ctx);
      break;
    case "CHANGE_KEY":
      ctx.play.stop();
      state.tonic = chooseTonic(ctx.profile, state.tonic, ctx.random);
      if (state.droneOn) ctx.play.setDrone(state.tonic);
      if (state.trial) playContext(state.trial.phrase, state.tonic, ctx);
      break;
    case "TOGGLE_DRONE":
      if (state.screen === "practice" && state.trial) toggleDrone(state, ctx);
      break;
    case "PLAY_PAUSE": {
      const trial = state.trial;
      if (!trial) break;
      const playback = ctx.play.getState();
      if (
        playback.status === "playing" &&
        playback.buttonId.startsWith("tonic:melody")
      ) {
        ctx.play.stop();
        break;
      }
      const onset = trial.onsets[trial.cursorOnsetIndex];
      if (!onset) break;
      trial.selection = undefined;
      ctx.play.autoplay([
        {
          ...melodyStep(trial.phrase, state.tonic),
          range: {
            startTicks: onset.onsetTicks,
            endTicks: trial.phrase.durationTicks,
          },
        },
      ]);
      break;
    }
    case "PLAY_FROM_BEGINNING":
      if (state.trial) {
        state.trial.cursorOnsetIndex = 0;
        state.trial.firstVisibleMeasureIndex = 0;
        state.trial.selection = undefined;
        ctx.play.autoplay([
          {
            ...melodyStep(state.trial.phrase, state.tonic),
            buttonId: "tonic:melody-restart",
          },
        ]);
      }
      break;
    case "PLAY_ONSET": {
      const trial = state.trial;
      const onset = trial?.onsets[msg.onsetIndex];
      if (!trial || !onset) break;
      trial.cursorOnsetIndex = msg.onsetIndex;
      playNotes(
        cellsSoundingAt(trial.cells, onset.onsetTicks),
        trial,
        state.tonic,
        ctx,
      );
      break;
    }
    case "PLAY_CELL": {
      const trial = state.trial;
      const cell = trial?.cells.find(
        (candidate) => candidate.id === msg.cellId,
      );
      if (!trial || !cell) break;
      trial.cursorOnsetIndex = onsetIndexAt(trial, cell.onsetTicks);
      playNotes([cell.id], trial, state.tonic, ctx);
      break;
    }
    case "SELECT_CELL": {
      const trial = state.trial;
      if (
        trial?.phase === "answering" &&
        trial.cells.some((cell) => cell.id === msg.cellId)
      ) {
        trial.selection = { kind: "cell", cellId: msg.cellId };
      }
      break;
    }
    case "PLAY_REGION": {
      const trial = state.trial;
      const region = trial?.phrase.harmony.find(
        (candidate) => candidate.id === msg.regionId,
      );
      if (!trial || !region) break;
      trial.cursorOnsetIndex = onsetIndexAt(trial, region.startTicks);
      ctx.play.autoplay([
        {
          ...melodyStep(trial.phrase, state.tonic),
          range: {
            startTicks: region.startTicks,
            endTicks: region.endTicks,
          },
        },
      ]);
      break;
    }
    case "SELECT_REGION": {
      const trial = state.trial;
      if (
        trial?.phase === "answering" &&
        chordAnswerable(trial.phrase) &&
        trial.phrase.harmony.some((region) => region.id === msg.regionId)
      ) {
        trial.selection = { kind: "chord", regionId: msg.regionId };
      }
      break;
    }
    case "SET_ANSWER": {
      const trial = state.trial;
      if (trial?.phase !== "answering") break;
      const index = selectedCellIndex(trial);
      const cell = index === undefined ? undefined : trial.cells[index];
      if (index === undefined || !cell || !answerable(trial, msg.answer)) break;
      setAnswer(trial.cellAnswers, cell.id, msg.answer);
      const next = trial.cells[index + 1];
      trial.selection = next ? { kind: "cell", cellId: next.id } : undefined;
      break;
    }
    case "SET_CHORD_ANSWER": {
      const trial = state.trial;
      if (trial?.phase !== "answering") break;
      const selection = trial.selection;
      if (selection?.kind !== "chord" || !answerable(trial, msg.answer)) break;
      setAnswer(trial.chordAnswers, selection.regionId, msg.answer);
      break;
    }
    case "REVEAL":
      if (state.trial?.phase === "answering") {
        state.trial.phase = "revealed";
        state.trial.selection = undefined;
      }
      break;
    case "SCROLL": {
      const trial = state.trial;
      if (!trial) break;
      trial.firstVisibleMeasureIndex = Math.min(
        maxFirstVisibleMeasure(trial),
        Math.max(0, trial.firstVisibleMeasureIndex + msg.delta),
      );
      break;
    }
    case "SYNC_PLAYBACK": {
      const trial = state.trial;
      const playback = ctx.play.getState();
      if (
        !trial ||
        playback.status !== "playing" ||
        !playback.buttonId.startsWith("tonic:melody") ||
        playback.onsetIndex === undefined
      ) {
        break;
      }
      const onset = trial.onsets[playback.onsetIndex];
      if (!onset) break;
      trial.cursorOnsetIndex = playback.onsetIndex;
      const measureIndex = trial.phrase.measures.findIndex(
        (measure) =>
          onset.onsetTicks >= measure.startTicks &&
          onset.onsetTicks < measure.endTicks,
      );
      if (measureIndex < trial.firstVisibleMeasureIndex) {
        trial.firstVisibleMeasureIndex = measureIndex;
      } else if (
        measureIndex >=
        trial.firstVisibleMeasureIndex + VISIBLE_MEASURE_COUNT
      ) {
        trial.firstVisibleMeasureIndex = Math.min(
          maxFirstVisibleMeasure(trial),
          measureIndex - VISIBLE_MEASURE_COUNT + 1,
        );
      }
      break;
    }
  }
}
