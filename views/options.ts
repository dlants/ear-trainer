import type {
  PlayButtonId,
  PlayController,
  PlayStep,
} from "../audio/play-controller.ts";
import type { Profile, ProfileStore, TonicMode } from "../deck/profiles.ts";
import type { Midi } from "../music/pitch.ts";
import {
  Binder,
  cls,
  mountStyle,
  ref,
  sanitize,
  show,
  type View,
} from "../vamp.ts";
import { PlayButtonView } from "./play-button.ts";

export const MIN_TONIC: Midi = 36;
export const MAX_TONIC: Midi = 84;

export type State = {
  tonicMode: TonicMode;
  tonic: Midi;
  tonicLow: Midi;
  tonicHigh: Midi;
  error: string | undefined;
};

export type Msg =
  | { type: "SET_MODE"; mode: TonicMode }
  | { type: "SET_TONIC"; tonic: Midi }
  | { type: "SET_LOW"; tonic: Midi }
  | { type: "SET_HIGH"; tonic: Midi }
  | { type: "PREVIEW"; setting: "tonic" | "low" | "high" }
  | { type: "ERROR"; message: string };

export type OptionsCtx = {
  play: PlayController;
  profile: Profile;
  profiles: ProfileStore;
};

export function initialState(ctx: OptionsCtx): State {
  return {
    tonicMode: ctx.profile.tonicMode,
    tonic: ctx.profile.tonic,
    tonicLow: ctx.profile.tonicLow,
    tonicHigh: ctx.profile.tonicHigh,
    error: undefined,
  };
}

function clamp(tonic: Midi): Midi {
  return Math.max(MIN_TONIC, Math.min(MAX_TONIC, tonic));
}

function persist(state: State, ctx: OptionsCtx): void {
  ctx.profile.tonicMode = state.tonicMode;
  ctx.profile.tonic = state.tonic;
  ctx.profile.tonicLow = state.tonicLow;
  ctx.profile.tonicHigh = state.tonicHigh;
  ctx.profiles.save(ctx.profile);
}

function preview(
  state: State,
  setting: "tonic" | "low" | "high",
  ctx: OptionsCtx,
): void {
  const note =
    setting === "tonic"
      ? state.tonic
      : setting === "low"
        ? state.tonicLow
        : state.tonicHigh;
  const buttonId: PlayButtonId = `options:${setting}`;
  const step: PlayStep = { buttonId, type: "note", note };
  state.error = undefined;
  ctx.play.toggle(buttonId, step);
}

export function update(state: State, msg: Msg, ctx: OptionsCtx): void {
  switch (msg.type) {
    case "SET_MODE":
      state.tonicMode = msg.mode;
      persist(state, ctx);
      break;
    case "SET_TONIC":
      state.tonic = clamp(msg.tonic);
      persist(state, ctx);
      break;
    case "SET_LOW":
      state.tonicLow = Math.min(clamp(msg.tonic), state.tonicHigh);
      persist(state, ctx);
      break;
    case "SET_HIGH":
      state.tonicHigh = Math.max(clamp(msg.tonic), state.tonicLow);
      persist(state, ctx);
      break;
    case "PREVIEW":
      preview(state, msg.setting, ctx);
      break;
    case "ERROR":
      state.error = msg.message;
      break;
  }
}

const NOTE_NAMES = [
  "C",
  "C♯",
  "D",
  "E♭",
  "E",
  "F",
  "F♯",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];

export function noteName(midi: Midi): string {
  const pitchClass = ((midi % 12) + 12) % 12;
  return `${NOTE_NAMES[pitchClass]}${Math.floor(midi / 12) - 1}`;
}

const optionsClass = cls("options");
const fieldClass = cls("options-field");
const playSlotClass = cls("options-play-slot");

mountStyle(`
.${optionsClass} {
  max-width: 560px;
  margin: 0 auto;
  padding: max(28px, env(safe-area-inset-top)) 20px
    max(28px, env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.${optionsClass} h1 {
  margin: 0 0 8px;
  font-size: 30px;
}
.${optionsClass} .intro {
  margin: 0 0 28px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
.${optionsClass} fieldset {
  margin: 0 0 24px;
  padding: 0;
  border: 0;
}
.${optionsClass} legend {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 650;
}
.${optionsClass} .mode-options {
  display: grid;
  gap: 10px;
}
.${optionsClass} .mode-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
  cursor: pointer;
}
.${optionsClass} .mode-option:has(input:checked) {
  border-color: var(--color-brand-border);
  background: var(--color-brand-surface);
  color: var(--color-brand);
}
.${optionsClass} .mode-option input {
  width: 20px;
  height: 20px;
  accent-color: var(--color-brand);
}
.${optionsClass} .${fieldClass} {
  margin-bottom: 22px;
}
.${optionsClass} .field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}
.${optionsClass} .${playSlotClass} {
  display: inline-flex;
}
.${optionsClass} input[type="range"] {
  width: 100%;
  min-height: 44px;
  accent-color: var(--color-brand);
}
.${optionsClass} .octave-ticks {
  display: flex;
  justify-content: space-between;
  margin: -7px 8px 0;
}
.${optionsClass} .octave-ticks span {
  width: 2px;
  height: 11px;
  border-radius: 1px;
  background: var(--color-text-muted);
}
.${optionsClass} .hint {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.4;
}
`);

export class OptionsView implements View<State, Msg, Pick<OptionsCtx, "play">> {
  container: HTMLElement;
  private readonly b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
    ctx: Pick<OptionsCtx, "play">,
  ) {
    const errorRef = ref("error");
    const fixedModeRef = ref("fixed-mode");
    const movingModeRef = ref("moving-mode");
    const fixedFieldsRef = ref("fixed-fields");
    const movingFieldsRef = ref("moving-fields");
    const tonicRef = ref("tonic");
    const tonicButtonRef = ref("tonic-button");
    const lowRef = ref("low");
    const lowButtonRef = ref("low-button");
    const highRef = ref("high");
    const highButtonRef = ref("high-button");
    const modeName = ref("tonic-mode");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${optionsClass}">
        <h1>options</h1>
        <p class="intro">Choose where the home note (1 / do) sits so every pattern is comfortable to sing or hum.</p>
        <p data-ref="${errorRef}"></p>
        <fieldset>
          <legend>key</legend>
          <div class="mode-options">
            <label class="mode-option">
              <input type="radio" name="${modeName}" value="moving" data-ref="${movingModeRef}">
              <span>movable key</span>
            </label>
            <label class="mode-option">
              <input type="radio" name="${modeName}" value="fixed" data-ref="${fixedModeRef}">
              <span>static key</span>
            </label>
          </div>
        </fieldset>
        <div data-ref="${fixedFieldsRef}">
          <div class="${fieldClass}">
            <div class="field-head">
              <label for="${tonicRef}">home note</label>
              <div class="${playSlotClass}" data-ref="${tonicButtonRef}"></div>
            </div>
            <input id="${tonicRef}" type="range" min="${MIN_TONIC}" max="${MAX_TONIC}" step="1" data-ref="${tonicRef}">            <div class="octave-ticks" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>

          </div>
        </div>
        <div data-ref="${movingFieldsRef}">
          <div class="${fieldClass}">
            <div class="field-head">
              <label for="${lowRef}">lowest home note</label>
              <div class="${playSlotClass}" data-ref="${lowButtonRef}"></div>
            </div>
            <input id="${lowRef}" type="range" min="${MIN_TONIC}" max="${MAX_TONIC}" step="1" data-ref="${lowRef}">            <div class="octave-ticks" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>

          </div>
          <div class="${fieldClass}">
            <div class="field-head">
              <label for="${highRef}">highest home note</label>
              <div class="${playSlotClass}" data-ref="${highButtonRef}"></div>
            </div>
            <input id="${highRef}" type="range" min="${MIN_TONIC}" max="${MAX_TONIC}" step="1" data-ref="${highRef}">            <div class="octave-ticks" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>

          </div>
          <p class="hint">A new home note is chosen from this range for each trial.</p>
        </div>
      </section>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref<HTMLInputElement>(fixedModeRef)
      .addEventListener("change", () =>
        dispatch({ type: "SET_MODE", mode: "fixed" }),
      );
    this.b
      .ref<HTMLInputElement>(movingModeRef)
      .addEventListener("change", () =>
        dispatch({ type: "SET_MODE", mode: "moving" }),
      );
    this.b.ref<HTMLInputElement>(tonicRef).addEventListener("input", (event) =>
      dispatch({
        type: "SET_TONIC",
        tonic: Number((event.target as HTMLInputElement).value),
      }),
    );
    this.b.ref<HTMLInputElement>(lowRef).addEventListener("input", (event) =>
      dispatch({
        type: "SET_LOW",
        tonic: Number((event.target as HTMLInputElement).value),
      }),
    );
    this.b.ref<HTMLInputElement>(highRef).addEventListener("input", (event) =>
      dispatch({
        type: "SET_HIGH",
        tonic: Number((event.target as HTMLInputElement).value),
      }),
    );
    const bindPlayButton = (
      slotRef: typeof tonicButtonRef,
      setting: "tonic" | "low" | "high",
      ariaLabel: string,
      note: (state: State) => Midi,
    ) => {
      this.b.bindSlot(slotRef, (state) => {
        const id: PlayButtonId = `options:${setting}`;
        const playback = ctx.play.getState();
        const playing =
          playback.status === "playing" && playback.buttonId === id;
        return show(
          PlayButtonView,
          {
            id,
            label: noteName(note(state)),
            ariaLabel,
            icon: "play",
            variant: "compact",
            visible: true,
            playing,
            durationMs: playing ? playback.durationMs : undefined,
          },
          {},
          () => dispatch({ type: "PREVIEW", setting }),
        );
      });
    };
    bindPlayButton(
      tonicButtonRef,
      "tonic",
      "play home note",
      (state) => state.tonic,
    );
    bindPlayButton(
      lowButtonRef,
      "low",
      "play lowest home note",
      (state) => state.tonicLow,
    );
    bindPlayButton(
      highButtonRef,
      "high",
      "play highest home note",
      (state) => state.tonicHigh,
    );
    this.b
      .ref<HTMLInputElement>(tonicRef)
      .addEventListener("change", () =>
        dispatch({ type: "PREVIEW", setting: "tonic" }),
      );
    this.b
      .ref<HTMLInputElement>(lowRef)
      .addEventListener("change", () =>
        dispatch({ type: "PREVIEW", setting: "low" }),
      );
    this.b
      .ref<HTMLInputElement>(highRef)
      .addEventListener("change", () =>
        dispatch({ type: "PREVIEW", setting: "high" }),
      );

    this.b.bindText(errorRef, (s) => s.error ?? "");
    this.b.bindVisible(errorRef, (s) => s.error !== undefined);
    this.b.bindChecked(fixedModeRef, (s) => s.tonicMode === "fixed");
    this.b.bindChecked(movingModeRef, (s) => s.tonicMode === "moving");
    this.b.bindVisible(fixedFieldsRef, (s) => s.tonicMode === "fixed");
    this.b.bindVisible(movingFieldsRef, (s) => s.tonicMode === "moving");
    this.b.bindValue(tonicRef, (s) => String(s.tonic));
    this.b.bindValue(lowRef, (s) => String(s.tonicLow));
    this.b.bindValue(highRef, (s) => String(s.tonicHigh));
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
