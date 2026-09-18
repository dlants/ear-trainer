import type { PlayController, PlayStep } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import {
  type Melody,
  type Phrase,
  tonicEventIndexes,
  voice,
} from "../music/melody.ts";
import type { Degree } from "../music/note.ts";

export type TonicActivity = "sing-tonic" | "identify-tonic-notes";

export type SingTonicPhase = "presenting" | "revealing";
export type IdentifyTonicPhase = "answering" | "revealed";
export type MelodySlotAnswer = Degree | "other" | undefined;

export const VISIBLE_MEASURE_COUNT = 3;

export type SingTonicTrial = {
  phrase: Phrase;
  phase: SingTonicPhase;
};

export type IdentifyTonicTrial = {
  phrase: Phrase;
  phase: IdentifyTonicPhase;
  promptDegrees: Degree[];
  answers: MelodySlotAnswer[];
  selectedSlotIndex?: number;
  firstVisibleMeasureIndex: number;
};

export type SingTonicState = {
  activity: "sing-tonic";
  trial: SingTonicTrial | undefined;
  droneOn: boolean;
};

export type IdentifyTonicState = {
  activity: "identify-tonic-notes";
  trial: IdentifyTonicTrial | undefined;
  droneOn: boolean;
};

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

export type IdentifyTonicMsg =
  | { type: "START" }
  | { type: "PLAY_CONTEXT" }
  | { type: "TOGGLE_DRONE" }
  | { type: "REPEAT" }
  | { type: "SELECT_SLOT"; eventIndex: number }
  | { type: "SET_ANSWER"; answer: MelodySlotAnswer }
  | { type: "REVEAL" }
  | { type: "SCROLL"; delta: -1 | 1 }
  | { type: "SYNC_PLAYBACK" }
  | { type: "NEXT" };

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

export function tonicAnswerIndexes(phrase: Phrase): number[] {
  return tonicEventIndexes(phrase, "melody");
}

export function initialSingTonicState(): SingTonicState {
  return { activity: "sing-tonic", trial: undefined, droneOn: false };
}

export function initialIdentifyTonicState(): IdentifyTonicState {
  return {
    activity: "identify-tonic-notes",
    trial: undefined,
    droneOn: false,
  };
}

function melodyStep(phrase: Phrase, ctx: TonicPracticeCtx): PlayStep {
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
  state: SingTonicState | IdentifyTonicState,
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

function identifyTrial(phrase: Phrase): IdentifyTonicTrial {
  const eventCount = voice(phrase, "melody")?.events.length ?? 0;
  return {
    phrase,
    phase: "answering",
    promptDegrees: [1],
    answers: new Array<MelodySlotAnswer>(eventCount).fill(undefined),
    firstVisibleMeasureIndex: 0,
  };
}

function selectIdentifyTrial(
  state: IdentifyTonicState,
  ctx: TonicPracticeCtx,
): void {
  const phrase = selectTonicPhrase(
    ctx.melodies,
    state.trial?.phrase,
    ctx.random,
  );
  state.trial = phrase ? identifyTrial(phrase) : undefined;
  if (phrase) playMelody(phrase, ctx);
  else ctx.play.stop();
}

function maxFirstVisibleMeasure(trial: IdentifyTonicTrial): number {
  return Math.max(0, trial.phrase.measures.length - VISIBLE_MEASURE_COUNT);
}

export function updateIdentifyTonic(
  state: IdentifyTonicState,
  msg: IdentifyTonicMsg,
  ctx: TonicPracticeCtx,
): void {
  switch (msg.type) {
    case "START":
    case "NEXT":
      selectIdentifyTrial(state, ctx);
      break;
    case "PLAY_CONTEXT":
      if (state.trial) playContext(state.trial.phrase, ctx);
      break;
    case "TOGGLE_DRONE":
      toggleDrone(state, ctx);
      break;
    case "REPEAT":
      if (state.trial) {
        state.trial.firstVisibleMeasureIndex = 0;
        toggleMelody(state.trial.phrase, ctx);
      }
      break;
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
        playback.buttonId !== "tonic:melody" ||
        playback.eventIndex === undefined
      ) {
        break;
      }
      const event = voice(trial.phrase, "melody")?.events[playback.eventIndex];
      if (!event) break;
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
