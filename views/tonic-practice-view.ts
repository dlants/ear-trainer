import type { PlayState } from "../audio/play-controller.ts";
import { arrowDownIcon, arrowUpIcon } from "../icons.ts";
import type { Measure, TimedEvent } from "../music/melody.ts";
import { voice } from "../music/melody.ts";
import type { Degree } from "../music/note.ts";
import {
  promptDegreesForSituations,
  SITUATIONS,
  type SituationDefinition,
} from "../music/situations.ts";
import {
  Binder,
  cls,
  mountStyle,
  onPress,
  ref,
  sanitize,
  show,
  showKeyed,
  type View,
} from "../vamp.ts";
import { PlayButtonView } from "./play-button.ts";
import {
  type IdentifyNotesMsg,
  type IdentifyNotesState,
  type IdentifyNotesTrial,
  type MelodySlotAnswer,
  type SingTonicMsg,
  type SingTonicState,
  selectIdentifyNotesPhrase,
  type TonicPracticeCtx,
  VISIBLE_MEASURE_COUNT,
} from "./tonic-practice.ts";

export type SlotResult = "correct" | "incorrect";

function actualAnswer(
  event: TimedEvent,
  promptDegrees: Degree[],
): Exclude<MelodySlotAnswer, undefined> {
  const note = event.notes.length === 1 ? event.notes[0] : undefined;
  return note && note.alteration === 0 && promptDegrees.includes(note.degree)
    ? note.degree
    : "other";
}

export function slotResult(
  event: TimedEvent,
  promptDegrees: Degree[],
  answer: MelodySlotAnswer,
): SlotResult {
  return (answer ?? "other") === actualAnswer(event, promptDegrees)
    ? "correct"
    : "incorrect";
}

function guessLabel(answer: MelodySlotAnswer): string {
  if (answer === undefined) return "";
  return answer === "other" ? "other" : String(answer);
}

function noteLabel(event: TimedEvent): string {
  return event.notes
    .map((note) => {
      const accidental =
        note.alteration === 1 ? "♯" : note.alteration === -1 ? "♭" : "";
      const octave = (note.octave > 0 ? "↑" : "↓").repeat(
        Math.abs(note.octave),
      );
      return `${accidental}${note.degree}${octave}`;
    })
    .join("+");
}

function playbackFor(
  ctx: Pick<TonicPracticeCtx, "play">,
  id: string,
): PlayState {
  const playback = ctx.play.getState();
  return playback.status === "playing" && playback.buttonId === id
    ? playback
    : { status: "idle" };
}

function melodyPlayback(ctx: Pick<TonicPracticeCtx, "play">): PlayState {
  const playback = ctx.play.getState();
  return playback.status === "playing" &&
    playback.buttonId.startsWith("tonic:melody")
    ? playback
    : { status: "idle" };
}

const pageClass = cls("tonic-page");
const headingClass = cls("tonic-heading");
const instructionClass = cls("tonic-instruction");
const supportClass = cls("tonic-support");
const playRowClass = cls("tonic-play-row");
const actionRowClass = cls("tonic-action-row");
const primaryClass = cls("tonic-primary");
const viewportClass = cls("tonic-viewport");
const viewportControlsClass = cls("tonic-viewport-controls");
const measureClass = cls("tonic-measure");
const measureRowsClass = cls("tonic-measure-rows");
const measureGridClass = cls("tonic-measure-grid");
const slotClass = cls("tonic-slot");
const guessSlotClass = cls("tonic-guess-slot");
const cursorClass = cls("tonic-slot-cursor");
const selectedClass = cls("tonic-slot-selected");
const correctClass = cls("tonic-slot-correct");
const incorrectClass = cls("tonic-slot-incorrect");
const paletteClass = cls("tonic-palette");
const emptyClass = cls("tonic-empty");
const selectorClass = cls("identify-selector");
const situationListClass = cls("identify-situation-list");
const situationButtonClass = cls("identify-situation-button");
const situationLabelClass = cls("identify-situation-label");
const situationDescriptionClass = cls("identify-situation-description");
const vocabularyClass = cls("identify-vocabulary");
const selectorStatusClass = cls("identify-selector-status");

mountStyle(`
.${pageClass} {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100dvh;
  box-sizing: border-box;
  padding: max(72px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom));
}
.${pageClass} .${headingClass} { margin: 0; font-size: 28px; }
.${pageClass} .${instructionClass} { margin: 0; color: var(--color-text-muted); font-size: 17px; line-height: 1.4; }
.${pageClass} .${supportClass},
.${pageClass} .${playRowClass},
.${pageClass} .${actionRowClass} { display: flex; gap: 10px; }
.${pageClass} .${supportClass} { justify-content: center; }
.${pageClass} .${playRowClass} > *, .${pageClass} .${actionRowClass} > * { flex: 1; display: flex; }
.${pageClass} .${actionRowClass} button {
  flex: 1;
  min-height: 52px;
  border-radius: var(--radius-control);
  font-weight: 700;
}
.${pageClass} .${primaryClass} {
  border: 2px solid var(--color-brand-border);
  background: var(--color-brand-surface);
  color: var(--color-brand);
}
.${pageClass} .${emptyClass} { color: var(--color-text-muted); text-align: center; padding: 40px 12px; }
.${pageClass} .${selectorClass} { display: grid; gap: 16px; }
.${pageClass} .${situationListClass} { display: grid; gap: 8px; }
.${pageClass} .${situationButtonClass} {
  width: 100%;
  display: grid;
  gap: 3px;
  padding: 12px 14px;
  border-radius: var(--radius-control);
  text-align: left;
}
.${pageClass} .${situationButtonClass}.${selectedClass} {
  border: 2px solid var(--color-brand-border);
  background: var(--color-brand-surface);
  color: var(--color-brand);
}
.${pageClass} .${situationLabelClass} { font-weight: 750; }
.${pageClass} .${situationDescriptionClass} { color: var(--color-text-muted); line-height: 1.35; }
.${pageClass} .${vocabularyClass} { margin: 0; line-height: 1.4; }
.${pageClass} .${selectorStatusClass} { margin: 0; color: var(--color-text-muted); text-align: center; }
.${pageClass} .${viewportClass} { display: grid; gap: 8px; }
.${pageClass} .${measureClass} { display: block; }
.${pageClass} .${measureRowsClass} { display: grid; gap: 0; }
.${pageClass} .${measureGridClass} {
  position: relative;
  height: 38px;
  overflow: hidden;
}
.${pageClass} .${slotClass} {
  position: absolute;
  top: 2px;
  height: 34px;
  min-width: 30px;
  padding: 0 4px;
  box-sizing: border-box;
  border-radius: var(--radius-control);
  font-weight: 750;
  overflow: hidden;
  white-space: nowrap;
}
.${pageClass} .${guessSlotClass} {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.${pageClass} .${guessSlotClass}:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.${pageClass} .${cursorClass} { outline: 3px solid var(--color-unsure-border); outline-offset: 1px; }
.${pageClass} .${selectedClass} { border: 2px solid var(--color-brand-border); background: var(--color-brand-surface); color: var(--color-brand); }
.${pageClass} .${correctClass} { border: 2px solid var(--color-correct-border); background: var(--color-correct-surface); color: var(--color-correct); }
.${pageClass} .${incorrectClass} { border: 2px solid var(--color-incorrect-border); background: var(--color-incorrect-surface); color: var(--color-incorrect); }
.${pageClass} .${paletteClass} { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; min-height: 46px; }
.${pageClass} .${paletteClass} button { min-width: 72px; padding: 10px 12px; border-radius: var(--radius-control); font-weight: 700; }
.${pageClass} .${viewportControlsClass} { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; }
.${pageClass} .${viewportControlsClass} button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 42px; border-radius: var(--radius-control); }
.${pageClass} .${viewportControlsClass} button:last-child { justify-self: end; }
.${pageClass} .${viewportControlsClass} svg { font-size: 1.1em; }
@media (max-width: 360px) {
  .${pageClass} { padding-inline: 10px; }
  .${pageClass} .${paletteClass} { gap: 6px; }
  .${pageClass} .${paletteClass} button { min-width: 54px; padding-inline: 8px; }
  .${pageClass} .${actionRowClass} { flex-direction: column; }
}
`);

type SlotState = {
  event: TimedEvent;
  eventIndex: number;
  measure: Measure;
  promptDegrees: Degree[];
  answer: MelodySlotAnswer;
  selected: boolean;
  cursor: boolean;
  revealed: boolean;
};

type SlotMsg = { type: "ACTIVATE"; eventIndex: number };

function slotStyle(state: SlotState): Record<string, string> {
  const duration = state.measure.endTicks - state.measure.startTicks;
  const leftPercent =
    ((state.event.onsetTicks - state.measure.startTicks) / duration) * 100;
  const widthPercent = (state.event.durationTicks / duration) * 100;
  return {
    left: `calc(${leftPercent}% + 2px)`,
    width: `calc(${widthPercent}% - 4px)`,
  };
}

function resultClass(state: SlotState): string {
  if (!state.revealed) return "";
  return slotResult(state.event, state.promptDegrees, state.answer) ===
    "correct"
    ? correctClass
    : incorrectClass;
}

class ToneSlotView implements View<SlotState, SlotMsg> {
  container: HTMLElement;
  private readonly b: Binder<SlotState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: SlotMsg) => void,
    initial: SlotState,
  ) {
    const buttonRef = ref("toneSlot");
    const textRef = ref("toneText");
    this.container = container;
    container.innerHTML = sanitize`<button type="button" data-ref="${buttonRef}"><span data-ref="${textRef}"></span></button>`;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "ACTIVATE", eventIndex: initial.eventIndex }),
    );
    this.b.bindStyle(buttonRef, slotStyle);
    this.b.bindClass(buttonRef, (state) =>
      [slotClass, state.cursor ? cursorClass : "", resultClass(state)]
        .filter(Boolean)
        .join(" "),
    );
    this.b.bindText(textRef, (state) =>
      state.revealed ? noteLabel(state.event) : "?",
    );
    this.b.bindAttr(buttonRef, "data-event-index", (state) =>
      String(state.eventIndex),
    );
    this.b.bindAttr(buttonRef, "data-row", () => "tone");
    this.b.bindAttr(buttonRef, "data-result", (state) =>
      state.revealed
        ? slotResult(state.event, state.promptDegrees, state.answer)
        : undefined,
    );
    this.b.bindAttr(buttonRef, "aria-current", (state) =>
      state.cursor ? "true" : undefined,
    );
    this.b.bindAttr(buttonRef, "aria-label", (state) =>
      state.revealed
        ? `melody note ${state.eventIndex + 1}: ${noteLabel(state.event)}`
        : `masked melody note ${state.eventIndex + 1}`,
    );
  }

  sync(state: SlotState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

class GuessSlotView implements View<SlotState, SlotMsg> {
  container: HTMLElement;
  private readonly b: Binder<SlotState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: SlotMsg) => void,
    initial: SlotState,
  ) {
    const slotRef = ref("guessSlot");
    const textRef = ref("guessText");
    this.container = container;
    container.innerHTML = sanitize`<span role="button" tabindex="0" data-ref="${slotRef}"><span data-ref="${textRef}"></span></span>`;
    this.b = new Binder(container, initial);
    const slot = this.b.ref(slotRef);
    const activate = () =>
      dispatch({ type: "ACTIVATE", eventIndex: initial.eventIndex });
    onPress(slot, activate);
    slot.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
    this.b.bindStyle(slotRef, slotStyle);
    this.b.bindClass(slotRef, (state) =>
      [
        slotClass,
        guessSlotClass,
        state.selected ? selectedClass : "",
        resultClass(state),
      ]
        .filter(Boolean)
        .join(" "),
    );
    this.b.bindText(textRef, (state) => guessLabel(state.answer));
    this.b.bindAttr(slotRef, "data-event-index", (state) =>
      String(state.eventIndex),
    );
    this.b.bindAttr(slotRef, "data-row", () => "guess");
    this.b.bindAttr(slotRef, "data-result", (state) =>
      state.revealed
        ? slotResult(state.event, state.promptDegrees, state.answer)
        : undefined,
    );
    this.b.bindAttr(slotRef, "aria-pressed", (state) =>
      String(state.answer !== undefined && state.answer !== "other"),
    );
    this.b.bindAttr(slotRef, "aria-label", (state) => {
      const label = guessLabel(state.answer);
      return label
        ? `guess for melody note ${state.eventIndex + 1}: ${label}`
        : `choose a guess for melody note ${state.eventIndex + 1}`;
    });
  }

  sync(state: SlotState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

type MeasureState = {
  measure: Measure;
  measureIndex: number;
  events: { event: TimedEvent; eventIndex: number }[];
  trial: IdentifyNotesTrial;
};

type MeasureMsg = SlotMsg;

class MelodyMeasureView implements View<MeasureState, MeasureMsg> {
  container: HTMLElement;
  private readonly b: Binder<MeasureState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: MeasureMsg) => void,
    initial: MeasureState,
  ) {
    const toneSlotsRef = ref("toneSlots");
    const guessSlotsRef = ref("guessSlots");
    this.container = container;
    container.innerHTML = sanitize`
      <section class="${measureClass}" aria-label="bar ${initial.measureIndex + 1}">
        <div class="${measureRowsClass}">
          <div class="${measureGridClass}" data-row="tone"><div data-ref="${toneSlotsRef}"></div></div>
          <div class="${measureGridClass}" data-row="guess"><div data-ref="${guessSlotsRef}"></div></div>
        </div>
      </section>
    `;
    this.b = new Binder(container, initial);
    this.b.bindContainerAttr("data-measure-index", (state) =>
      String(state.measureIndex),
    );
    const slotState = (
      state: MeasureState,
      event: TimedEvent,
      eventIndex: number,
    ): SlotState => ({
      event,
      eventIndex,
      measure: state.measure,
      promptDegrees: state.trial.promptDegrees,
      answer: state.trial.answers[eventIndex],
      selected: state.trial.selectedSlotIndex === eventIndex,
      cursor: state.trial.cursorEventIndex === eventIndex,
      revealed: state.trial.phase === "revealed",
    });
    this.b.bindList(toneSlotsRef, "span", (state) =>
      state.events.map(({ event, eventIndex }) =>
        showKeyed(
          String(eventIndex),
          ToneSlotView,
          slotState(state, event, eventIndex),
          {},
          dispatch,
        ),
      ),
    );
    this.b.bindList(guessSlotsRef, "span", (state) =>
      state.events.map(({ event, eventIndex }) =>
        showKeyed(
          String(eventIndex),
          GuessSlotView,
          slotState(state, event, eventIndex),
          {},
          dispatch,
        ),
      ),
    );
  }

  sync(state: MeasureState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

function playButtonState(
  ctx: Pick<TonicPracticeCtx, "play">,
  id:
    | "trial:context"
    | "trial:drone"
    | "tonic:melody"
    | "tonic:melody-restart"
    | "tonic:answer",
  label: string,
  ariaLabel: string,
  icon: "key" | "drone" | "play" | "pause" | "restart",
  variant: "trial" | "compact",
  visible: boolean,
  selected = false,
  animated = true,
) {
  const playback = playbackFor(ctx, id);
  const playing = playback.status === "playing";
  return {
    id,
    label,
    ariaLabel,
    icon,
    variant,
    visible,
    playing,
    selected,
    durationMs: playing ? playback.durationMs : undefined,
    animated,
  } as const;
}

export class SingTonicView
  implements
    View<
      SingTonicState,
      SingTonicMsg,
      Pick<TonicPracticeCtx, "play" | "profile">
    >
{
  container: HTMLElement;
  private readonly b: Binder<SingTonicState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: SingTonicMsg) => void,
    initial: SingTonicState,
    ctx: Pick<TonicPracticeCtx, "play" | "profile">,
  ) {
    const emptyRef = ref("empty");
    const activityRef = ref("activity");
    const contextRef = ref("context");
    const droneRef = ref("drone");
    const melodyRef = ref("melody");
    const answerRef = ref("answer");
    const revealRef = ref("reveal");
    const nextRef = ref("next");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${pageClass}">
        <h1 class="${headingClass}">Sing the tonic</h1>
        <p class="${instructionClass}">Listen to the melody, then sing the note that feels like home.</p>
        <p class="${emptyClass}" data-ref="${emptyRef}">No eligible melody fragments are available.</p>
        <div data-ref="${activityRef}">
          <div class="${supportClass}">
            <div data-ref="${contextRef}"></div>
            <div data-ref="${droneRef}"></div>
          </div>
          <div class="${playRowClass}">
            <div data-ref="${melodyRef}"></div>
            <div data-ref="${answerRef}"></div>
          </div>
          <div class="${actionRowClass}">
            <button type="button" class="${primaryClass}" data-ref="${revealRef}">reveal tonic</button>
            <button type="button" class="${primaryClass}" data-ref="${nextRef}">next melody</button>
          </div>
        </div>
      </section>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(revealRef), () => dispatch({ type: "REVEAL" }));
    onPress(this.b.ref(nextRef), () => dispatch({ type: "NEXT" }));
    this.b.bindVisible(emptyRef, (state) => state.trial === undefined);
    this.b.bindVisible(activityRef, (state) => state.trial !== undefined);
    this.b.bindVisible(
      revealRef,
      (state) => state.trial?.phase === "presenting",
    );
    this.b.bindVisible(nextRef, (state) => state.trial?.phase === "revealing");
    this.b.bindSlot(contextRef, (state) =>
      show(
        PlayButtonView,
        playButtonState(
          ctx,
          "trial:context",
          "key",
          "play key",
          "key",
          "compact",
          state.trial !== undefined,
        ),
        {},
        () => dispatch({ type: "PLAY_CONTEXT" }),
      ),
    );
    this.b.bindSlot(droneRef, (state) =>
      show(
        PlayButtonView,
        playButtonState(
          ctx,
          "trial:drone",
          state.droneOn ? "drone on" : "drone off",
          "toggle tonic drone",
          "drone",
          "compact",
          state.trial !== undefined,
          state.droneOn,
        ),
        {},
        () => dispatch({ type: "TOGGLE_DRONE" }),
      ),
    );
    this.b.bindSlot(melodyRef, (state) =>
      show(
        PlayButtonView,
        playButtonState(
          ctx,
          "tonic:melody",
          "repeat melody",
          "play melody fragment",
          "play",
          "trial",
          state.trial !== undefined,
        ),
        {},
        () => dispatch({ type: "REPEAT" }),
      ),
    );
    this.b.bindSlot(answerRef, (state) =>
      show(
        PlayButtonView,
        playButtonState(
          ctx,
          "tonic:answer",
          "tonic",
          "play tonic answer",
          "play",
          "trial",
          state.trial?.phase === "revealing",
        ),
        {},
        () => dispatch({ type: "PLAY_ANSWER" }),
      ),
    );
  }

  sync(state: SingTonicState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

type SituationChoiceState = {
  situation: SituationDefinition;
  selected: boolean;
};

type SituationChoiceMsg = {
  type: "TOGGLE";
  situationId: SituationDefinition["id"];
};

class SituationChoiceView
  implements View<SituationChoiceState, SituationChoiceMsg>
{
  container: HTMLElement;
  private readonly b: Binder<SituationChoiceState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: SituationChoiceMsg) => void,
    initial: SituationChoiceState,
  ) {
    const buttonRef = ref("situation");
    const labelRef = ref("situationLabel");
    const descriptionRef = ref("situationDescription");
    this.container = container;
    container.innerHTML = sanitize`
      <button type="button" data-ref="${buttonRef}">
        <span class="${situationLabelClass}" data-ref="${labelRef}"></span>
        <span class="${situationDescriptionClass}" data-ref="${descriptionRef}"></span>
      </button>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "TOGGLE", situationId: initial.situation.id }),
    );
    this.b.bindText(labelRef, (state) => state.situation.label);
    this.b.bindText(descriptionRef, (state) => state.situation.description);
    this.b.bindClass(buttonRef, (state) =>
      [situationButtonClass, state.selected ? selectedClass : ""]
        .filter(Boolean)
        .join(" "),
    );
    this.b.bindAttr(
      buttonRef,
      "data-situation-id",
      (state) => state.situation.id,
    );
    this.b.bindAttr(buttonRef, "aria-pressed", (state) =>
      String(state.selected),
    );
  }

  sync(state: SituationChoiceState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

function hasEligibleSelection(
  state: IdentifyNotesState,
  ctx: Pick<TonicPracticeCtx, "melodies">,
): boolean {
  return (
    selectIdentifyNotesPhrase(
      ctx.melodies,
      state.selectedSituationIds,
      undefined,
      () => 0,
    ) !== undefined
  );
}

function vocabularyLabel(state: IdentifyNotesState): string {
  const degrees = promptDegreesForSituations(state.selectedSituationIds);
  return ["?", ...degrees.map(String), "other"].join(" · ");
}

type AnswerChoiceState = {
  answer: MelodySlotAnswer;
  label: string;
  selected: boolean;
};

type AnswerChoiceMsg = { type: "CHOOSE"; answer: MelodySlotAnswer };

class AnswerChoiceView implements View<AnswerChoiceState, AnswerChoiceMsg> {
  container: HTMLElement;
  private readonly b: Binder<AnswerChoiceState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: AnswerChoiceMsg) => void,
    initial: AnswerChoiceState,
  ) {
    const buttonRef = ref("answerChoice");
    const labelRef = ref("answerChoiceLabel");
    this.container = container;
    container.innerHTML = sanitize`<button type="button" data-ref="${buttonRef}"><span data-ref="${labelRef}"></span></button>`;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "CHOOSE", answer: initial.answer }),
    );
    this.b.bindText(labelRef, (state) => state.label);
    this.b.bindClass(buttonRef, (state) =>
      state.selected ? selectedClass : "",
    );
    this.b.bindAttr(buttonRef, "aria-pressed", (state) =>
      String(state.selected),
    );
  }

  sync(state: AnswerChoiceState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

function answerChoices(trial: IdentifyNotesTrial): AnswerChoiceState[] {
  const selected =
    trial.selectedSlotIndex === undefined
      ? undefined
      : trial.answers[trial.selectedSlotIndex];
  return [
    { answer: undefined, label: "?", selected: selected === undefined },
    ...trial.promptDegrees.map((degree) => ({
      answer: degree,
      label: String(degree),
      selected: selected === degree,
    })),
    {
      answer: "other" as const,
      label: "other",
      selected: selected === "other",
    },
  ];
}

export class IdentifyNotesView
  implements View<IdentifyNotesState, IdentifyNotesMsg, TonicPracticeCtx>
{
  container: HTMLElement;
  private readonly b: Binder<IdentifyNotesState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: IdentifyNotesMsg) => void,
    initial: IdentifyNotesState,
    ctx: TonicPracticeCtx,
  ) {
    const selectorRef = ref("selector");
    const selectorInstructionRef = ref("selectorInstruction");
    const practiceInstructionRef = ref("practiceInstruction");
    const situationsRef = ref("situations");
    const vocabularyRef = ref("vocabulary");
    const selectorStatusRef = ref("selectorStatus");
    const beginRef = ref("begin");
    const emptyRef = ref("empty");
    const activityRef = ref("activity");
    const contextRef = ref("context");
    const droneRef = ref("drone");
    const playPauseRef = ref("playPause");
    const restartRef = ref("restart");
    const measuresRef = ref("measures");
    const previousRef = ref("previousBars");
    const rangeRef = ref("barRange");
    const nextBarsRef = ref("nextBars");
    const paletteRef = ref("palette");
    const revealRef = ref("reveal");
    const nextRef = ref("next");
    const changeSituationsRef = ref("changeSituations");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${pageClass}">
        <h1 class="${headingClass}">Identify the notes</h1>
        <p class="${instructionClass}" data-ref="${selectorInstructionRef}">Choose the musical situations you want to practice.</p>
        <p class="${instructionClass}" data-ref="${practiceInstructionRef}">Tap notes in the top row to hear them. Choose each note’s scale degree below; unmarked notes count as other.</p>
        <div class="${selectorClass}" data-ref="${selectorRef}">
          <div class="${situationListClass}" data-ref="${situationsRef}" aria-label="musical situations"></div>
          <p class="${vocabularyClass}"><strong>Answer choices:</strong> <span data-ref="${vocabularyRef}"></span></p>
          <p class="${selectorStatusClass}" data-ref="${selectorStatusRef}"></p>
          <div class="${actionRowClass}">
            <button type="button" class="${primaryClass}" data-ref="${beginRef}">start</button>
          </div>
        </div>
        <p class="${emptyClass}" data-ref="${emptyRef}">No eligible melody fragments are available.</p>
        <div data-ref="${activityRef}">
          <div class="${supportClass}">
            <div data-ref="${contextRef}"></div>
            <div data-ref="${droneRef}"></div>
          </div>
          <div class="${playRowClass}">
            <div data-ref="${playPauseRef}"></div>
            <div data-ref="${restartRef}"></div>
          </div>
          <div class="${viewportClass}" data-ref="${measuresRef}"></div>
          <div class="${viewportControlsClass}">
            <button type="button" data-ref="${previousRef}">${arrowUpIcon()} previous bar</button>
            <span data-ref="${rangeRef}"></span>
            <button type="button" data-ref="${nextBarsRef}">next bar ${arrowDownIcon()}</button>
          </div>
          <div class="${paletteClass}" data-ref="${paletteRef}" aria-label="answer choices"></div>
          <div class="${actionRowClass}">
            <button type="button" data-ref="${changeSituationsRef}">change situations</button>
            <button type="button" class="${primaryClass}" data-ref="${revealRef}">reveal answers</button>
            <button type="button" class="${primaryClass}" data-ref="${nextRef}">next melody</button>
          </div>
        </div>
      </section>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(beginRef), () => dispatch({ type: "BEGIN" }));
    onPress(this.b.ref(changeSituationsRef), () =>
      dispatch({ type: "CHANGE_SITUATIONS" }),
    );
    onPress(this.b.ref(previousRef), () =>
      dispatch({ type: "SCROLL", delta: -1 }),
    );
    onPress(this.b.ref(nextBarsRef), () =>
      dispatch({ type: "SCROLL", delta: 1 }),
    );
    onPress(this.b.ref(revealRef), () => dispatch({ type: "REVEAL" }));
    onPress(this.b.ref(nextRef), () => dispatch({ type: "NEXT" }));

    this.b.bindList(situationsRef, "div", (state) =>
      SITUATIONS.map((situation) =>
        showKeyed(
          situation.id,
          SituationChoiceView,
          {
            situation,
            selected: state.selectedSituationIds.includes(situation.id),
          },
          {},
          (msg) =>
            dispatch({
              type: "TOGGLE_SITUATION",
              situationId: msg.situationId,
            }),
        ),
      ),
    );
    this.b.bindText(vocabularyRef, vocabularyLabel);
    this.b.bindText(selectorStatusRef, (state) =>
      state.selectedSituationIds.length === 0
        ? "Select at least one situation to start."
        : "No eligible melody fragments match this selection.",
    );
    this.b.bindVisible(
      selectorStatusRef,
      (state) => !hasEligibleSelection(state, ctx),
    );
    this.b.bindDisabled(beginRef, (state) => !hasEligibleSelection(state, ctx));
    this.b.bindVisible(selectorRef, (state) => state.screen === "situations");
    this.b.bindVisible(
      selectorInstructionRef,
      (state) => state.screen === "situations",
    );
    this.b.bindVisible(
      practiceInstructionRef,
      (state) => state.screen === "practice",
    );
    this.b.bindVisible(
      emptyRef,
      (state) => state.screen === "practice" && state.trial === undefined,
    );
    this.b.bindVisible(
      activityRef,
      (state) => state.screen === "practice" && state.trial !== undefined,
    );
    this.b.bindSlot(contextRef, (state) =>
      show(
        PlayButtonView,
        playButtonState(
          ctx,
          "trial:context",
          "key",
          "play key",
          "key",
          "compact",
          state.trial !== undefined,
        ),
        {},
        () => dispatch({ type: "PLAY_CONTEXT" }),
      ),
    );
    this.b.bindSlot(droneRef, (state) =>
      show(
        PlayButtonView,
        playButtonState(
          ctx,
          "trial:drone",
          state.droneOn ? "drone on" : "drone off",
          "toggle tonic drone",
          "drone",
          "compact",
          state.trial !== undefined,
          state.droneOn,
        ),
        {},
        () => dispatch({ type: "TOGGLE_DRONE" }),
      ),
    );
    this.b.bindSlot(playPauseRef, (state) => {
      const playback = melodyPlayback(ctx);
      const playing = playback.status === "playing";
      return show(
        PlayButtonView,
        {
          id: "tonic:melody",
          label: playing ? "pause" : "play",
          ariaLabel: playing ? "pause melody" : "play melody from cursor",
          icon: playing ? "pause" : "play",
          variant: "trial",
          visible: state.trial !== undefined,
          playing,
          durationMs: undefined,
          animated: false,
        },
        {},
        () => dispatch({ type: "PLAY_PAUSE" }),
      );
    });
    this.b.bindSlot(restartRef, (state) =>
      show(
        PlayButtonView,
        {
          id: "tonic:melody-restart",
          label: "from beginning",
          ariaLabel: "play melody from beginning",
          icon: "restart",
          variant: "trial",
          visible: state.trial !== undefined,
          playing: false,
          durationMs: undefined,
          animated: false,
        },
        {},
        () => dispatch({ type: "PLAY_FROM_BEGINNING" }),
      ),
    );
    this.b.bindList(measuresRef, "div", (state) => {
      const trial = state.trial;
      if (!trial) return [];
      const melodyEvents = voice(trial.phrase, "melody")?.events ?? [];
      const first = trial.firstVisibleMeasureIndex;
      return trial.phrase.measures
        .slice(first, first + VISIBLE_MEASURE_COUNT)
        .map((measure, offset) => {
          const measureIndex = first + offset;
          const events = melodyEvents.flatMap((event, eventIndex) =>
            event.onsetTicks >= measure.startTicks &&
            event.onsetTicks < measure.endTicks
              ? [{ event, eventIndex }]
              : [],
          );
          return showKeyed(
            `${trial.phrase.id}:${measureIndex}`,
            MelodyMeasureView,
            { measure, measureIndex, events, trial },
            {},
            (msg) => {
              dispatch({ type: "PLAY_EVENT", eventIndex: msg.eventIndex });
              dispatch({ type: "SELECT_SLOT", eventIndex: msg.eventIndex });
            },
          );
        });
    });
    this.b.bindList(paletteRef, "span", (state) => {
      const trial = state.trial;
      if (
        trial?.phase !== "answering" ||
        trial.selectedSlotIndex === undefined
      ) {
        return [];
      }
      return answerChoices(trial).map((choice) =>
        showKeyed(
          choice.answer === undefined ? "unknown" : String(choice.answer),
          AnswerChoiceView,
          choice,
          {},
          (msg) => dispatch({ type: "SET_ANSWER", answer: msg.answer }),
        ),
      );
    });
    this.b.bindText(rangeRef, (state) => {
      const trial = state.trial;
      if (!trial) return "";
      const first = trial.firstVisibleMeasureIndex + 1;
      const last = Math.min(
        trial.phrase.measures.length,
        first + VISIBLE_MEASURE_COUNT - 1,
      );
      return `bars ${first}–${last} of ${trial.phrase.measures.length}`;
    });
    this.b.bindDisabled(
      previousRef,
      (state) => !state.trial || state.trial.firstVisibleMeasureIndex === 0,
    );
    this.b.bindDisabled(
      nextBarsRef,
      (state) =>
        !state.trial ||
        state.trial.firstVisibleMeasureIndex >=
          Math.max(
            0,
            state.trial.phrase.measures.length - VISIBLE_MEASURE_COUNT,
          ),
    );
    this.b.bindVisible(
      rangeRef,
      (state) =>
        (state.trial?.phrase.measures.length ?? 0) > VISIBLE_MEASURE_COUNT,
    );
    this.b.bindVisible(
      previousRef,
      (state) =>
        (state.trial?.phrase.measures.length ?? 0) > VISIBLE_MEASURE_COUNT,
    );
    this.b.bindVisible(
      nextBarsRef,
      (state) =>
        (state.trial?.phrase.measures.length ?? 0) > VISIBLE_MEASURE_COUNT,
    );
    this.b.bindVisible(
      revealRef,
      (state) => state.trial?.phase === "answering",
    );
    this.b.bindVisible(nextRef, (state) => state.trial?.phase === "revealed");
  }

  sync(state: IdentifyNotesState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

export { IdentifyNotesView as IdentifyTonicNotesView };
