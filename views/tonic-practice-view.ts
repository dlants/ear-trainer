import type { PlayState } from "../audio/play-controller.ts";
import { arrowDownIcon, arrowUpIcon, checkIcon, xIcon } from "../icons.ts";
import type { Cell, CellId, Measure } from "../music/melody.ts";
import type { Degree, Note } from "../music/note.ts";
import { SITUATIONS, type SituationDefinition } from "../music/situations.ts";
import {
  Binder,
  cls,
  mountStyle,
  onActivate,
  onPress,
  ref,
  sanitize,
  show,
  showKeyed,
  type View,
} from "../vamp.ts";
import { PlayButtonView } from "./play-button.ts";
import {
  type CellAnswer,
  IDENTIFY_NOTE_DEGREES,
  type IdentifyNotesCtx,
  type IdentifyNotesMsg,
  type IdentifyNotesState,
  type IdentifyNotesTrial,
  VISIBLE_MEASURE_COUNT,
} from "./tonic-practice.ts";

export type SlotResult = "correct" | "incorrect";

function actualAnswer(
  note: Note,
  promptDegrees: Degree[],
): Exclude<CellAnswer, undefined | "skip"> {
  return note.alteration === 0 && promptDegrees.includes(note.degree)
    ? note.degree
    : "other";
}

export function slotResult(
  note: Note,
  promptDegrees: Degree[],
  answer: CellAnswer,
): SlotResult {
  return (answer ?? "other") === actualAnswer(note, promptDegrees)
    ? "correct"
    : "incorrect";
}

function guessLabel(answer: CellAnswer): string {
  if (answer === undefined) return "";
  if (answer === "skip") return "_";
  return answer === "other" ? "other" : String(answer);
}

function noteLabel(note: Note): string {
  const accidental =
    note.alteration === 1 ? "♯" : note.alteration === -1 ? "♭" : "";
  const octave = (note.octave > 0 ? "↑" : "↓").repeat(Math.abs(note.octave));
  return `${accidental}${note.degree}${octave}`;
}

function playbackFor(
  ctx: Pick<IdentifyNotesCtx, "play">,
  id: string,
): PlayState {
  const playback = ctx.play.getState();
  return playback.status === "playing" && playback.buttonId === id
    ? playback
    : { status: "idle" };
}

function melodyPlayback(ctx: Pick<IdentifyNotesCtx, "play">): PlayState {
  const playback = ctx.play.getState();
  return playback.status === "playing" &&
    (playback.buttonId === "tonic:melody" ||
      playback.buttonId === "tonic:melody-restart")
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
const sourceClass = cls("tonic-source");
const measureClass = cls("tonic-measure");
const beatLayoutClass = cls("tonic-beat-layout");
const beatCellClass = cls("tonic-beat-cell");
const toneButtonClass = cls("tonic-tone-button");
const guessLabelClass = cls("tonic-guess-label");
const guessResultIconClass = cls("tonic-guess-result-icon");
const cursorClass = cls("tonic-slot-cursor");
const selectedClass = cls("tonic-slot-selected");
const correctClass = cls("tonic-slot-correct");
const incorrectClass = cls("tonic-slot-incorrect");
const paletteClass = cls("tonic-palette");
const emptyClass = cls("tonic-empty");
const activityClass = cls("tonic-activity");
const selectorClass = cls("identify-selector");
const situationListClass = cls("identify-situation-list");
const situationGroupClass = cls("identify-situation-group");
const situationButtonClass = cls("identify-situation-button");
const situationLabelClass = cls("identify-situation-label");
const situationDescriptionClass = cls("identify-situation-description");
const vocabularyClass = cls("identify-vocabulary");
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
.${pageClass} .${supportClass} { justify-content: center; gap: 6px; }
.${pageClass} .${supportClass} > * { min-width: 0; display: flex; }
.${pageClass} .${supportClass} button { min-width: 0; padding-inline: 10px; font-size: 15px; white-space: nowrap; }
.${pageClass} .${playRowClass} > * { flex: 1; display: flex; }
.${pageClass} .${actionRowClass} { justify-content: flex-end; }
.${pageClass} .${actionRowClass} > * { display: contents; }
.${pageClass} .${actionRowClass} button { flex: 0 1 auto; width: auto; min-width: calc(50% - 5px); }
.${pageClass} .${primaryClass} {
  flex: 1;
  min-height: 56px;
  padding: 8px 12px;
  border-radius: var(--radius-control);
  font-size: 19px;
  font-weight: 700;
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
  border: 2px solid var(--color-selected-border);
  background: var(--color-selected-surface);
  color: var(--color-text);
}
.${pageClass} .${situationGroupClass} {
  margin: 0;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}
.${pageClass} .${situationLabelClass} { font-weight: 750; }
.${pageClass} .${situationDescriptionClass} { color: var(--color-text-muted); line-height: 1.35; }
.${pageClass} .${vocabularyClass} { margin: 0; line-height: 1.4; }
.${pageClass} .${sourceClass} { margin: 0; text-align: center; color: var(--color-text-muted); font-weight: 700; }
.${pageClass} .${activityClass} { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.${pageClass} .${activityClass} .${viewportClass} { margin-top: 8px; }
.${pageClass} .${activityClass} .${actionRowClass} { margin-top: auto; }
.${pageClass} .${viewportClass} { display: grid; gap: 8px; }
.${pageClass} .${measureClass} { display: block; }
.${pageClass} .${beatLayoutClass} {
  position: relative;
  height: 76px;
  overflow: hidden;
}
.${pageClass} .${beatCellClass} {
  position: absolute;
  top: 2px;
  height: 72px;
  min-width: 30px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: 34px 34px;
  gap: 4px;
  align-items: stretch;
}
.${pageClass} .${toneButtonClass} {
  min-width: 0;
  padding: 0 4px;
  border-radius: var(--radius-control);
  font-weight: 750;
  overflow: hidden;
  white-space: nowrap;
}
.${pageClass} .${guessLabelClass} {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  padding: 0 4px;
  box-sizing: border-box;
  font-weight: 750;
  overflow: hidden;
  white-space: nowrap;
}
.${pageClass} .${guessResultIconClass} { display: inline-flex; flex: 0 0 auto; font-size: 0.9em; }
.${pageClass} .${cursorClass} { outline: 3px solid var(--color-unsure-border); outline-offset: -3px; }
.${pageClass} .${selectedClass} { border: 2px solid var(--color-selected-border); background: var(--color-selected-surface); color: var(--color-text); }
.${pageClass} .${correctClass} { color: var(--color-correct); }
.${pageClass} .${incorrectClass} { color: var(--color-incorrect); }
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
}
`);

type SlotState = {
  cell: Cell;
  cellIndex: number;
  measure: Measure;
  promptDegrees: Degree[];
  answer: CellAnswer;
  selected: boolean;
  cursor: boolean;
  revealed: boolean;
};

type SlotMsg = { type: "ACTIVATE"; cellIndex: number; cellId: CellId };

function slotStyle(state: SlotState): Record<string, string> {
  const duration = state.measure.endTicks - state.measure.startTicks;
  const leftPercent =
    ((state.cell.onsetTicks - state.measure.startTicks) / duration) * 100;
  const widthPercent = (state.cell.durationTicks / duration) * 100;
  return {
    left: `calc(${leftPercent}% + 2px)`,
    width: `calc(${widthPercent}% - 4px)`,
  };
}

function revealedResult(state: SlotState): SlotResult | undefined {
  if (!state.revealed || state.answer === undefined || state.answer === "skip")
    return undefined;
  return slotResult(state.cell.note, state.promptDegrees, state.answer);
}

function resultClass(state: SlotState): string {
  const result = revealedResult(state);
  return result === "correct"
    ? correctClass
    : result === "incorrect"
      ? incorrectClass
      : "";
}

class BeatSlotView implements View<SlotState, SlotMsg> {
  container: HTMLElement;
  private readonly b: Binder<SlotState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: SlotMsg) => void,
    initial: SlotState,
  ) {
    const cellRef = ref("beatCell");
    const buttonRef = ref("toneSlot");
    const toneTextRef = ref("toneText");
    const guessRef = ref("guess");
    const guessTextRef = ref("guessText");
    const correctIconRef = ref("correctIcon");
    const incorrectIconRef = ref("incorrectIcon");
    this.container = container;
    container.innerHTML = sanitize`
      <div data-ref="${cellRef}">
        <button type="button" data-ref="${buttonRef}"><span data-ref="${toneTextRef}"></span></button>
        <span data-ref="${guessRef}"><span data-ref="${guessTextRef}"></span><span class="${guessResultIconClass}" data-ref="${correctIconRef}" data-result-icon="correct">${checkIcon()}</span><span class="${guessResultIconClass}" data-ref="${incorrectIconRef}" data-result-icon="incorrect">${xIcon()}</span></span>
      </div>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({
        type: "ACTIVATE",
        cellIndex: initial.cellIndex,
        cellId: initial.cell.id,
      }),
    );
    this.b.bindStyle(cellRef, slotStyle);
    this.b.bindClass(cellRef, () => beatCellClass);
    this.b.bindClass(buttonRef, (state) =>
      [
        toneButtonClass,
        state.cursor ? cursorClass : "",
        state.selected ? selectedClass : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
    this.b.bindClass(guessRef, (state) =>
      [guessLabelClass, resultClass(state)].filter(Boolean).join(" "),
    );
    this.b.bindText(toneTextRef, (state) =>
      state.revealed ? noteLabel(state.cell.note) : "?",
    );
    this.b.bindText(guessTextRef, (state) => guessLabel(state.answer));
    this.b.bindVisible(
      correctIconRef,
      (state) => revealedResult(state) === "correct",
    );
    this.b.bindVisible(
      incorrectIconRef,
      (state) => revealedResult(state) === "incorrect",
    );
    this.b.bindAttr(buttonRef, "data-event-index", (state) =>
      String(state.cellIndex),
    );
    this.b.bindAttr(buttonRef, "data-row", () => "tone");
    this.b.bindAttr(guessRef, "data-event-index", (state) =>
      String(state.cellIndex),
    );
    this.b.bindAttr(guessRef, "data-row", () => "guess");
    this.b.bindAttr(cellRef, "data-cell-id", (state) => state.cell.id);
    this.b.bindAttr(cellRef, "data-beat", (state) => String(state.cellIndex));
    this.b.bindAttr(cellRef, "data-selected", (state) =>
      state.selected ? "true" : undefined,
    );
    this.b.bindAttr(guessRef, "data-result", (state) => revealedResult(state));
    this.b.bindAttr(buttonRef, "aria-current", (state) =>
      state.cursor ? "true" : undefined,
    );
    this.b.bindAttr(buttonRef, "aria-label", (state) =>
      state.revealed
        ? `melody note ${state.cellIndex + 1}: ${noteLabel(state.cell.note)}`
        : `masked melody note ${state.cellIndex + 1}`,
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

type MeasureState = {
  measure: Measure;
  measureIndex: number;
  cells: { cell: Cell; cellIndex: number }[];
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
    const beatsRef = ref("beats");
    this.container = container;
    container.innerHTML = sanitize`
      <section class="${measureClass}" aria-label="bar ${initial.measureIndex + 1}">
        <div class="${beatLayoutClass}" data-ref="${beatsRef}"></div>
      </section>
    `;
    this.b = new Binder(container, initial);
    this.b.bindContainerAttr("data-measure-index", (state) =>
      String(state.measureIndex),
    );
    this.b.bindList(beatsRef, "div", (state) =>
      state.cells.map(({ cell, cellIndex }) =>
        showKeyed(
          cell.id,
          BeatSlotView,
          {
            cell,
            cellIndex,
            measure: state.measure,
            promptDegrees: state.trial.promptDegrees,
            answer: state.trial.cellAnswers[cell.id],
            selected:
              state.trial.selection?.kind === "cell" &&
              state.trial.selection.cellId === cell.id,
            cursor:
              state.trial.onsets[state.trial.cursorOnsetIndex]?.onsetTicks ===
              cell.onsetTicks,
            revealed: state.trial.phase === "revealed",
          },
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
  ctx: Pick<IdentifyNotesCtx, "play">,
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

function vocabularyLabel(): string {
  return ["?", ...IDENTIFY_NOTE_DEGREES.map(String), "other"].join(" · ");
}

type AnswerChoiceState = {
  answer: CellAnswer;
  label: string;
  selected: boolean;
};

type AnswerChoiceMsg = { type: "CHOOSE"; answer: CellAnswer };

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
    trial.selection?.kind === "cell"
      ? trial.cellAnswers[trial.selection.cellId]
      : undefined;
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
  implements View<IdentifyNotesState, IdentifyNotesMsg, IdentifyNotesCtx>
{
  container: HTMLElement;
  private readonly b: Binder<IdentifyNotesState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: IdentifyNotesMsg) => void,
    initial: IdentifyNotesState,
    ctx: IdentifyNotesCtx,
  ) {
    const selectorRef = ref("selector");
    const selectorInstructionRef = ref("selectorInstruction");
    const practiceInstructionRef = ref("practiceInstruction");
    const melodicSituationsRef = ref("melodicSituations");
    const harmonySituationsRef = ref("harmonySituations");
    const progressionSituationsRef = ref("progressionSituations");
    const vocabularyRef = ref("vocabulary");
    const beginRef = ref("begin");
    const emptyRef = ref("empty");
    const activityRef = ref("activity");
    const sourceRef = ref("source");
    const contextRef = ref("context");
    const changeKeyRef = ref("changeKey");
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
        <p class="${instructionClass}" data-ref="${practiceInstructionRef}">Tap notes in the top row to hear them. Choose each note’s scale degree below; leave notes blank if you’re unsure.</p>
        <div class="${selectorClass}" data-ref="${selectorRef}">
          <h2 class="${situationGroupClass}">Melodic</h2>
          <div class="${situationListClass}" data-ref="${melodicSituationsRef}" aria-label="melodic situations"></div>
          <h2 class="${situationGroupClass}">Harmony</h2>
          <div class="${situationListClass}" data-ref="${harmonySituationsRef}" aria-label="harmony situations"></div>
          <h2 class="${situationGroupClass}">Progression</h2>
          <div class="${situationListClass}" data-ref="${progressionSituationsRef}" aria-label="progression situations"></div>
          <p class="${vocabularyClass}"><strong>Answer choices:</strong> <span data-ref="${vocabularyRef}"></span></p>
          <div class="${actionRowClass}">
            <button type="button" class="${primaryClass}" data-ref="${beginRef}">back to practice</button>
          </div>
        </div>
        <p class="${emptyClass}" data-ref="${emptyRef}">No eligible melody fragments are available.</p>
        <div class="${activityClass}" data-ref="${activityRef}">
          <div class="${supportClass}">
            <div data-ref="${contextRef}"></div>
            <div data-ref="${changeKeyRef}"></div>
            <div data-ref="${droneRef}"></div>
            <div data-ref="${changeSituationsRef}"></div>
          </div>
          <p class="${sourceClass}" data-ref="${sourceRef}"></p>
          <div class="${playRowClass}">
            <div data-ref="${restartRef}"></div>
            <div data-ref="${playPauseRef}"></div>
          </div>
          <div class="${viewportClass}" data-ref="${measuresRef}"></div>
          <div class="${viewportControlsClass}">
            <button type="button" data-ref="${previousRef}">${arrowUpIcon()} previous bar</button>
            <span data-ref="${rangeRef}"></span>
            <button type="button" data-ref="${nextBarsRef}">next bar ${arrowDownIcon()}</button>
          </div>
          <div class="${paletteClass}" data-ref="${paletteRef}" aria-label="answer choices"></div>
          <div class="${actionRowClass}">
            <div data-ref="${revealRef}"></div>
            <div data-ref="${nextRef}"></div>
          </div>
        </div>
      </section>
    `;
    this.b = new Binder(container, initial);
    onActivate(this.b.ref(beginRef), () => dispatch({ type: "BEGIN" }));
    onPress(this.b.ref(previousRef), () =>
      dispatch({ type: "SCROLL", delta: -1 }),
    );
    onPress(this.b.ref(nextBarsRef), () =>
      dispatch({ type: "SCROLL", delta: 1 }),
    );

    for (const [listRef, group] of [
      [melodicSituationsRef, "melodic"],
      [harmonySituationsRef, "harmony"],
      [progressionSituationsRef, "progression"],
    ] as const) {
      this.b.bindList(listRef, "div", (state) =>
        SITUATIONS.filter((situation) => situation.group === group).map(
          (situation) =>
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
    }
    this.b.bindText(vocabularyRef, vocabularyLabel);
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
    this.b.bindSlot(changeKeyRef, (state) =>
      show(
        PlayButtonView,
        {
          id: "identify:change-key",
          label: "change key",
          ariaLabel: "change key",
          icon: "shuffle",
          variant: "compact",
          visible: true,
          disabled: state.trial === undefined,
          playing: false,
          durationMs: undefined,
          animated: false,
        },
        {},
        () => dispatch({ type: "CHANGE_KEY" }),
      ),
    );
    this.b.bindSlot(changeSituationsRef, (state) =>
      show(
        PlayButtonView,
        {
          id: "identify:situations",
          label: `situations (${state.selectedSituationIds.length})`,
          ariaLabel: "change practiced situations",
          icon: "gear",
          variant: "compact",
          visible: true,
          playing: false,
          durationMs: undefined,
          animated: false,
        },
        {},
        () => dispatch({ type: "CHANGE_SITUATIONS" }),
      ),
    );
    this.b.bindText(sourceRef, (state) => {
      const melody = ctx.melodies.find(
        (candidate) => candidate.id === state.trial?.phrase.melodyId,
      );
      return melody ? `from ${melody.title}` : "";
    });
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
      const first = trial.firstVisibleMeasureIndex;
      return trial.phrase.measures
        .slice(first, first + VISIBLE_MEASURE_COUNT)
        .map((measure, offset) => {
          const measureIndex = first + offset;
          const measureCells = trial.cells.flatMap((cell, cellIndex) =>
            cell.onsetTicks >= measure.startTicks &&
            cell.onsetTicks < measure.endTicks
              ? [{ cell, cellIndex }]
              : [],
          );
          return showKeyed(
            `${trial.phrase.id}:${measureIndex}`,
            MelodyMeasureView,
            { measure, measureIndex, cells: measureCells, trial },
            {},
            (msg) => {
              dispatch({ type: "PLAY_CELL", cellId: msg.cellId });
              dispatch({ type: "SELECT_CELL", cellId: msg.cellId });
            },
          );
        });
    });
    this.b.bindList(paletteRef, "span", (state) => {
      const trial = state.trial;
      if (trial?.phase !== "answering" || trial.selection?.kind !== "cell") {
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
    this.b.bindSlot(revealRef, (state) =>
      show(
        PlayButtonView,
        {
          id: "identify:reveal",
          label: "reveal answers",
          ariaLabel: "reveal answers",
          icon: "eye",
          variant: "trial",
          visible: state.trial?.phase === "answering",
          playing: false,
          durationMs: undefined,
          animated: false,
        },
        {},
        () => dispatch({ type: "REVEAL" }),
      ),
    );
    this.b.bindSlot(nextRef, (state) =>
      show(
        PlayButtonView,
        {
          id: "identify:next",
          label: "next melody",
          ariaLabel: "next melody",
          icon: "next",
          variant: "trial",
          visible: state.trial?.phase === "revealed",
          playing: false,
          durationMs: undefined,
          animated: false,
        },
        {},
        () => dispatch({ type: "NEXT" }),
      ),
    );
  }

  sync(state: IdentifyNotesState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
