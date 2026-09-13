import type { PlayController, PlayStep } from "../audio/play-controller.ts";
import type { Confidence, DeckCard, Outcome } from "../deck/card.ts";
import type { Profile, ProfileStore } from "../deck/profiles.ts";
import type { DeckStore } from "../deck/store.ts";
import { checkIcon, questionIcon } from "../icons.ts";
import { patternFromId } from "../music/format.ts";
import type { Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import {
  Binder,
  cls,
  mountStyle,
  noop,
  onPress,
  ref,
  sanitize,
  show,
  type View,
} from "../vamp.ts";
import { PatternNotationView } from "./pattern-notation.ts";
import { PlayButtonView } from "./play-button.ts";

export type TrialPhase = "presenting" | "revealing";

export type Trial = {
  card: DeckCard;
  pattern: Pattern;
  tonic: Midi;
  phase: TrialPhase;
  confidence: Confidence | undefined;
};

/** `trial: undefined` means nothing is due right now. */
export type State = {
  trial: Trial | undefined;
  error: string | undefined;
};

export type Msg =
  | { type: "NEXT_TRIAL" }
  | { type: "PLAY_CONTEXT" }
  | { type: "PLAY_PATTERN" }
  | { type: "TOGGLE_DRONE" }
  | { type: "COMMIT"; confidence: Confidence }
  | { type: "GRADE"; outcome: Outcome }
  | { type: "ERROR"; message: string };

export type TrialCtx = {
  play: PlayController;
  deck: DeckStore;
  profile: Profile;
  profiles: ProfileStore;
  now(): Date;
};

export function nextTrial(ctx: TrialCtx): Trial | undefined {
  const card = ctx.deck.nextDue(ctx.now());
  if (!card) return undefined;
  const pattern = patternFromId(card.patternId);
  if (!pattern.ok) return undefined;
  return {
    card,
    pattern: pattern.value,
    tonic: ctx.profile.tonic,
    phase: "presenting",
    confidence: undefined,
  };
}

/**
 * In audiation the learner sings the notation, so hearing the pattern before
 * committing would give the answer away.
 */
export function canPlayPattern(trial: Trial): boolean {
  return trial.card.mode === "transcription" || trial.phase === "revealing";
}

/** The mirror image: in transcription the notation is the answer. */
export function showsNotation(trial: Trial): boolean {
  return trial.card.mode === "audiation" || trial.phase === "revealing";
}

export function initialState(_ctx: TrialCtx): State {
  return { trial: undefined, error: undefined };
}

function contextStep(trial: Trial, ctx: TrialCtx): PlayStep {
  return {
    buttonId: "trial:context",
    type: "context",
    context: trial.pattern.context,
    tonic: trial.tonic,
    speed: ctx.profile.cadenceSpeed,
  };
}

/** The drone holds the tonic audible for the whole trial, not just playback. */
function droneTonic(trial: Trial | undefined, ctx: TrialCtx): Midi | undefined {
  return trial && ctx.profile.drone ? trial.tonic : undefined;
}

function patternStep(trial: Trial): PlayStep {
  return {
    buttonId: "trial:pattern",
    type: "pattern",
    pattern: trial.pattern,
    tonic: trial.tonic,
  };
}

function selectNextTrial(state: State, ctx: TrialCtx): void {
  state.trial = nextTrial(ctx);
  const trial = state.trial;
  ctx.play.setDrone(droneTonic(trial, ctx));
  if (!trial) {
    ctx.play.stop();
    return;
  }
  ctx.play.autoplay(
    trial.card.mode === "transcription"
      ? [contextStep(trial, ctx), patternStep(trial)]
      : [contextStep(trial, ctx)],
  );
}

export function update(state: State, msg: Msg, ctx: TrialCtx): void {
  switch (msg.type) {
    case "NEXT_TRIAL":
      selectNextTrial(state, ctx);
      break;

    case "PLAY_CONTEXT": {
      const trial = state.trial;
      if (trial) ctx.play.toggle("trial:context", contextStep(trial, ctx));
      break;
    }

    case "PLAY_PATTERN": {
      const trial = state.trial;
      if (trial && canPlayPattern(trial)) {
        ctx.play.toggle("trial:pattern", patternStep(trial));
      }
      break;
    }

    case "TOGGLE_DRONE": {
      ctx.profile.drone = !ctx.profile.drone;
      ctx.profiles.save(ctx.profile);
      ctx.play.setDrone(droneTonic(state.trial, ctx));
      break;
    }

    case "COMMIT": {
      const trial = state.trial;
      if (trial?.phase !== "presenting") break;
      trial.confidence = msg.confidence;
      trial.phase = "revealing";
      if (trial.card.mode === "audiation") {
        ctx.play.autoplay([patternStep(trial)]);
      }
      break;
    }

    case "GRADE": {
      const trial = state.trial;
      if (trial?.phase !== "revealing" || !trial.confidence) break;
      ctx.deck.grade(trial.card.id, trial.confidence, msg.outcome, ctx.now());
      selectNextTrial(state, ctx);
      break;
    }

    case "ERROR":
      state.error = msg.message;
      break;
  }
}

const trialClass = cls("trial");
const promptClass = cls("prompt");
const instructionClass = cls("instruction");
const rowClass = cls("row");
const playSlotClass = cls("play-slot");
const droneRowClass = cls("drone-row");
const bigClass = cls("big");
const unsureClass = cls("unsure");
const knownClass = cls("known");
const incorrectClass = cls("incorrect");
const correctClass = cls("correct");

mountStyle(`
.${trialClass} {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: max(16px, env(safe-area-inset-top)) 16px
    max(16px, env(safe-area-inset-bottom));
  min-height: 100dvh;
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
}
.${trialClass} .${promptClass} {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.${trialClass} .${bigClass} {
  font-size: clamp(56px, 15vw, 160px);
}
.${trialClass} .${instructionClass} {
  color: var(--color-text-muted);
  font-size: 18px;
}
.${trialClass} .${rowClass} {
  display: flex;
  gap: 12px;
}
.${trialClass} .${playSlotClass} {
  flex: 1;
  display: flex;
}
.${trialClass} .${rowClass} > button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  padding: 20px 8px;
  border-radius: var(--radius-control);
}
.${trialClass} .${rowClass} > button svg {
  flex: 0 0 auto;
  font-size: 1.15em;
}
.${trialClass} .${droneRowClass} {
  display: flex;
  justify-content: center;
}
.${trialClass} .${unsureClass} {
  border: 2px solid var(--color-unsure-border);
  background: var(--color-unsure-surface);
  color: var(--color-unsure);
}
.${trialClass} .${knownClass} {
  border: 2px solid var(--color-brand-border);
  background: var(--color-brand-surface);
  color: var(--color-brand);
}
.${trialClass} .${incorrectClass} {
  border: 2px solid var(--color-incorrect-border);
  background: var(--color-incorrect-surface);
  color: var(--color-incorrect);
}
.${trialClass} .${correctClass} {
  border: 2px solid var(--color-correct-border);
  background: var(--color-correct-surface);
  color: var(--color-correct);
}
`);

export class TrialView
  implements View<State, Msg, Pick<TrialCtx, "play" | "profile">>
{
  container: HTMLElement;
  private b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
    ctx: Pick<TrialCtx, "play" | "profile">,
  ) {
    const notationRef = ref("notation");
    const questionRef = ref("question");
    const instructionRef = ref("instruction");
    const emptyRef = ref("empty");
    const errorRef = ref("error");
    const droneRef = ref("drone");
    const contextRef = ref("context");
    const patternRef = ref("pattern");
    const commitRowRef = ref("commitRow");
    const knownRef = ref("known");
    const unsureRef = ref("unsure");
    const outcomeRowRef = ref("outcomeRow");
    const gotItRef = ref("gotIt");
    const missedRef = ref("missed");

    this.container = container;
    container.innerHTML = sanitize`
      <div class="${trialClass}">
        <div data-ref="${errorRef}"></div>
        <div data-ref="${emptyRef}">nothing due — come back later</div>
        <div class="${promptClass}">
          <div class="${bigClass}">
            <div data-ref="${notationRef}"></div>
            <div data-ref="${questionRef}">?</div>
          </div>
          <div class="${instructionClass}" data-ref="${instructionRef}"></div>
        </div>
        <div class="${droneRowClass}" data-ref="${droneRef}"></div>
        <div class="${rowClass}">
          <div class="${playSlotClass}" data-ref="${contextRef}"></div>
          <div class="${playSlotClass}" data-ref="${patternRef}"></div>
        </div>
        <div class="${rowClass}" data-ref="${commitRowRef}">
          <button type="button" class="${unsureClass}" data-ref="${unsureRef}">unsure ${questionIcon()}</button>
          <button type="button" class="${knownClass}" data-ref="${knownRef}">confident ${checkIcon()}</button>
        </div>
        <div class="${rowClass}" data-ref="${outcomeRowRef}">
          <button type="button" class="${incorrectClass}" data-ref="${missedRef}">missed</button>
          <button type="button" class="${correctClass}" data-ref="${gotItRef}">got it</button>
        </div>
      </div>
    `;
    this.b = new Binder(container, initial);

    const on = (r: ReturnType<typeof ref>, msg: Msg) =>
      onPress(this.b.ref(r), () => dispatch(msg));

    this.b.bindSlot(droneRef, (state) => {
      const droneOn = ctx.profile.drone;
      return show(
        PlayButtonView,
        {
          id: "trial:drone",
          label: droneOn ? "drone on" : "drone off",
          ariaLabel: "hold the tonic under every trial",
          icon: "drone",
          variant: "compact",
          visible: state.trial !== undefined,
          playing: false,
          selected: droneOn,
          durationMs: undefined,
        },
        {},
        () => dispatch({ type: "TOGGLE_DRONE" }),
      );
    });
    this.b.bindSlot(contextRef, (state) => {
      const playback = ctx.play.getState();
      const playing =
        playback.status === "playing" && playback.buttonId === "trial:context";
      return show(
        PlayButtonView,
        {
          id: "trial:context",
          label: "key",
          ariaLabel: "play key",
          icon: "key",
          variant: "trial",
          visible: state.trial !== undefined,
          playing,
          durationMs: playing ? playback.durationMs : undefined,
        },
        {},
        () => dispatch({ type: "PLAY_CONTEXT" }),
      );
    });
    this.b.bindSlot(patternRef, (state) => {
      const playback = ctx.play.getState();
      const playing =
        playback.status === "playing" && playback.buttonId === "trial:pattern";
      return show(
        PlayButtonView,
        {
          id: "trial:pattern",
          label: "play",
          ariaLabel: "play pattern",
          icon: "play",
          variant: "trial",
          visible: state.trial !== undefined && canPlayPattern(state.trial),
          playing,
          durationMs: playing ? playback.durationMs : undefined,
        },
        {},
        () => dispatch({ type: "PLAY_PATTERN" }),
      );
    });
    on(knownRef, { type: "COMMIT", confidence: "known" });
    on(unsureRef, { type: "COMMIT", confidence: "unsure" });
    on(gotItRef, { type: "GRADE", outcome: "got-it" });
    on(missedRef, { type: "GRADE", outcome: "missed" });

    this.b.bindText(errorRef, (s) => s.error ?? "");
    this.b.bindVisible(errorRef, (s) => s.error !== undefined);
    this.b.bindVisible(emptyRef, (s) => s.trial === undefined);
    this.b.bindText(instructionRef, (s) =>
      s.trial?.card.mode === "transcription"
        ? "identify the notes"
        : "sing these notes",
    );
    this.b.bindVisible(instructionRef, (s) => s.trial !== undefined);
    this.b.bindSlot(notationRef, (s) =>
      s.trial && showsNotation(s.trial)
        ? show(PatternNotationView, s.trial.pattern, {}, noop)
        : undefined,
    );
    this.b.bindVisible(
      questionRef,
      (s) => s.trial === undefined || !showsNotation(s.trial),
    );
    this.b.bindVisible(commitRowRef, (s) => s.trial?.phase === "presenting");
    this.b.bindVisible(outcomeRowRef, (s) => s.trial?.phase === "revealing");
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
