import type { CadenceSpeed } from "../audio/engine.ts";
import {
  type MicPitchDetector,
  type MicPitchMsg,
  nearestMidi,
  type Pitch,
  SILENCE_LEVEL,
  SPECTROGRAM_DURATION_SECONDS,
  SPECTROGRAM_FRAME_COUNT,
  SPECTROGRAM_MAX_MIDI,
  SPECTROGRAM_MIN_MIDI,
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

export const MIN_SINGING_NOTE: Midi = 36;
export const MAX_SINGING_NOTE: Midi = 84;
export const MIN_SINGING_SPAN = 12;

type SpectrogramFrame = {
  spectrum: number[];
  pitchMidi: number | undefined;
};

export type MicState =
  | { status: "off" }
  | { status: "starting" }
  | {
      status: "listening";
      level: number;
      meter: number;
      pitch: Pitch | undefined;
      frames: (SpectrogramFrame | undefined)[];
      nextFrame: number;
    }
  | { status: "error"; message: string };

export type State = {
  lowNote: Midi;
  highNote: Midi;
  cadenceSpeed: CadenceSpeed;
  mic: MicState;
  error: string | undefined;
};

export type Msg =
  | { type: "SET_LOW_NOTE"; note: Midi }
  | { type: "SET_HIGH_NOTE"; note: Midi }
  | { type: "SET_CADENCE_SPEED"; speed: CadenceSpeed }
  | { type: "PREVIEW"; target: "low" | "high" }
  | { type: "TOGGLE_MIC" }
  | { type: "MIC_MSG"; msg: MicPitchMsg }
  | { type: "USE_HEARD_NOTE"; target: "low" | "high" }
  | { type: "ERROR"; message: string };

export type OptionsCtx = {
  play: PlayController;
  profile: Profile;
  profiles: ProfileStore;
  mic: MicPitchDetector;
};

export function initialState(ctx: OptionsCtx): State {
  return {
    lowNote: ctx.profile.lowNote,
    highNote: ctx.profile.highNote,
    cadenceSpeed: ctx.profile.cadenceSpeed,
    mic: { status: "off" },
    error: undefined,
  };
}

function clampNote(note: Midi): Midi {
  return Math.max(MIN_SINGING_NOTE, Math.min(MAX_SINGING_NOTE, note));
}

function setLowNote(state: State, note: Midi): void {
  state.lowNote = Math.min(
    clampNote(note),
    MAX_SINGING_NOTE - MIN_SINGING_SPAN,
  );
  state.highNote = Math.max(state.highNote, state.lowNote + MIN_SINGING_SPAN);
}

function setHighNote(state: State, note: Midi): void {
  state.highNote = Math.max(
    clampNote(note),
    MIN_SINGING_NOTE + MIN_SINGING_SPAN,
  );
  state.lowNote = Math.min(state.lowNote, state.highNote - MIN_SINGING_SPAN);
}

function persist(state: State, ctx: OptionsCtx): void {
  ctx.profile.lowNote = state.lowNote;
  ctx.profile.highNote = state.highNote;
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
    tonic: state.lowNote + 7,
    speed,
  };
  state.error = undefined;
  ctx.play.toggle(buttonId, step);
}

function preview(state: State, target: "low" | "high", ctx: OptionsCtx): void {
  const buttonId: PlayButtonId = `options:${target}-note`;
  const note = target === "low" ? state.lowNote : state.highNote;
  const step: PlayStep = { buttonId, type: "notes", notes: [note] };
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
        frames: new Array<SpectrogramFrame | undefined>(
          SPECTROGRAM_FRAME_COUNT,
        ).fill(undefined),
        nextFrame: 0,
      };
      break;
    case "MIC_READING":
      if (state.mic.status === "listening") {
        const frames = [...state.mic.frames];
        frames[state.mic.nextFrame] = {
          spectrum: msg.reading.spectrum,
          pitchMidi: msg.reading.pitch?.midi,
        };
        state.mic = {
          status: "listening",
          level: msg.reading.level,
          meter: msg.reading.meter,
          pitch: msg.reading.pitch ?? state.mic.pitch,
          frames,
          nextFrame: (state.mic.nextFrame + 1) % SPECTROGRAM_FRAME_COUNT,
        };
      }
      break;
    case "MIC_ERROR":
      state.mic = { status: "error", message: msg.message };
      break;
  }
}

export function update(state: State, msg: Msg, ctx: OptionsCtx): void {
  switch (msg.type) {
    case "SET_LOW_NOTE":
      setLowNote(state, msg.note);
      persist(state, ctx);
      break;
    case "SET_HIGH_NOTE":
      setHighNote(state, msg.note);
      persist(state, ctx);
      break;
    case "SET_CADENCE_SPEED":
      state.cadenceSpeed = msg.speed;
      persist(state, ctx);
      previewCadence(state, msg.speed, ctx);
      break;
    case "PREVIEW":
      preview(state, msg.target, ctx);
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
        if (msg.target === "low") setLowNote(state, heard);
        else setHighNote(state, heard);
        persist(state, ctx);
        preview(state, msg.target, ctx);
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

function color(canvas: HTMLCanvasElement, token: string): string {
  return getComputedStyle(canvas).getPropertyValue(token).trim();
}

function drawSpectrogram(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  mic: MicState,
): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0) return;

  const scale = window.devicePixelRatio || 1;
  const pixelWidth = Math.round(width * scale);
  const pixelHeight = Math.round(height * scale);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  context.setTransform(scale, 0, 0, scale, 0, 0);

  const surface = color(canvas, "--color-surface");
  const border = color(canvas, "--color-border");
  const muted = color(canvas, "--color-text-muted");
  const energy = color(canvas, "--color-brand");
  const pitch = color(canvas, "--color-text");
  const pitchCenter = color(canvas, "--color-surface");
  context.globalAlpha = 1;
  context.fillStyle = surface;
  context.fillRect(0, 0, width, height);

  const labelWidth = 34;
  const timeHeight = 20;
  const plotLeft = labelWidth;
  const plotTop = 4;
  const plotWidth = Math.max(1, width - labelWidth - 4);
  const plotHeight = Math.max(1, height - timeHeight - plotTop);
  const noteCount = SPECTROGRAM_MAX_MIDI - SPECTROGRAM_MIN_MIDI + 1;
  const noteHeight = plotHeight / noteCount;
  const frameWidth = plotWidth / SPECTROGRAM_FRAME_COUNT;

  if (mic.status === "listening") {
    context.fillStyle = energy;
    for (let frameIndex = 0; frameIndex < mic.frames.length; frameIndex++) {
      const frame = mic.frames[frameIndex];
      if (!frame) continue;
      const x = plotLeft + frameIndex * frameWidth;
      for (let noteIndex = 0; noteIndex < noteCount; noteIndex++) {
        const level = frame.spectrum[noteIndex] ?? 0;
        if (level <= 0) continue;
        context.globalAlpha = level * level;
        const y = plotTop + (noteCount - noteIndex - 1) * noteHeight;
        context.fillRect(x, y, Math.max(1, frameWidth + 0.5), noteHeight + 0.5);
      }
    }

    context.globalAlpha = 1;
    for (let frameIndex = 0; frameIndex < mic.frames.length; frameIndex++) {
      const midi = mic.frames[frameIndex]?.pitchMidi;
      if (midi === undefined) continue;
      const x = plotLeft + (frameIndex + 0.5) * frameWidth;
      const y =
        plotTop +
        ((SPECTROGRAM_MAX_MIDI - midi + 0.5) / noteCount) * plotHeight;
      context.beginPath();
      context.arc(x, y, 2.2, 0, Math.PI * 2);
      context.fillStyle = pitchCenter;
      context.fill();
      context.lineWidth = 1.2;
      context.strokeStyle = pitch;
      context.stroke();
    }
  }

  context.globalAlpha = 1;
  context.strokeStyle = border;
  context.fillStyle = muted;
  context.lineWidth = 1;
  context.font = "11px system-ui, sans-serif";
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (
    let midi = SPECTROGRAM_MIN_MIDI;
    midi <= SPECTROGRAM_MAX_MIDI;
    midi += 12
  ) {
    const y =
      plotTop + ((SPECTROGRAM_MAX_MIDI - midi + 0.5) / noteCount) * plotHeight;
    context.beginPath();
    context.moveTo(plotLeft, y);
    context.lineTo(plotLeft + plotWidth, y);
    context.stroke();
    context.fillText(noteName(midi), plotLeft - 4, y);
  }

  context.textAlign = "center";
  context.textBaseline = "top";
  for (
    let seconds = 0;
    seconds <= SPECTROGRAM_DURATION_SECONDS;
    seconds += 10
  ) {
    const x = plotLeft + (seconds / SPECTROGRAM_DURATION_SECONDS) * plotWidth;
    context.beginPath();
    context.moveTo(x, plotTop);
    context.lineTo(x, plotTop + plotHeight);
    context.stroke();
    context.fillText(`${seconds}s`, x, plotTop + plotHeight + 4);
  }

  if (mic.status === "listening") {
    const sweepX =
      plotLeft + (mic.nextFrame / SPECTROGRAM_FRAME_COUNT) * plotWidth;
    context.strokeStyle = energy;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(sweepX, plotTop);
    context.lineTo(sweepX, plotTop + plotHeight);
    context.stroke();
  }
}

const optionsClass = cls("options");
const fieldClass = cls("options-field");
const playSlotClass = cls("options-play-slot");
const rangeClass = cls("options-range");
const rangeTrackClass = cls("options-range-track");
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
.${optionsClass} .${rangeClass} {
  position: relative;
  height: 44px;
  margin: 0 8px;
}
.${optionsClass} .${rangeTrackClass} {
  position: absolute;
  inset: 0 12px;
}
.${optionsClass} .${rangeTrackClass} .rail,
.${optionsClass} .${rangeTrackClass} .fill {
  position: absolute;
  top: 20px;
  height: 4px;
  border-radius: 2px;
}
.${optionsClass} .${rangeTrackClass} .rail {
  inset-inline: 0;
  background: var(--color-border);
}
.${optionsClass} .${rangeTrackClass} .fill {
  left: var(--range-low);
  right: calc(100% - var(--range-high));
  background: var(--color-brand);
}
.${optionsClass} .${rangeClass} input[type="range"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 44px;
  margin: 0;
  background: transparent;
  pointer-events: none;
  appearance: none;
}
.${optionsClass} .${rangeClass} input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  background: transparent;
}
.${optionsClass} .${rangeClass} input[type="range"]::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  margin-top: -10px;
  border: 2px solid var(--color-brand);
  border-radius: 50%;
  background: var(--color-surface);
  pointer-events: auto;
  appearance: none;
}
.${optionsClass} .${rangeClass} input[type="range"]::-moz-range-track {
  height: 4px;
  background: transparent;
}
.${optionsClass} .${rangeClass} input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-brand);
  border-radius: 50%;
  background: var(--color-surface);
  pointer-events: auto;
}
.${optionsClass} .octave-ticks {
  display: flex;
  justify-content: space-between;
  margin: -7px 20px 0;
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
.${optionsClass} .${micClass} canvas {
  flex: 1 0 100%;
  width: 100%;
  height: 240px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
  box-sizing: border-box;
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
    const lowNoteRef = ref("low-note");
    const highNoteRef = ref("high-note");
    const lowNoteButtonRef = ref("low-note-button");
    const highNoteButtonRef = ref("high-note-button");
    const rangeRef = ref("singing-range");
    const slowCadenceRef = ref("slow-cadence");
    const mediumCadenceRef = ref("medium-cadence");
    const fastCadenceRef = ref("fast-cadence");
    const micToggleRef = ref("mic-toggle");
    const micLabelRef = ref("mic-label");
    const micHintRef = ref("mic-hint");
    const spectrogramRef = ref("spectrogram");
    const useHeardLowRef = ref("use-heard-low");
    const useHeardHighRef = ref("use-heard-high");
    const levelRef = ref("level");
    const levelFillRef = ref("level-fill");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${optionsClass}">
        <h1>options</h1>
        <p data-ref="${errorRef}"></p>
        <fieldset>
          <legend>singing range</legend>
          <p class="intro">Set the lowest and highest notes you can sing comfortably. Keys are chosen so a fifth below the tonic through an octave above it stays inside this range.</p>
          <div class="${fieldClass}">
            <div class="field-head">
              <div>
                <label for="${lowNoteRef}">lowest note</label>
                <div class="${playSlotClass}" data-ref="${lowNoteButtonRef}"></div>
              </div>
              <div>
                <label for="${highNoteRef}">highest note</label>
                <div class="${playSlotClass}" data-ref="${highNoteButtonRef}"></div>
              </div>
            </div>
            <div class="${rangeClass}" data-ref="${rangeRef}">
              <div class="${rangeTrackClass}" aria-hidden="true">
                <span class="rail"></span>
                <span class="fill"></span>
              </div>
              <input id="${lowNoteRef}" aria-label="lowest note" type="range" min="${MIN_SINGING_NOTE}" max="${MAX_SINGING_NOTE}" step="1" data-ref="${lowNoteRef}">
              <input id="${highNoteRef}" aria-label="highest note" type="range" min="${MIN_SINGING_NOTE}" max="${MAX_SINGING_NOTE}" step="1" data-ref="${highNoteRef}">
            </div>
            <div class="octave-ticks" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="${micClass}">
            <button type="button" data-ref="${micToggleRef}">
              ${micIcon()}<span data-ref="${micLabelRef}"></span>
            </button>
            <button type="button" data-ref="${useHeardLowRef}">use as lowest note</button>
            <button type="button" data-ref="${useHeardHighRef}">use as highest note</button>
            <canvas data-ref="${spectrogramRef}" role="img" aria-label="Live pitch spectrogram: notes run vertically and the 30 second timeline runs left to right, then repeats.">Live pitch spectrogram</canvas>
            <div class="level" data-ref="${levelRef}" aria-hidden="true">
              <span data-ref="${levelFillRef}"></span>
            </div>
          </div>
          <p class="hint" data-ref="${micHintRef}"></p>
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

    this.b
      .ref<HTMLInputElement>(lowNoteRef)
      .addEventListener("input", (event) =>
        dispatch({
          type: "SET_LOW_NOTE",
          note: Number((event.target as HTMLInputElement).value),
        }),
      );
    this.b
      .ref<HTMLInputElement>(highNoteRef)
      .addEventListener("input", (event) =>
        dispatch({
          type: "SET_HIGH_NOTE",
          note: Number((event.target as HTMLInputElement).value),
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
    const bindNoteButton = (
      slotRef: typeof lowNoteButtonRef,
      target: "low" | "high",
    ) => {
      this.b.bindSlot(slotRef, (state) => {
        const id: PlayButtonId = `options:${target}-note`;
        const note = target === "low" ? state.lowNote : state.highNote;
        const playback = ctx.play.getState();
        const playing =
          playback.status === "playing" && playback.buttonId === id;
        return show(
          PlayButtonView,
          {
            id,
            label: noteName(note),
            ariaLabel: `play ${target === "low" ? "lowest" : "highest"} note`,
            icon: "play",
            variant: "compact",
            visible: true,
            playing,
            durationMs: playing ? playback.durationMs : undefined,
          },
          {},
          () => dispatch({ type: "PREVIEW", target }),
        );
      });
    };
    bindNoteButton(lowNoteButtonRef, "low");
    bindNoteButton(highNoteButtonRef, "high");
    const bindSliderPreview = (
      sliderRef: typeof lowNoteRef,
      target: "low" | "high",
    ) => {
      const slider = this.b.ref<HTMLInputElement>(sliderRef);
      const preview = () => dispatch({ type: "PREVIEW", target });
      slider.addEventListener("pointerup", preview);
      slider.addEventListener("keyup", preview);
    };
    bindSliderPreview(lowNoteRef, "low");
    bindSliderPreview(highNoteRef, "high");
    onActivate(this.b.ref(micToggleRef), () =>
      dispatch({ type: "TOGGLE_MIC" }),
    );
    onPress(this.b.ref(useHeardLowRef), () =>
      dispatch({ type: "USE_HEARD_NOTE", target: "low" }),
    );
    onPress(this.b.ref(useHeardHighRef), () =>
      dispatch({ type: "USE_HEARD_NOTE", target: "high" }),
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
    this.b.bindVisible(
      spectrogramRef,
      (s) => s.mic.status === "listening" || s.mic.status === "starting",
    );
    this.b.bindCanvas(spectrogramRef, (context, canvas, state) =>
      drawSpectrogram(context, canvas, state.mic),
    );
    this.b.bindVisible(useHeardLowRef, (s) => heardMidi(s.mic) !== undefined);
    this.b.bindVisible(useHeardHighRef, (s) => heardMidi(s.mic) !== undefined);
    this.b.bindText(micHintRef, (s) => {
      switch (s.mic.status) {
        case "off":
          return "Not sure where your voice sits? Sing or hum and watch where your voice lands.";
        case "starting":
          return "Waiting for the microphone…";
        case "listening":
          if (s.mic.level < SILENCE_LEVEL)
            return "Listening — I can't hear anything yet.";
          if (!s.mic.pitch)
            return "I hear you — hold one steady vowel, like “ah”.";
          return "Keep humming — the outlined trace marks the detected pitch over the spectrum.";
        case "error":
          return s.mic.message;
      }
    });
    this.b.bindText(errorRef, (s) => s.error ?? "");
    this.b.bindVisible(errorRef, (s) => s.error !== undefined);
    this.b.bindStyle(rangeRef, (s) => ({
      "--range-low": `${((s.lowNote - MIN_SINGING_NOTE) / (MAX_SINGING_NOTE - MIN_SINGING_NOTE)) * 100}%`,
      "--range-high": `${((s.highNote - MIN_SINGING_NOTE) / (MAX_SINGING_NOTE - MIN_SINGING_NOTE)) * 100}%`,
    }));
    this.b.bindValue(lowNoteRef, (s) => String(s.lowNote));
    this.b.bindValue(highNoteRef, (s) => String(s.highNote));
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
