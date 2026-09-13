import type { CadenceSpeed } from "../audio/engine.ts";
import type {
  PlayButtonId,
  PlayController,
  PlayStep,
} from "../audio/play-controller.ts";
import type { Profile, ProfileStore } from "../deck/profiles.ts";
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
  tonic: Midi;
  cadenceSpeed: CadenceSpeed;
  error: string | undefined;
};

export type Msg =
  | { type: "SET_TONIC"; tonic: Midi }
  | { type: "SET_CADENCE_SPEED"; speed: CadenceSpeed }
  | { type: "PREVIEW" }
  | { type: "ERROR"; message: string };

export type OptionsCtx = {
  play: PlayController;
  profile: Profile;
  profiles: ProfileStore;
};

export function initialState(ctx: OptionsCtx): State {
  return {
    tonic: ctx.profile.tonic,
    cadenceSpeed: ctx.profile.cadenceSpeed,
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
