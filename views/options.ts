import type { CadenceSpeed } from "../audio/engine.ts";
import {
  centsOff,
  type MicPitchDetector,
  type MicPitchMsg,
  nearestMidi,
  type Pitch,
  SILENCE_LEVEL,
} from "../audio/mic-pitch.ts";
import type {
  PlayButtonId,
  PlayController,
  PlayStep,
} from "../audio/play-controller.ts";
import type { Profile, ProfileStore } from "../deck/profiles.ts";
import { micIcon } from "../icons.ts";
import type { Midi } from "../music/pitch.ts";
import {
  Binder,
  cls,
  mountStyle,
  onActivate,
  onPress,
  ref,
  sanitize,
  show,
  type View,
} from "../vamp.ts";
import { PlayButtonView } from "./play-button.ts";

export const MIN_TONIC: Midi = 36;
export const MAX_TONIC: Midi = 84;

export type MicState =
  | { status: "off" }
  | { status: "starting" }
  | {
      status: "listening";
      level: number;
      meter: number;
      pitch: Pitch | undefined;
    }
  | { status: "error"; message: string };

export type State = {
  tonic: Midi;
  cadenceSpeed: CadenceSpeed;
  mic: MicState;
  error: string | undefined;
};

export type Msg =
  | { type: "SET_TONIC"; tonic: Midi }
  | { type: "SET_CADENCE_SPEED"; speed: CadenceSpeed }
  | { type: "PREVIEW" }
  | { type: "TOGGLE_MIC" }
  | { type: "MIC_MSG"; msg: MicPitchMsg }
  | { type: "USE_HEARD_NOTE" }
  | { type: "ERROR"; message: string };

export type OptionsCtx = {
  play: PlayController;
  profile: Profile;
  profiles: ProfileStore;
  mic: MicPitchDetector;
};

export function initialState(ctx: OptionsCtx): State {
  return {
    tonic: ctx.profile.tonic,
    cadenceSpeed: ctx.profile.cadenceSpeed,
    mic: { status: "off" },
    error: undefined,
  };
}

function clamp(tonic: Midi): Midi {
  return Math.max(MIN_TONIC, Math.min(MAX_TONIC, tonic));
}

function persist(state: State, ctx: OptionsCtx): void {
  ctx.profile.tonic = state.tonic;
  ctx.profile.cadenceSpeed = state.cadenceSpeed;
  ctx.profiles.save(ctx.profile);
}

function previewCadence(
  state: State,
  speed: CadenceSpeed,
  ctx: OptionsCtx,
): void {
  const buttonId: PlayButtonId = `options:cadence:${speed}`;
  const step: PlayStep = {
    buttonId,
    type: "context",
    context: "major-cadence",
    tonic: state.tonic,
    speed,
  };
  state.error = undefined;
  ctx.play.toggle(buttonId, step);
}

function preview(state: State, ctx: OptionsCtx): void {
  const buttonId: PlayButtonId = "options:tonic";
  const step: PlayStep = { buttonId, type: "note", note: state.tonic };
  state.error = undefined;
  ctx.play.toggle(buttonId, step);
}

function heardMidi(mic: MicState): Midi | undefined {
  if (mic.status !== "listening" || !mic.pitch) return undefined;
  return nearestMidi(mic.pitch.midi);
}

function micUpdate(state: State, msg: MicPitchMsg): void {
  switch (msg.type) {
    case "MIC_STARTED":
      state.mic = {
        status: "listening",
        level: 0,
        meter: 0,
        pitch: undefined,
      };
      break;
    case "MIC_READING":
      // A momentary silence between sung notes keeps the last reading on screen
      // rather than flickering the readout away.
      if (state.mic.status === "listening")
        state.mic = {
          status: "listening",
          level: msg.reading.level,
          meter: msg.reading.meter,
          pitch: msg.reading.pitch ?? state.mic.pitch,
        };
      break;
    case "MIC_ERROR":
      state.mic = { status: "error", message: msg.message };
      break;
  }
}

export function update(state: State, msg: Msg, ctx: OptionsCtx): void {
  switch (msg.type) {
    case "SET_TONIC":
      state.tonic = clamp(msg.tonic);
      persist(state, ctx);
      break;
    case "SET_CADENCE_SPEED":
      state.cadenceSpeed = msg.speed;
      persist(state, ctx);
      previewCadence(state, msg.speed, ctx);
      break;
    case "PREVIEW":
      preview(state, ctx);
      break;
    case "TOGGLE_MIC":
      if (state.mic.status === "off" || state.mic.status === "error") {
        state.mic = { status: "starting" };
        ctx.mic.start();
      } else {
        state.mic = { status: "off" };
        ctx.mic.stop();
      }
      break;
    case "MIC_MSG":
      micUpdate(state, msg.msg);
      break;
    case "USE_HEARD_NOTE": {
      const heard = heardMidi(state.mic);
      if (heard !== undefined) {
        state.tonic = clamp(heard);
        persist(state, ctx);
        preview(state, ctx);
      }
      break;
    }
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
const micClass = cls("options-mic");

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
  margin: 0 0 16px;
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
.${optionsClass} .cadence-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.${optionsClass} .cadence-options > div {
  display: flex;
}
.${optionsClass} .cadence-options button {
  width: 100%;
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
.${optionsClass} .${micClass} {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}
.${optionsClass} .${micClass} button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
}
.${optionsClass} .${micClass} .listening {
  border-color: var(--color-brand-border);
  background: var(--color-brand-surface);
  color: var(--color-brand);
}
.${optionsClass} .${micClass} .heard {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.${optionsClass} .${micClass} .heard strong {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}
.${optionsClass} .${micClass} .level {
  flex: 1 1 80px;
  height: 8px;
  min-width: 80px;
  border-radius: 4px;
  background: var(--color-border);
  overflow: hidden;
}
.${optionsClass} .${micClass} .level span {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--color-brand);
  transition: width 80ms linear;
}
.${optionsClass} .${micClass} .heard span {
  color: var(--color-text-muted);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
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
    const tonicRef = ref("tonic");
    const tonicButtonRef = ref("tonic-button");
    const slowCadenceRef = ref("slow-cadence");
    const mediumCadenceRef = ref("medium-cadence");
    const fastCadenceRef = ref("fast-cadence");
    const micToggleRef = ref("mic-toggle");
    const micLabelRef = ref("mic-label");
    const micHintRef = ref("mic-hint");
    const heardRef = ref("heard");
    const heardNoteRef = ref("heard-note");
    const heardCentsRef = ref("heard-cents");
    const useHeardRef = ref("use-heard");
    const levelRef = ref("level");
    const levelFillRef = ref("level-fill");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${optionsClass}">
        <h1>options</h1>
        <p data-ref="${errorRef}"></p>
        <fieldset>
          <legend>key</legend>
          <p class="intro">Choose where the home note (1 / do) sits so every pattern is comfortable to sing or hum.</p>
          <div class="${fieldClass}">
            <div class="field-head">
              <label for="${tonicRef}">home note</label>
              <div class="${playSlotClass}" data-ref="${tonicButtonRef}"></div>
            </div>
            <input id="${tonicRef}" type="range" min="${MIN_TONIC}" max="${MAX_TONIC}" step="1" data-ref="${tonicRef}">
            <div class="octave-ticks" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="${micClass}">
              <button type="button" data-ref="${micToggleRef}">
                ${micIcon()}<span data-ref="${micLabelRef}"></span>
              </button>
              <div class="heard" data-ref="${heardRef}">
                <strong data-ref="${heardNoteRef}"></strong>
                <span data-ref="${heardCentsRef}"></span>
              </div>
              <button type="button" data-ref="${useHeardRef}">use as home note</button>
              <div class="level" data-ref="${levelRef}" aria-hidden="true">
                <span data-ref="${levelFillRef}"></span>
              </div>
            </div>
            <p class="hint" data-ref="${micHintRef}"></p>
          </div>
        </fieldset>
        <fieldset>
          <legend>cadence speed</legend>
          <div class="cadence-options">
            <div data-ref="${slowCadenceRef}"></div>
            <div data-ref="${mediumCadenceRef}"></div>
            <div data-ref="${fastCadenceRef}"></div>
          </div>
        </fieldset>
      </section>
    `;
    this.b = new Binder(container, initial);

    this.b.ref<HTMLInputElement>(tonicRef).addEventListener("input", (event) =>
      dispatch({
        type: "SET_TONIC",
        tonic: Number((event.target as HTMLInputElement).value),
      }),
    );
    const bindCadenceButton = (
      slotRef: typeof slowCadenceRef,
      speed: CadenceSpeed,
    ) => {
      this.b.bindSlot(slotRef, (state) => {
        const id: PlayButtonId = `options:cadence:${speed}`;
        const playback = ctx.play.getState();
        const playing =
          playback.status === "playing" && playback.buttonId === id;
        return show(
          PlayButtonView,
          {
            id,
            label: speed,
            ariaLabel: `select ${speed} cadence speed and preview cadence`,
            icon: "play",
            variant: "compact",
            visible: true,
            playing,
            selected: state.cadenceSpeed === speed,
            durationMs: playing ? playback.durationMs : undefined,
          },
          {},
          () => dispatch({ type: "SET_CADENCE_SPEED", speed }),
        );
      });
    };
    bindCadenceButton(slowCadenceRef, "slow");
    bindCadenceButton(mediumCadenceRef, "medium");
    bindCadenceButton(fastCadenceRef, "fast");
    this.b.bindSlot(tonicButtonRef, (state) => {
      const id: PlayButtonId = "options:tonic";
      const playback = ctx.play.getState();
      const playing = playback.status === "playing" && playback.buttonId === id;
      return show(
        PlayButtonView,
        {
          id,
          label: noteName(state.tonic),
          ariaLabel: "play home note",
          icon: "play",
          variant: "compact",
          visible: true,
          playing,
          durationMs: playing ? playback.durationMs : undefined,
        },
        {},
        () => dispatch({ type: "PREVIEW" }),
      );
    });
    this.b
      .ref<HTMLInputElement>(tonicRef)
      .addEventListener("change", () => dispatch({ type: "PREVIEW" }));
    onActivate(this.b.ref(micToggleRef), () =>
      dispatch({ type: "TOGGLE_MIC" }),
    );
    onPress(this.b.ref(useHeardRef), () =>
      dispatch({ type: "USE_HEARD_NOTE" }),
    );
    this.b.bindText(micLabelRef, (s) =>
      s.mic.status === "off" || s.mic.status === "error"
        ? "sing a note"
        : "stop listening",
    );
    this.b.bindClass(micToggleRef, (s) =>
      s.mic.status === "listening" || s.mic.status === "starting"
        ? "listening"
        : "",
    );
    this.b.bindVisible(
      levelRef,
      (s) => s.mic.status === "listening" || s.mic.status === "starting",
    );
    this.b.bindStyle(levelFillRef, (s) => ({
      width:
        s.mic.status === "listening"
          ? `${Math.round(s.mic.meter * 100)}%`
          : "0%",
    }));
    this.b.bindVisible(heardRef, (s) => heardMidi(s.mic) !== undefined);
    this.b.bindVisible(useHeardRef, (s) => heardMidi(s.mic) !== undefined);
    this.b.bindText(heardNoteRef, (s) => {
      const heard = heardMidi(s.mic);
      return heard === undefined ? "" : noteName(heard);
    });
    this.b.bindText(heardCentsRef, (s) => {
      if (s.mic.status !== "listening" || !s.mic.pitch) return "";
      const cents = centsOff(s.mic.pitch.midi);
      return `${cents >= 0 ? "+" : ""}${cents} cents`;
    });
    this.b.bindText(micHintRef, (s) => {
      switch (s.mic.status) {
        case "off":
          return "Not sure where your voice sits? Sing or hum a comfortable note and we'll name it for you.";
        case "starting":
          return "Waiting for the microphone…";
        case "listening":
          if (s.mic.level < SILENCE_LEVEL)
            return "Listening — I can't hear anything yet.";
          if (!s.mic.pitch)
            return "I hear you — hold one steady vowel, like “ah”.";
          return "Keep humming — pick a note you can sing comfortably above and below.";
        case "error":
          return s.mic.message;
      }
    });
    this.b.bindText(errorRef, (s) => s.error ?? "");
    this.b.bindVisible(errorRef, (s) => s.error !== undefined);
    this.b.bindValue(tonicRef, (s) => String(s.tonic));
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
