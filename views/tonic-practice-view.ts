import type { PlayState } from "../audio/play-controller.ts";
import { arrowDownIcon, arrowUpIcon } from "../icons.ts";
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
  diatonicRoman,
  type ScoreGridMsg,
  ScoreGridView,
} from "./score-grid.ts";
import {
  type CellAnswer,
  type ChordAnswer,
  chordAnswerable,
  IDENTIFY_NOTE_DEGREES,
  type IdentifyNotesCtx,
  type IdentifyNotesMsg,
  type IdentifyNotesState,
  type IdentifyNotesTrial,
  VISIBLE_MEASURE_COUNT,
} from "./tonic-practice.ts";

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
const selectedClass = cls("tonic-slot-selected");
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
.${pageClass} .${selectedClass} { border: 2px solid var(--color-selected-border); background: var(--color-selected-surface); color: var(--color-text); }
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
  return ["?", ...IDENTIFY_NOTE_DEGREES.map(String), "other", "_"].join(" · ");
}

type AnswerChoiceState = {
  answer: CellAnswer | ChordAnswer;
  label: string;
  selected: boolean;
};

type AnswerChoiceMsg = { type: "CHOOSE"; answer: CellAnswer | ChordAnswer };

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

/** The palette is a pure function of what is selected. */
function answerChoices(trial: IdentifyNotesTrial): AnswerChoiceState[] {
  const selection = trial.selection;
  if (selection === undefined) return [];
  const chord = selection.kind === "chord";
  const selected = chord
    ? trial.chordAnswers[selection.regionId]
    : trial.cellAnswers[selection.cellId];
  return [
    { answer: undefined, label: "?", selected: selected === undefined },
    ...trial.promptDegrees.map((degree) => ({
      answer: degree,
      label: chord ? diatonicRoman(degree) : String(degree),
      selected: selected === degree,
    })),
    {
      answer: "other" as const,
      label: "other",
      selected: selected === "other",
    },
    { answer: "skip" as const, label: "_", selected: selected === "skip" },
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
        <p class="${instructionClass}" data-ref="${practiceInstructionRef}">Tap a note to hear it, or the play button above a stack to hear those notes together. Choose each note’s scale degree below; use “_” for notes you decide to leave out.</p>
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
    this.b.bindSlot(measuresRef, (state) => {
      const trial = state.trial;
      if (!trial) return undefined;
      return show(
        ScoreGridView,
        {
          key: trial.phrase.id,
          score: trial.phrase,
          cells: trial.cells,
          onsets: trial.onsets,
          laneCount: trial.lanes.length,
          firstMeasureIndex: trial.firstVisibleMeasureIndex,
          measureCount: VISIBLE_MEASURE_COUNT,
          promptDegrees: trial.promptDegrees,
          cursorOnsetIndex: trial.cursorOnsetIndex,
          mode: {
            kind: "guess",
            revealed: trial.phase === "revealed",
            chordAnswerable: chordAnswerable(trial.phrase),
            cellAnswers: trial.cellAnswers,
            chordAnswers: trial.chordAnswers,
            selection: trial.selection,
          },
        },
        {},
        (msg: ScoreGridMsg) => {
          switch (msg.type) {
            case "CELL":
              dispatch({ type: "PLAY_CELL", cellId: msg.cellId });
              dispatch({ type: "SELECT_CELL", cellId: msg.cellId });
              break;
            case "ONSET":
              dispatch({ type: "PLAY_ONSET", onsetIndex: msg.onsetIndex });
              break;
            case "REGION":
              dispatch({ type: "PLAY_REGION", regionId: msg.regionId });
              dispatch({ type: "SELECT_REGION", regionId: msg.regionId });
              break;
          }
        },
      );
    });
    this.b.bindList(paletteRef, "span", (state) => {
      const trial = state.trial;
      if (trial?.phase !== "answering" || trial.selection === undefined) {
        return [];
      }
      const kind = trial.selection.kind;
      return answerChoices(trial).map((choice) =>
        showKeyed(
          `${kind}:${choice.answer === undefined ? "unknown" : String(choice.answer)}`,
          AnswerChoiceView,
          choice,
          {},
          (msg) =>
            dispatch(
              kind === "chord"
                ? { type: "SET_CHORD_ANSWER", answer: msg.answer }
                : { type: "SET_ANSWER", answer: msg.answer },
            ),
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
