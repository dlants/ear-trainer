import type { PlayState } from "../audio/play-controller.ts";
import { arrowDownIcon, arrowUpIcon } from "../icons.ts";
import type { Measure, TimedEvent } from "../music/melody.ts";
import { voice } from "../music/melody.ts";
import type { Degree } from "../music/note.ts";
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
  type IdentifyTonicMsg,
  type IdentifyTonicState,
  type IdentifyTonicTrial,
  type MelodySlotAnswer,
  type SingTonicMsg,
  type SingTonicState,
  type TonicPracticeCtx,
  VISIBLE_MEASURE_COUNT,
} from "./tonic-practice.ts";

export type SlotResult = "correct" | "missed" | "extra" | "unanswered";

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
  const expected = actualAnswer(event, promptDegrees);
  if (answer === expected) return "correct";
  if (answer === undefined) {
    return expected === "other" ? "unanswered" : "missed";
  }
  return expected === "other" ? "extra" : "missed";
}

function answerLabel(
  answer: MelodySlotAnswer,
  promptDegrees: Degree[] = [1],
): string {
  return answer === undefined
    ? "?"
    : answer === "other"
      ? promptDegrees.length === 1 && promptDegrees[0] === 1
        ? "not 1"
        : "other"
      : String(answer);
}

function expectedLabel(event: TimedEvent, promptDegrees: Degree[]): string {
  const answer = actualAnswer(event, promptDegrees);
  return answer === "other" ? "not a prompted degree" : String(answer);
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
const measureGridClass = cls("tonic-measure-grid");
const beatClass = cls("tonic-beat");
const slotClass = cls("tonic-slot");
const selectedClass = cls("tonic-slot-selected");
const playingClass = cls("tonic-slot-playing");
const correctClass = cls("tonic-slot-correct");
const incorrectClass = cls("tonic-slot-incorrect");
const unansweredClass = cls("tonic-slot-unanswered");
const paletteClass = cls("tonic-palette");
const emptyClass = cls("tonic-empty");

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
.${pageClass} .${viewportClass} { display: grid; gap: 10px; }
.${pageClass} .${measureClass} { display: grid; grid-template-columns: 2rem 1fr; gap: 8px; align-items: center; }
.${pageClass} .${measureGridClass} {
  position: relative;
  height: 62px;
  overflow: hidden;
  border: 2px solid var(--color-border);
  border-inline-width: 3px;
  border-radius: 4px;
  background: var(--color-surface);
}
.${pageClass} .${beatClass} { position: absolute; inset-block: 0; border-left: 1px dashed var(--color-border); pointer-events: none; }
.${pageClass} .${slotClass} {
  position: absolute;
  top: 9px;
  height: 42px;
  min-width: 30px;
  padding: 0 4px;
  border-radius: 8px;
  font-weight: 750;
  overflow: hidden;
  white-space: nowrap;
}
.${pageClass} .${selectedClass} { border: 2px solid var(--color-brand-border); background: var(--color-brand-surface); color: var(--color-brand); }
.${pageClass} .${playingClass} { outline: 3px solid var(--color-unsure-border); outline-offset: 2px; }
.${pageClass} .${correctClass} { border-color: var(--color-correct-border); background: var(--color-correct-surface); color: var(--color-correct); }
.${pageClass} .${incorrectClass} { border-color: var(--color-incorrect-border); background: var(--color-incorrect-surface); color: var(--color-incorrect); }
.${pageClass} .${unansweredClass} { border-color: var(--color-unsure-border); background: var(--color-unsure-surface); color: var(--color-unsure); }
.${pageClass} .${paletteClass} { display: flex; justify-content: center; gap: 8px; min-height: 46px; }
.${pageClass} .${paletteClass} button { min-width: 72px; padding: 10px 12px; border-radius: var(--radius-control); font-weight: 700; }
.${pageClass} .${viewportControlsClass} { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; }
.${pageClass} .${viewportControlsClass} button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 42px; border-radius: var(--radius-control); }
.${pageClass} .${viewportControlsClass} button:last-child { justify-self: end; }
.${pageClass} .${viewportControlsClass} svg { font-size: 1.1em; }
`);

type BeatState = { leftPercent: number };

class BeatView implements View<BeatState> {
  container: HTMLElement;
  private readonly b: Binder<BeatState>;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    initial: BeatState,
  ) {
    const beatRef = ref("beat");
    this.container = container;
    container.innerHTML = sanitize`<span class="${beatClass}" data-ref="${beatRef}"></span>`;
    this.b = new Binder(container, initial);
    this.b.bindStyle(beatRef, (state) => ({ left: `${state.leftPercent}%` }));
  }

  sync(state: BeatState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

type SlotState = {
  event: TimedEvent;
  eventIndex: number;
  measure: Measure;
  promptDegrees: Degree[];
  answer: MelodySlotAnswer;
  selected: boolean;
  playing: boolean;
  revealed: boolean;
};

type SlotMsg = { type: "SELECT"; eventIndex: number };

class MelodySlotView implements View<SlotState, SlotMsg> {
  container: HTMLElement;
  private readonly b: Binder<SlotState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: SlotMsg) => void,
    initial: SlotState,
  ) {
    const buttonRef = ref("slot");
    const textRef = ref("slotText");
    this.container = container;
    container.innerHTML = sanitize`<button type="button" data-ref="${buttonRef}"><span data-ref="${textRef}"></span></button>`;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "SELECT", eventIndex: initial.eventIndex }),
    );
    this.b.bindStyle(buttonRef, (state) => {
      const duration = state.measure.endTicks - state.measure.startTicks;
      return {
        left: `${((state.event.onsetTicks - state.measure.startTicks) / duration) * 100}%`,
        width: `${(state.event.durationTicks / duration) * 100}%`,
      };
    });
    this.b.bindClass(buttonRef, (state) => {
      const classes = [slotClass];
      if (state.selected) classes.push(selectedClass);
      if (state.playing) classes.push(playingClass);
      if (state.revealed) {
        const result = slotResult(
          state.event,
          state.promptDegrees,
          state.answer,
        );
        classes.push(
          result === "correct"
            ? correctClass
            : result === "unanswered"
              ? unansweredClass
              : incorrectClass,
        );
      }
      return classes.join(" ");
    });
    this.b.bindText(textRef, (state) => {
      const answer = answerLabel(state.answer, state.promptDegrees);
      if (state.playing) return `${answer} · playing`;
      if (!state.revealed) return answer;
      const result = slotResult(state.event, state.promptDegrees, state.answer);
      return `${answer} · expected ${expectedLabel(state.event, state.promptDegrees)} · ${result}`;
    });
    this.b.bindDisabled(buttonRef, (state) => state.revealed);
    this.b.bindAttr(buttonRef, "data-event-index", (state) =>
      String(state.eventIndex),
    );
    this.b.bindAttr(buttonRef, "data-result", (state) =>
      state.revealed
        ? slotResult(state.event, state.promptDegrees, state.answer)
        : undefined,
    );
    this.b.bindAttr(buttonRef, "aria-current", (state) =>
      state.playing ? "true" : undefined,
    );
    this.b.bindAttr(
      buttonRef,
      "aria-label",
      (state) =>
        `melody note ${state.eventIndex + 1}: ${answerLabel(state.answer, state.promptDegrees)}`,
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
  events: { event: TimedEvent; eventIndex: number }[];
  trial: IdentifyTonicTrial;
  playingEventIndex: number | undefined;
};

class MelodyMeasureView implements View<MeasureState, SlotMsg> {
  container: HTMLElement;
  private readonly b: Binder<MeasureState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: SlotMsg) => void,
    initial: MeasureState,
  ) {
    const numberRef = ref("measureNumber");
    const gridRef = ref("measureGrid");
    const beatsRef = ref("beats");
    const slotsRef = ref("slots");
    this.container = container;
    container.innerHTML = sanitize`
      <section class="${measureClass}" aria-label="bar ${initial.measureIndex + 1}">
        <span data-ref="${numberRef}"></span>
        <div class="${measureGridClass}" data-ref="${gridRef}">
          <div data-ref="${beatsRef}"></div>
          <div data-ref="${slotsRef}"></div>
        </div>
      </section>
    `;
    this.b = new Binder(container, initial);
    this.b.bindContainerAttr("data-measure-index", (state) =>
      String(state.measureIndex),
    );
    this.b.bindText(numberRef, (state) => String(state.measureIndex + 1));
    this.b.bindList(beatsRef, "span", (state) => {
      const total = state.measure.endTicks - state.measure.startTicks;
      let elapsed = 0;
      return state.measure.beatDurationsTicks
        .slice(0, -1)
        .map((duration, index) => {
          elapsed += duration;
          return showKeyed(
            String(index),
            BeatView,
            { leftPercent: (elapsed / total) * 100 },
            {},
            () => {},
          );
        });
    });
    this.b.bindList(slotsRef, "span", (state) =>
      state.events.map(({ event, eventIndex }) =>
        showKeyed(
          String(eventIndex),
          MelodySlotView,
          {
            event,
            eventIndex,
            measure: state.measure,
            promptDegrees: state.trial.promptDegrees,
            answer: state.trial.answers[eventIndex],
            selected: state.trial.selectedSlotIndex === eventIndex,
            playing: state.playingEventIndex === eventIndex,
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
  ctx: Pick<TonicPracticeCtx, "play">,
  id: "trial:context" | "trial:drone" | "tonic:melody" | "tonic:answer",
  label: string,
  ariaLabel: string,
  icon: "key" | "drone" | "play",
  variant: "trial" | "compact",
  visible: boolean,
  selected = false,
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

function answerChoices(trial: IdentifyTonicTrial): AnswerChoiceState[] {
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
      label:
        trial.promptDegrees.length === 1 && trial.promptDegrees[0] === 1
          ? "not 1"
          : "other",
      selected: selected === "other",
    },
  ];
}

export class IdentifyTonicNotesView
  implements
    View<
      IdentifyTonicState,
      IdentifyTonicMsg,
      Pick<TonicPracticeCtx, "play" | "profile">
    >
{
  container: HTMLElement;
  private readonly b: Binder<IdentifyTonicState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: IdentifyTonicMsg) => void,
    initial: IdentifyTonicState,
    ctx: Pick<TonicPracticeCtx, "play" | "profile">,
  ) {
    const emptyRef = ref("empty");
    const activityRef = ref("activity");
    const contextRef = ref("context");
    const droneRef = ref("drone");
    const melodyRef = ref("melody");
    const measuresRef = ref("measures");
    const previousRef = ref("previousBars");
    const rangeRef = ref("barRange");
    const nextBarsRef = ref("nextBars");
    const paletteRef = ref("palette");
    const revealRef = ref("reveal");
    const nextRef = ref("next");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${pageClass}">
        <h1 class="${headingClass}">Identify the tonic notes</h1>
        <p class="${instructionClass}">Listen, then mark each note as 1 or not 1. The rhythm display does not show pitch.</p>
        <p class="${emptyClass}" data-ref="${emptyRef}">No eligible melody fragments are available.</p>
        <div data-ref="${activityRef}">
          <div class="${supportClass}">
            <div data-ref="${contextRef}"></div>
            <div data-ref="${droneRef}"></div>
          </div>
          <div class="${playRowClass}"><div data-ref="${melodyRef}"></div></div>
          <div class="${viewportClass}" data-ref="${measuresRef}"></div>
          <div class="${viewportControlsClass}">
            <button type="button" data-ref="${previousRef}">${arrowUpIcon()} previous bar</button>
            <span data-ref="${rangeRef}"></span>
            <button type="button" data-ref="${nextBarsRef}">next bar ${arrowDownIcon()}</button>
          </div>
          <div class="${paletteClass}" data-ref="${paletteRef}" aria-label="answer choices"></div>
          <div class="${actionRowClass}">
            <button type="button" class="${primaryClass}" data-ref="${revealRef}">reveal answers</button>
            <button type="button" class="${primaryClass}" data-ref="${nextRef}">next melody</button>
          </div>
        </div>
      </section>
    `;
    this.b = new Binder(container, initial);
    onPress(this.b.ref(previousRef), () =>
      dispatch({ type: "SCROLL", delta: -1 }),
    );
    onPress(this.b.ref(nextBarsRef), () =>
      dispatch({ type: "SCROLL", delta: 1 }),
    );
    onPress(this.b.ref(revealRef), () => dispatch({ type: "REVEAL" }));
    onPress(this.b.ref(nextRef), () => dispatch({ type: "NEXT" }));

    this.b.bindVisible(emptyRef, (state) => state.trial === undefined);
    this.b.bindVisible(activityRef, (state) => state.trial !== undefined);
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
    this.b.bindList(measuresRef, "div", (state) => {
      const trial = state.trial;
      if (!trial) return [];
      const melodyEvents = voice(trial.phrase, "melody")?.events ?? [];
      const playback = playbackFor(ctx, "tonic:melody");
      const playingEventIndex =
        playback.status === "playing" ? playback.eventIndex : undefined;
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
            { measure, measureIndex, events, trial, playingEventIndex },
            {},
            (msg) =>
              dispatch({ type: "SELECT_SLOT", eventIndex: msg.eventIndex }),
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
      revealRef,
      (state) => state.trial?.phase === "answering",
    );
    this.b.bindVisible(nextRef, (state) => state.trial?.phase === "revealed");
  }

  sync(state: IdentifyTonicState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
