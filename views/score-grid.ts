import { checkIcon, chordIcon, noteIcon, playIcon, xIcon } from "../icons.ts";
import type {
  Cell,
  CellId,
  Chord,
  HarmonyRegion,
  Measure,
  Onset,
  RegionId,
  Score,
} from "../music/melody.ts";
import { cellsSoundingAt } from "../music/melody.ts";
import type { Degree, Note } from "../music/note.ts";
import {
  Binder,
  cls,
  mountStyle,
  onPress,
  ref,
  sanitize,
  showKeyed,
  type View,
} from "../vamp.ts";
import type { CellAnswer, ChordAnswer, Selection } from "./tonic-practice.ts";

export type CellResult = "correct" | "incorrect" | "unanswered";

function actualAnswer(
  note: Note,
  promptDegrees: Degree[],
): Exclude<CellAnswer, undefined | "skip"> {
  return note.alteration === 0 && promptDegrees.includes(note.degree)
    ? note.degree
    : "other";
}

export function cellResult(
  note: Note,
  promptDegrees: Degree[],
  answer: CellAnswer,
): CellResult {
  if (answer === undefined || answer === "skip") return "unanswered";
  return answer === actualAnswer(note, promptDegrees) ? "correct" : "incorrect";
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

/** The diatonic triad built on `degree`, as a roman numeral. */
export function diatonicRoman(degree: Degree): string {
  const numeral = ROMAN_NUMERALS[degree - 1] ?? String(degree);
  if (degree === 7) return `${numeral.toLowerCase()}°`;
  return degree === 2 || degree === 3 || degree === 6
    ? numeral.toLowerCase()
    : numeral;
}

function chordLabel(chord: Chord): string {
  const accidental =
    chord.alteration === 1 ? "♯" : chord.alteration === -1 ? "♭" : "";
  const numeral = ROMAN_NUMERALS[chord.root - 1] ?? String(chord.root);
  const cased =
    chord.quality === "minor" || chord.quality === "diminished"
      ? numeral.toLowerCase()
      : numeral;
  const suffix =
    chord.quality === "diminished"
      ? "°"
      : chord.quality === "augmented"
        ? "+"
        : "";
  return `${accidental}${cased}${suffix}${chord.seventh ? "7" : ""}`;
}

function chordAnswerLabel(answer: ChordAnswer): string {
  if (answer === undefined) return "?";
  if (answer === "skip") return "_";
  return answer === "other" ? "other" : diatonicRoman(answer);
}

function actualChordAnswer(
  chord: Chord,
  promptDegrees: Degree[],
): Exclude<ChordAnswer, undefined | "skip"> {
  return chord.alteration === 0 && promptDegrees.includes(chord.root)
    ? chord.root
    : "other";
}

export function chordResult(
  chord: Chord,
  promptDegrees: Degree[],
  answer: ChordAnswer,
): CellResult {
  if (answer === undefined || answer === "skip") return "unanswered";
  return answer === actualChordAnswer(chord, promptDegrees)
    ? "correct"
    : "incorrect";
}

function guessLabel(answer: CellAnswer): string {
  if (answer === undefined) return "?";
  if (answer === "skip") return "_";
  return answer === "other" ? "other" : String(answer);
}

function noteLabel(note: Note): string {
  const accidental =
    note.alteration === 1 ? "♯" : note.alteration === -1 ? "♭" : "";
  const octave = (note.octave > 0 ? "↑" : "↓").repeat(Math.abs(note.octave));
  return `${accidental}${note.degree}${octave}`;
}

export const scoreGridClass = cls("score-grid");
const measureClass = cls("score-measure");
const stackTrackClass = cls("score-stack-track");
const stackButtonClass = cls("score-stack-button");
const cellTrackClass = cls("score-cell-track");
const cellButtonClass = cls("score-cell-button");
const harmonyTrackClass = cls("score-harmony-track");
const harmonySegmentClass = cls("score-harmony-segment");
const trackIconClass = cls("score-track-icon");
const struckClass = cls("score-struck-guess");
const resultIconClass = cls("score-result-icon");
const cursorClass = cls("score-slot-cursor");
const selectedClass = cls("score-slot-selected");
const correctClass = cls("score-slot-correct");
const incorrectClass = cls("score-slot-incorrect");
mountStyle(`
.${scoreGridClass} { display: grid; gap: 8px; }
.${scoreGridClass} .${measureClass} { display: grid; grid-template-columns: 22px 1fr; gap: 4px; }
.${scoreGridClass} .${stackTrackClass},
.${scoreGridClass} .${cellTrackClass},
.${scoreGridClass} .${harmonyTrackClass} { grid-column: 2; }
.${scoreGridClass} .${stackTrackClass} { position: relative; height: 22px; }
.${scoreGridClass} .${stackButtonClass} {
  position: absolute;
  top: 0;
  height: 22px;
  min-width: 26px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: var(--radius-control);
  font-size: 12px;
}
.${scoreGridClass} .${cellTrackClass} { position: relative; overflow: hidden; }
.${scoreGridClass} .${cellButtonClass} {
  position: absolute;
  min-width: 26px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0 4px;
  border-radius: var(--radius-control);
  font-weight: 750;
  overflow: hidden;
  white-space: nowrap;
}
.${scoreGridClass} .${harmonyTrackClass} { position: relative; height: 28px; }
.${scoreGridClass} .${harmonySegmentClass} {
  position: absolute;
  top: 0;
  height: 28px;
  min-width: 26px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0 4px;
  border-radius: 0;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
}
.${scoreGridClass} .${trackIconClass} {
  grid-column: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--color-text-muted);
}
.${scoreGridClass} .${struckClass} { text-decoration: line-through; }
.${scoreGridClass} .${resultIconClass} { display: inline-flex; flex: 0 0 auto; font-size: 0.9em; }
.${scoreGridClass} .${cursorClass} { outline: 3px solid var(--color-unsure-border); outline-offset: -3px; }
.${scoreGridClass} .${selectedClass} { border: 2px solid var(--color-selected-border); background: var(--color-selected-surface); color: var(--color-text); }
.${scoreGridClass} .${correctClass} { color: var(--color-correct); }
.${scoreGridClass} .${incorrectClass} { color: var(--color-incorrect); }
`);

/** One display row of the cell track. */
const LANE_HEIGHT_PX = 34;
const LANE_GAP_PX = 4;

function spanStyle(
  measure: Measure,
  onsetTicks: number,
  durationTicks: number,
): Record<string, string> {
  const duration = measure.endTicks - measure.startTicks;
  const leftPercent = ((onsetTicks - measure.startTicks) / duration) * 100;
  const widthPercent = (durationTicks / duration) * 100;
  return {
    left: `calc(${leftPercent}% + 2px)`,
    width: `calc(${widthPercent}% - 4px)`,
  };
}

type CellState = {
  cell: Cell;
  cellIndex: number;
  measure: Measure;
  promptDegrees: Degree[];
  answer: CellAnswer;
  selected: boolean;
  cursor: boolean;
  revealed: boolean;
};

type CellMsg = { type: "CELL"; cellId: CellId };

function cellStyle(state: CellState): Record<string, string> {
  return {
    ...spanStyle(
      state.measure,
      state.cell.onsetTicks,
      state.cell.durationTicks,
    ),
    top: `${state.cell.laneIndex * LANE_HEIGHT_PX}px`,
    height: `${LANE_HEIGHT_PX - LANE_GAP_PX}px`,
  };
}

function revealedCellResult(state: CellState): CellResult | undefined {
  return state.revealed
    ? cellResult(state.cell.note, state.promptDegrees, state.answer)
    : undefined;
}

function resultClass(result: CellResult | undefined): string {
  return result === "correct"
    ? correctClass
    : result === "incorrect"
      ? incorrectClass
      : "";
}

class CellView implements View<CellState, CellMsg> {
  container: HTMLElement;
  private readonly b: Binder<CellState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: CellMsg) => void,
    initial: CellState,
  ) {
    const buttonRef = ref("cell");
    const wrongIconRef = ref("wrongIcon");
    const wrongGuessRef = ref("wrongGuess");
    const textRef = ref("cellText");
    const correctIconRef = ref("correctIcon");
    this.container = container;
    container.innerHTML = sanitize`
      <button type="button" data-ref="${buttonRef}"><span class="${resultIconClass}" data-ref="${wrongIconRef}" data-result-icon="incorrect">${xIcon()}</span><span class="${struckClass}" data-ref="${wrongGuessRef}" data-part="guess"></span><span data-ref="${textRef}" data-part="note"></span><span class="${resultIconClass}" data-ref="${correctIconRef}" data-result-icon="correct">${checkIcon()}</span></button>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "CELL", cellId: initial.cell.id }),
    );
    this.b.bindStyle(buttonRef, cellStyle);
    this.b.bindClass(buttonRef, (state) =>
      [
        cellButtonClass,
        state.cursor ? cursorClass : "",
        state.selected ? selectedClass : "",
        resultClass(revealedCellResult(state)),
      ]
        .filter(Boolean)
        .join(" "),
    );
    this.b.bindText(textRef, (state) =>
      state.revealed ? noteLabel(state.cell.note) : guessLabel(state.answer),
    );
    this.b.bindText(wrongGuessRef, (state) =>
      revealedCellResult(state) === "incorrect" ? guessLabel(state.answer) : "",
    );
    this.b.bindVisible(
      wrongGuessRef,
      (state) => revealedCellResult(state) === "incorrect",
    );
    this.b.bindVisible(
      wrongIconRef,
      (state) => revealedCellResult(state) === "incorrect",
    );
    this.b.bindVisible(
      correctIconRef,
      (state) => revealedCellResult(state) === "correct",
    );
    this.b.bindAttr(buttonRef, "data-cell-id", (state) => state.cell.id);
    this.b.bindAttr(buttonRef, "data-cell-index", (state) =>
      String(state.cellIndex),
    );
    this.b.bindAttr(buttonRef, "data-lane", (state) =>
      String(state.cell.laneIndex),
    );
    this.b.bindAttr(buttonRef, "data-selected", (state) =>
      state.selected ? "true" : undefined,
    );
    this.b.bindAttr(buttonRef, "data-result", revealedCellResult);
    this.b.bindAttr(buttonRef, "aria-current", (state) =>
      state.cursor ? "true" : undefined,
    );
    this.b.bindAttr(buttonRef, "aria-label", (state) =>
      state.revealed
        ? `melody note ${state.cellIndex + 1}: ${noteLabel(state.cell.note)}`
        : `masked melody note ${state.cellIndex + 1}`,
    );
  }

  sync(state: CellState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

type StackState = {
  onsetIndex: number;
  onsetTicks: number;
  measure: Measure;
  soundingCount: number;
};

type StackMsg = { type: "ONSET"; onsetIndex: number };

class StackButtonView implements View<StackState, StackMsg> {
  container: HTMLElement;
  private readonly b: Binder<StackState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: StackMsg) => void,
    initial: StackState,
  ) {
    const buttonRef = ref("stack");
    this.container = container;
    container.innerHTML = sanitize`
      <button type="button" class="${stackButtonClass}" data-ref="${buttonRef}">${playIcon()}</button>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "ONSET", onsetIndex: initial.onsetIndex }),
    );
    this.b.bindStyle(buttonRef, (state) => ({
      left: spanStyle(state.measure, state.onsetTicks, 0).left ?? "0",
    }));
    this.b.bindAttr(buttonRef, "data-onset-index", (state) =>
      String(state.onsetIndex),
    );
    this.b.bindAttr(
      buttonRef,
      "aria-label",
      (state) => `play the ${state.soundingCount} notes sounding together here`,
    );
  }

  sync(state: StackState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

type RegionState = {
  region: HarmonyRegion;
  measure: Measure;
  promptDegrees: Degree[];
  answer: ChordAnswer;
  answerable: boolean;
  selected: boolean;
  revealed: boolean;
};

type RegionMsg = { type: "REGION"; regionId: RegionId };

function revealedRegionResult(state: RegionState): CellResult | undefined {
  return state.revealed
    ? chordResult(state.region.chord, state.promptDegrees, state.answer)
    : undefined;
}

class HarmonyRegionView implements View<RegionState, RegionMsg> {
  container: HTMLElement;
  private readonly b: Binder<RegionState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: RegionMsg) => void,
    initial: RegionState,
  ) {
    const buttonRef = ref("region");
    const wrongIconRef = ref("regionWrongIcon");
    const wrongGuessRef = ref("regionWrongGuess");
    const textRef = ref("regionText");
    const correctIconRef = ref("regionCorrectIcon");
    this.container = container;
    container.innerHTML = sanitize`
      <button type="button" data-ref="${buttonRef}"><span class="${resultIconClass}" data-ref="${wrongIconRef}" data-result-icon="incorrect">${xIcon()}</span><span class="${struckClass}" data-ref="${wrongGuessRef}" data-part="guess"></span><span data-ref="${textRef}" data-part="chord"></span><span class="${resultIconClass}" data-ref="${correctIconRef}" data-result-icon="correct">${checkIcon()}</span></button>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "REGION", regionId: initial.region.id }),
    );
    this.b.bindStyle(buttonRef, (state) =>
      spanStyle(
        state.measure,
        Math.max(state.region.startTicks, state.measure.startTicks),
        Math.min(state.region.endTicks, state.measure.endTicks) -
          Math.max(state.region.startTicks, state.measure.startTicks),
      ),
    );
    this.b.bindClass(buttonRef, (state) =>
      [
        harmonySegmentClass,
        state.selected ? selectedClass : "",
        resultClass(revealedRegionResult(state)),
      ]
        .filter(Boolean)
        .join(" "),
    );
    this.b.bindText(textRef, (state) =>
      state.revealed
        ? chordLabel(state.region.chord)
        : state.answerable
          ? chordAnswerLabel(state.answer)
          : chordLabel(state.region.chord),
    );
    this.b.bindText(wrongGuessRef, (state) =>
      revealedRegionResult(state) === "incorrect"
        ? chordAnswerLabel(state.answer)
        : "",
    );
    this.b.bindVisible(
      wrongGuessRef,
      (state) => revealedRegionResult(state) === "incorrect",
    );
    this.b.bindVisible(
      wrongIconRef,
      (state) => revealedRegionResult(state) === "incorrect",
    );
    this.b.bindVisible(
      correctIconRef,
      (state) => revealedRegionResult(state) === "correct",
    );
    this.b.bindAttr(buttonRef, "data-region-id", (state) => state.region.id);
    this.b.bindAttr(buttonRef, "data-answerable", (state) =>
      state.answerable ? "true" : "false",
    );
    this.b.bindAttr(buttonRef, "data-selected", (state) =>
      state.selected ? "true" : undefined,
    );
    this.b.bindAttr(buttonRef, "data-result", revealedRegionResult);
    this.b.bindAttr(
      buttonRef,
      "aria-label",
      (state) => `harmony from tick ${state.region.startTicks}`,
    );
  }

  sync(state: RegionState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

/**
 * How each cell and harmony segment is decorated. `reveal` shows the true
 * labels and nothing else; `guess` carries the identify-notes practice state.
 */
export type ScoreGridMode =
  | { kind: "reveal" }
  | {
      kind: "guess";
      /** True once the trial is revealed; drives result icons and true labels. */
      revealed: boolean;
      chordAnswerable: boolean;
      cellAnswers: Record<CellId, CellAnswer>;
      chordAnswers: Record<RegionId, ChordAnswer>;
      selection: Selection | undefined;
    };

function cellAnnotation(
  mode: ScoreGridMode,
  cell: Cell,
  onsets: Onset[],
  cursorOnsetIndex: number | undefined,
): Pick<CellState, "answer" | "selected" | "cursor" | "revealed"> {
  const cursor =
    cursorOnsetIndex !== undefined &&
    onsets[cursorOnsetIndex]?.onsetTicks === cell.onsetTicks;
  if (mode.kind === "reveal") {
    return { answer: undefined, selected: false, cursor, revealed: true };
  }
  return {
    answer: mode.cellAnswers[cell.id],
    selected:
      mode.selection?.kind === "cell" && mode.selection.cellId === cell.id,
    cursor,
    revealed: mode.revealed,
  };
}

function regionAnnotation(
  mode: ScoreGridMode,
  region: HarmonyRegion,
): Pick<RegionState, "answer" | "answerable" | "selected" | "revealed"> {
  if (mode.kind === "reveal") {
    return {
      answer: undefined,
      answerable: false,
      selected: false,
      revealed: true,
    };
  }
  return {
    answer: mode.chordAnswers[region.id],
    answerable: mode.chordAnswerable,
    selected:
      mode.selection?.kind === "chord" && mode.selection.regionId === region.id,
    revealed: mode.revealed,
  };
}

type MeasureState = {
  measure: Measure;
  measureIndex: number;
  cells: { cell: Cell; cellIndex: number }[];
  stacks: StackState[];
  regions: HarmonyRegion[];
  onsets: Onset[];
  laneCount: number;
  hasHarmony: boolean;
  promptDegrees: Degree[];
  mode: ScoreGridMode;
  cursorOnsetIndex: number | undefined;
};

type MeasureMsg = CellMsg | StackMsg | RegionMsg;

class MeasureView implements View<MeasureState, MeasureMsg> {
  container: HTMLElement;
  private readonly b: Binder<MeasureState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: MeasureMsg) => void,
    initial: MeasureState,
  ) {
    const stacksRef = ref("stacks");
    const cellsRef = ref("cells");
    const harmonyRef = ref("harmony");
    const harmonyIconRef = ref("harmonyIcon");
    this.container = container;
    container.innerHTML = sanitize`
      <section class="${measureClass}" aria-label="bar ${initial.measureIndex + 1}">
        <div class="${stackTrackClass}" data-ref="${stacksRef}" aria-label="simultaneous notes"></div>
        <div class="${trackIconClass}" aria-hidden="true">${noteIcon()}</div>
        <div class="${cellTrackClass}" data-ref="${cellsRef}"></div>
        <div class="${trackIconClass}" data-ref="${harmonyIconRef}" aria-hidden="true">${chordIcon()}</div>
        <div class="${harmonyTrackClass}" data-ref="${harmonyRef}" aria-label="harmony"></div>
      </section>
    `;
    this.b = new Binder(container, initial);
    this.b.bindContainerAttr("data-measure-index", (state) =>
      String(state.measureIndex),
    );
    this.b.bindStyle(cellsRef, (state) => ({
      height: `${state.laneCount * LANE_HEIGHT_PX}px`,
    }));
    this.b.bindVisible(harmonyRef, (state) => state.hasHarmony);
    this.b.bindVisible(harmonyIconRef, (state) => state.hasHarmony);
    this.b.bindList(stacksRef, "div", (state) =>
      state.stacks.map((stack) =>
        showKeyed(
          String(stack.onsetTicks),
          StackButtonView,
          stack,
          {},
          dispatch,
        ),
      ),
    );
    this.b.bindList(cellsRef, "div", (state) =>
      state.cells.map(({ cell, cellIndex }) =>
        showKeyed(
          cell.id,
          CellView,
          {
            cell,
            cellIndex,
            measure: state.measure,
            promptDegrees: state.promptDegrees,
            ...cellAnnotation(
              state.mode,
              cell,
              state.onsets,
              state.cursorOnsetIndex,
            ),
          },
          {},
          dispatch,
        ),
      ),
    );
    this.b.bindList(harmonyRef, "div", (state) =>
      state.regions.map((region) =>
        showKeyed(
          region.id,
          HarmonyRegionView,
          {
            region,
            measure: state.measure,
            promptDegrees: state.promptDegrees,
            ...regionAnnotation(state.mode, region),
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

export type ScoreGridState = {
  /** Stable prefix for keyed measure children, e.g. the phrase or melody id. */
  key: string;
  score: Score;
  cells: Cell[];
  onsets: Onset[];
  laneCount: number;
  firstMeasureIndex: number;
  measureCount: number;
  promptDegrees: Degree[];
  mode: ScoreGridMode;
  /** Onset to outline: the answer cursor while practicing, the playhead while playing. */
  cursorOnsetIndex: number | undefined;
};

export type ScoreGridMsg = MeasureMsg;

export class ScoreGridView implements View<ScoreGridState, ScoreGridMsg> {
  container: HTMLElement;
  private readonly b: Binder<ScoreGridState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: ScoreGridMsg) => void,
    initial: ScoreGridState,
  ) {
    const measuresRef = ref("measures");
    this.container = container;
    container.innerHTML = sanitize`<div class="${scoreGridClass}" data-ref="${measuresRef}"></div>`;
    this.b = new Binder(container, initial);
    this.b.bindList(measuresRef, "div", (state) =>
      state.score.measures
        .slice(
          state.firstMeasureIndex,
          state.firstMeasureIndex + state.measureCount,
        )
        .map((measure, offset) => {
          const measureIndex = state.firstMeasureIndex + offset;
          const inMeasure = (ticks: number) =>
            ticks >= measure.startTicks && ticks < measure.endTicks;
          const measureCells = state.cells.flatMap((cell, cellIndex) =>
            inMeasure(cell.onsetTicks) ? [{ cell, cellIndex }] : [],
          );
          const stacks = state.onsets.flatMap((onset, onsetIndex) => {
            if (!inMeasure(onset.onsetTicks)) return [];
            const sounding = cellsSoundingAt(state.cells, onset.onsetTicks);
            return sounding.length > 1
              ? [
                  {
                    onsetIndex,
                    onsetTicks: onset.onsetTicks,
                    measure,
                    soundingCount: sounding.length,
                  },
                ]
              : [];
          });
          const regions = state.score.harmony.filter(
            (region) =>
              region.startTicks < measure.endTicks &&
              region.endTicks > measure.startTicks,
          );
          return showKeyed(
            `${state.key}:${measureIndex}`,
            MeasureView,
            {
              measure,
              measureIndex,
              cells: measureCells,
              stacks,
              regions,
              onsets: state.onsets,
              laneCount: state.laneCount,
              hasHarmony: state.score.harmony.length > 0,
              promptDegrees: state.promptDegrees,
              cursorOnsetIndex: state.cursorOnsetIndex,
              mode: state.mode,
            },
            {},
            dispatch,
          );
        }),
    );
  }

  sync(state: ScoreGridState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
