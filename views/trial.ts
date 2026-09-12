import type { PlayController, PlayStep } from "../audio/play-controller.ts";
import type { Confidence, DeckCard, Outcome } from "../deck/card.ts";
import type { Profile } from "../deck/profiles.ts";
import type { DeckStore } from "../deck/store.ts";
import { checkIcon, keyIcon, playIcon, questionIcon } from "../icons.ts";
import { formatPattern, patternFromId } from "../music/format.ts";
import type { Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import { Binder, cls, mountStyle, ref, sanitize, type View } from "../vamp.ts";

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
  | { type: "COMMIT"; confidence: Confidence }
  | { type: "GRADE"; outcome: Outcome }
  | { type: "ERROR"; message: string };

export type TrialCtx = {
  play: PlayController;
  deck: DeckStore;
  profile: Profile;
  now(): Date;
  /** Only consulted when the profile's `tonicMode` is `"moving"`. */
  randomTonic(): Midi;
};

function trialTonic(ctx: TrialCtx): Midi {
  return ctx.profile.tonicMode === "fixed"
    ? ctx.profile.tonic
    : ctx.randomTonic();
}

export function nextTrial(ctx: TrialCtx): Trial | undefined {
  const card = ctx.deck.nextDue(ctx.now());
  if (!card) return undefined;
  const pattern = patternFromId(card.patternId);
  if (!pattern.ok) return undefined;
  return {
    card,
    pattern: pattern.value,
    tonic: trialTonic(ctx),
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

function contextStep(trial: Trial): PlayStep {
  return {
    buttonId: "trial:context",
    type: "context",
    context: trial.pattern.context,
    tonic: trial.tonic,
  };
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
  if (!trial) {
    ctx.play.stop();
    return;
  }
  ctx.play.autoplay(
    trial.card.mode === "transcription"
      ? [contextStep(trial), patternStep(trial)]
      : [contextStep(trial)],
  );
}

export function update(state: State, msg: Msg, ctx: TrialCtx): void {
  switch (msg.type) {
    case "NEXT_TRIAL":
      selectNextTrial(state, ctx);
      break;

    case "PLAY_CONTEXT": {
      const trial = state.trial;
      if (trial) ctx.play.toggle("trial:context", contextStep(trial));
      break;
    }

    case "PLAY_PATTERN": {
      const trial = state.trial;
      if (trial && canPlayPattern(trial)) {
        ctx.play.toggle("trial:pattern", patternStep(trial));
      }
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
const rowClass = cls("row");
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
.${trialClass} .${bigClass} {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15vw;
  letter-spacing: 0.05em;
}
.${trialClass} .${rowClass} {
  display: flex;
  gap: 12px;
}
.${trialClass} button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  padding: 20px 8px;
  border-radius: var(--radius-control);
  touch-action: manipulation;
}
.${trialClass} button svg {
  flex: 0 0 auto;
  font-size: 1.15em;
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

export class TrialView implements View<State, Msg> {
  container: HTMLElement;
  private b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
  ) {
    const notationRef = ref("notation");
    const emptyRef = ref("empty");
    const errorRef = ref("error");
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
        <div class="${bigClass}" data-ref="${notationRef}"></div>
        <div class="${rowClass}">
          <button type="button" data-ref="${contextRef}">key ${keyIcon()}</button>
          <button type="button" data-ref="${patternRef}">play ${playIcon()}</button>
        </div>
        <div class="${rowClass}" data-ref="${commitRowRef}">
          <button type="button" class="${unsureClass}" data-ref="${unsureRef}">unsure ${questionIcon()}</button>
          <button type="button" class="${knownClass}" data-ref="${knownRef}">known ${checkIcon()}</button>
        </div>
        <div class="${rowClass}" data-ref="${outcomeRowRef}">
          <button type="button" class="${incorrectClass}" data-ref="${missedRef}">missed</button>
          <button type="button" class="${correctClass}" data-ref="${gotItRef}">got it</button>
        </div>
      </div>
    `;
    this.b = new Binder(container, initial);

    const on = (r: ReturnType<typeof ref>, msg: Msg) =>
      this.b.ref(r).addEventListener("click", () => dispatch(msg));

    on(contextRef, { type: "PLAY_CONTEXT" });
    on(patternRef, { type: "PLAY_PATTERN" });
    on(knownRef, { type: "COMMIT", confidence: "known" });
    on(unsureRef, { type: "COMMIT", confidence: "unsure" });
    on(gotItRef, { type: "GRADE", outcome: "got-it" });
    on(missedRef, { type: "GRADE", outcome: "missed" });

    this.b.bindText(errorRef, (s) => s.error ?? "");
    this.b.bindVisible(errorRef, (s) => s.error !== undefined);
    this.b.bindVisible(emptyRef, (s) => s.trial === undefined);
    this.b.bindText(notationRef, (s) =>
      s.trial && showsNotation(s.trial)
        ? formatPattern(s.trial.pattern, "numeric")
        : "?",
    );
    this.b.bindVisible(contextRef, (s) => s.trial !== undefined);
    this.b.bindVisible(
      patternRef,
      (s) => s.trial !== undefined && canPlayPattern(s.trial),
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
