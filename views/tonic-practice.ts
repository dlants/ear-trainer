import type { PlayController, PlayStep } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import {
  type Melody,
  type Phrase,
  tonicEventIndexes,
  voice,
} from "../music/melody.ts";
import type { Degree } from "../music/note.ts";
import {
  phraseMatchesSituation,
  promptDegreesForSituations,
  type SituationId,
} from "../music/situations.ts";

export type TonicActivity = "sing-tonic" | "identify-tonic-notes";
export type Activity = "identify-notes";

export type SingTonicPhase = "presenting" | "revealing";
export type IdentifyNotesScreen = "situations" | "practice";
export type IdentifyNotesPhase = "answering" | "revealed";
export type MelodySlotAnswer = Degree | "other" | undefined;

export const VISIBLE_MEASURE_COUNT = 3;

export type SingTonicTrial = {
  phrase: Phrase;
  phase: SingTonicPhase;
};

export type IdentifyNotesTrial = {
  phrase: Phrase;
  targetSituationId: SituationId;
  phase: IdentifyNotesPhase;
  promptDegrees: Degree[];
  answers: MelodySlotAnswer[];
  selectedSlotIndex?: number;
  cursorEventIndex: number;
  firstVisibleMeasureIndex: number;
};

export type IdentifyNotesState = {
  screen: IdentifyNotesScreen;
  selectedSituationIds: SituationId[];
  trial: IdentifyNotesTrial | undefined;
  droneOn: boolean;
};

export type SingTonicState = {
  activity: "sing-tonic";
  trial: SingTonicTrial | undefined;
  droneOn: boolean;
};

/** Compatibility shape retained until the activity integration is replaced. */
export type IdentifyTonicState = IdentifyNotesState & {
  activity: "identify-tonic-notes";
};
export type IdentifyTonicTrial = IdentifyNotesTrial;
export type IdentifyTonicPhase = IdentifyNotesPhase;

export type TonicPracticeState = SingTonicState | IdentifyTonicState;
export type TonicPracticeCtx = {
  play: PlayController;
  profile: Profile;
  melodies: Melody[];
  random(): number;
};

export type SingTonicMsg =
  | { type: "START" }
  | { type: "PLAY_CONTEXT" }
  | { type: "TOGGLE_DRONE" }
  | { type: "REPEAT" }
  | { type: "REVEAL" }
  | { type: "PLAY_ANSWER" }
  | { type: "NEXT" };

export type IdentifyNotesMsg =
  | { type: "TOGGLE_SITUATION"; situationId: SituationId }
  | { type: "BEGIN" }
  | { type: "CHANGE_SITUATIONS" }
  | { type: "PLAY_CONTEXT" }
  | { type: "TOGGLE_DRONE" }
  | { type: "PLAY_PAUSE" }
  | { type: "PLAY_FROM_BEGINNING" }
  | { type: "PLAY_EVENT"; eventIndex: number }
  | { type: "SELECT_SLOT"; eventIndex: number }
  | { type: "SET_ANSWER"; answer: MelodySlotAnswer }
  | { type: "REVEAL" }
  | { type: "SCROLL"; delta: -1 | 1 }
  | { type: "SYNC_PLAYBACK" }
  | { type: "NEXT" };

/** Compatibility message retained until callers adopt BEGIN. */
export type IdentifyTonicMsg =
  | Exclude<IdentifyNotesMsg, { type: "BEGIN" }>
  | { type: "START" };
export type TonicPracticeMsg =
  | { activity: "sing-tonic"; msg: SingTonicMsg }
  | { activity: "identify-tonic-notes"; msg: IdentifyTonicMsg };

function randomIndex(length: number, random: () => number): number {
  const value = random();
  if (!Number.isFinite(value)) return 0;
  return Math.min(length - 1, Math.max(0, Math.floor(value * length)));
}

function eligiblePhrases(melody: Melody): Phrase[] {
  return melody.phrases.filter(
    (phrase) =>
      phrase.noteIdentification === "independent" &&
      phrase.measures.length >= 2,
  );
}

/** Selects only authored eligible phrases and avoids immediate repetition. */
export function selectTonicPhrase(
  melodies: Melody[],
  previous: Phrase | undefined,
  random: () => number,
): Phrase | undefined {
  const eligible = melodies
    .map((melody) => ({ melody, phrases: eligiblePhrases(melody) }))
    .filter(({ phrases }) => phrases.length > 0);
  if (eligible.length === 0) return undefined;

  const otherMelodies = previous
    ? eligible.filter(({ melody }) => melody.id !== previous.melodyId)
    : [];
  const melodyPool = otherMelodies.length > 0 ? otherMelodies : eligible;
  const selectedMelody = melodyPool[randomIndex(melodyPool.length, random)];
  if (!selectedMelody) return undefined;

  const otherPhrases = previous
    ? selectedMelody.phrases.filter((phrase) => phrase.id !== previous.id)
    : selectedMelody.phrases;
  const phrasePool =
    otherPhrases.length > 0 ? otherPhrases : selectedMelody.phrases;
  return phrasePool[randomIndex(phrasePool.length, random)];
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

export function tonicAnswerIndexes(phrase: Phrase): number[] {
  return tonicEventIndexes(phrase, "melody");
}

export function initialSingTonicState(): SingTonicState {
  return { activity: "sing-tonic", trial: undefined, droneOn: false };
}

export function initialIdentifyNotesState(): IdentifyNotesState {
  return {
    screen: "situations",
    selectedSituationIds: ["tonic"],
    trial: undefined,
    droneOn: false,
  };
}

export function initialIdentifyTonicState(): IdentifyTonicState {
  return {
    activity: "identify-tonic-notes",
    ...initialIdentifyNotesState(),
  };
}

function melodyStep(
  phrase: Phrase,
  ctx: TonicPracticeCtx,
): Extract<PlayStep, { type: "score" }> {
  return {
    buttonId: "tonic:melody",
    type: "score",
    score: phrase,
    tonic: ctx.profile.tonic,
  };
}

function playMelody(phrase: Phrase, ctx: TonicPracticeCtx): void {
  ctx.play.autoplay([melodyStep(phrase, ctx)]);
}

function toggleMelody(phrase: Phrase, ctx: TonicPracticeCtx): void {
  ctx.play.toggle("tonic:melody", melodyStep(phrase, ctx));
}

function playContext(phrase: Phrase, ctx: TonicPracticeCtx): void {
  ctx.play.toggle("trial:context", {
    buttonId: "trial:context",
    type: "context",
    context: phrase.context,
    tonic: ctx.profile.tonic,
    speed: ctx.profile.cadenceSpeed,
  });
}

function toggleDrone(
  state: SingTonicState | IdentifyNotesState,
  ctx: TonicPracticeCtx,
): void {
  state.droneOn = !state.droneOn;
  ctx.play.setDrone(state.droneOn ? ctx.profile.tonic : undefined);
}

function selectSingTrial(state: SingTonicState, ctx: TonicPracticeCtx): void {
  const phrase = selectTonicPhrase(
    ctx.melodies,
    state.trial?.phrase,
    ctx.random,
  );
  state.trial = phrase ? { phrase, phase: "presenting" } : undefined;
  if (phrase) playMelody(phrase, ctx);
  else ctx.play.stop();
}

export function updateSingTonic(
  state: SingTonicState,
  msg: SingTonicMsg,
  ctx: TonicPracticeCtx,
): void {
  switch (msg.type) {
    case "START":
    case "NEXT":
      selectSingTrial(state, ctx);
      break;
    case "PLAY_CONTEXT":
      if (state.trial) playContext(state.trial.phrase, ctx);
      break;
    case "TOGGLE_DRONE":
      toggleDrone(state, ctx);
      break;
    case "REPEAT":
      if (state.trial) toggleMelody(state.trial.phrase, ctx);
      break;
    case "REVEAL":
      if (state.trial?.phase !== "presenting") break;
      state.trial.phase = "revealing";
      ctx.play.autoplay([
        {
          buttonId: "tonic:answer",
          type: "note",
          note: ctx.profile.tonic,
        },
      ]);
      break;
    case "PLAY_ANSWER":
      if (state.trial?.phase === "revealing") {
        ctx.play.toggle("tonic:answer", {
          buttonId: "tonic:answer",
          type: "note",
          note: ctx.profile.tonic,
        });
      }
      break;
  }
}

function identifyTrial(
  selection: PhraseSelection,
  selectedSituationIds: readonly SituationId[],
): IdentifyNotesTrial {
  const eventCount = voice(selection.phrase, "melody")?.events.length ?? 0;
  return {
    phrase: selection.phrase,
    targetSituationId: selection.targetSituationId,
    phase: "answering",
    promptDegrees: promptDegreesForSituations(selectedSituationIds),
    answers: new Array<MelodySlotAnswer>(eventCount).fill(undefined),
    cursorEventIndex: 0,
    firstVisibleMeasureIndex: 0,
  };
}

function selectIdentifyTrial(
  state: IdentifyNotesState,
  ctx: TonicPracticeCtx,
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
  state.trial = identifyTrial(selection, state.selectedSituationIds);
  playMelody(selection.phrase, ctx);
  return true;
}

function maxFirstVisibleMeasure(trial: IdentifyNotesTrial): number {
  return Math.max(0, trial.phrase.measures.length - VISIBLE_MEASURE_COUNT);
}

export function updateIdentifyNotes(
  state: IdentifyNotesState,
  msg: IdentifyNotesMsg,
  ctx: TonicPracticeCtx,
): void {
  switch (msg.type) {
    case "TOGGLE_SITUATION": {
      const index = state.selectedSituationIds.indexOf(msg.situationId);
      if (index >= 0) state.selectedSituationIds.splice(index, 1);
      else state.selectedSituationIds.push(msg.situationId);
      break;
    }
    case "BEGIN":
      if (selectIdentifyTrial(state, ctx)) state.screen = "practice";
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
      if (state.trial) playContext(state.trial.phrase, ctx);
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
      const event = voice(trial.phrase, "melody")?.events[
        trial.cursorEventIndex
      ];
      if (!event) break;
      ctx.play.autoplay([
        {
          ...melodyStep(trial.phrase, ctx),
          range: {
            startTicks: event.onsetTicks,
            endTicks: trial.phrase.durationTicks,
          },
        },
      ]);
      break;
    }
    case "PLAY_FROM_BEGINNING":
      if (state.trial) {
        state.trial.cursorEventIndex = 0;
        state.trial.firstVisibleMeasureIndex = 0;
        ctx.play.autoplay([
          {
            ...melodyStep(state.trial.phrase, ctx),
            buttonId: "tonic:melody-restart",
          },
        ]);
      }
      break;
    case "PLAY_EVENT": {
      const trial = state.trial;
      if (!trial) break;
      const event = voice(trial.phrase, "melody")?.events[msg.eventIndex];
      if (!event) break;
      trial.cursorEventIndex = msg.eventIndex;
      ctx.play.autoplay([
        {
          ...melodyStep(trial.phrase, ctx),
          buttonId: "tonic:melody-note",
          range: {
            startTicks: event.onsetTicks,
            endTicks: event.onsetTicks + event.durationTicks,
          },
        },
      ]);
      break;
    }
    case "SELECT_SLOT": {
      const trial = state.trial;
      if (
        trial?.phase === "answering" &&
        msg.eventIndex >= 0 &&
        msg.eventIndex < trial.answers.length
      ) {
        trial.selectedSlotIndex = msg.eventIndex;
      }
      break;
    }
    case "SET_ANSWER": {
      const trial = state.trial;
      const index = trial?.selectedSlotIndex;
      if (trial?.phase !== "answering" || index === undefined) break;
      if (
        msg.answer !== undefined &&
        msg.answer !== "other" &&
        !trial.promptDegrees.includes(msg.answer)
      ) {
        break;
      }
      trial.answers[index] = msg.answer;
      break;
    }
    case "REVEAL":
      if (state.trial?.phase === "answering") {
        state.trial.phase = "revealed";
        state.trial.selectedSlotIndex = undefined;
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
        playback.eventIndex === undefined
      ) {
        break;
      }
      const event = voice(trial.phrase, "melody")?.events[playback.eventIndex];
      if (!event) break;
      trial.cursorEventIndex = playback.eventIndex;
      const measureIndex = trial.phrase.measures.findIndex(
        (measure) =>
          event.onsetTicks >= measure.startTicks &&
          event.onsetTicks < measure.endTicks,
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

export function updateIdentifyTonic(
  state: IdentifyTonicState,
  msg: IdentifyTonicMsg,
  ctx: TonicPracticeCtx,
): void {
  updateIdentifyNotes(
    state,
    msg.type === "START" ? { type: "BEGIN" } : msg,
    ctx,
  );
}

export function updateTonicPractice(
  state: TonicPracticeState,
  msg: TonicPracticeMsg,
  ctx: TonicPracticeCtx,
): void {
  switch (msg.activity) {
    case "sing-tonic":
      if (state.activity === "sing-tonic") {
        updateSingTonic(state, msg.msg, ctx);
      }
      break;
    case "identify-tonic-notes":
      if (state.activity === "identify-tonic-notes") {
        updateIdentifyTonic(state, msg.msg, ctx);
      }
      break;
  }
}
