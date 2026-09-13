import type { PlayButtonId } from "../audio/play-controller.ts";
import { droneIcon, keyIcon, playIcon } from "../icons.ts";
import { Binder, cls, mountStyle, ref, sanitize, type View } from "../vamp.ts";

export type PlayButtonIcon = "key" | "play" | "drone";
export type PlayButtonVariant = "trial" | "compact";

export type PlayButtonState = {
  id: PlayButtonId;
  label: string;
  ariaLabel: string;
  icon: PlayButtonIcon;
  variant: PlayButtonVariant;
  visible: boolean;
  playing: boolean;
  selected?: boolean;
  durationMs: number | undefined;
};

export type PlayButtonMsg = { type: "PRESS"; id: PlayButtonId };

const buttonClass = cls("play-button");
const trialClass = cls("play-button-trial");
const compactClass = cls("play-button-compact");
const playingClass = cls("play-button-playing");
const selectedClass = cls("play-button-selected");
const contentClass = cls("play-button-content");

mountStyle(`
.${buttonClass} {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-control);
  touch-action: manipulation;
  cursor: pointer;
  isolation: isolate;
}
.${buttonClass}::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: var(--color-playback-sweep);
  transform: scaleX(0);
  transform-origin: left;
}
.${buttonClass}.${playingClass}::before {
  animation: play-button-sweep var(--play-duration) linear forwards;
}
.${buttonClass} .${contentClass} {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: inherit;
}
.${buttonClass} svg {
  flex: 0 0 auto;
}
.${buttonClass}.${trialClass} {
  width: 100%;
  padding: 20px 8px;
  font-size: 20px;
}
.${buttonClass}.${trialClass} svg {
  font-size: 1.15em;
}
.${buttonClass}.${compactClass} {
  padding: 7px 10px;
  color: var(--color-brand);
  font-weight: 700;
}
.${buttonClass}.${compactClass} svg {
  font-size: 0.95em;
}
.${buttonClass}.${selectedClass} {
  border-color: var(--color-brand-border);
  background: var(--color-brand-surface);
}
@keyframes play-button-sweep {
  to { transform: scaleX(1); }
}
@media (prefers-reduced-motion: reduce) {
  .${buttonClass}.${playingClass}::before {
    animation: none;
    transform: scaleX(1);
    background: var(--color-playback-active);
  }
}
`);

export class PlayButtonView implements View<PlayButtonState, PlayButtonMsg> {
  container: HTMLElement;
  private readonly b: Binder<PlayButtonState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: PlayButtonMsg) => void,
    initial: PlayButtonState,
  ) {
    const buttonRef = ref("button");
    const labelRef = ref("label");
    const icons = { key: keyIcon, play: playIcon, drone: droneIcon };
    const icon = icons[initial.icon]();

    this.container = container;
    container.innerHTML = sanitize`
      <button type="button" data-ref="${buttonRef}">
        <span class="${contentClass}"><span data-ref="${labelRef}"></span>${icon}</span>
      </button>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref(buttonRef)
      .addEventListener("click", () =>
        dispatch({ type: "PRESS", id: initial.id }),
      );
    this.b.bindText(labelRef, (state) => state.label);
    this.b.bindVisible(buttonRef, (state) => state.visible);
    this.b.bindClass(buttonRef, (state) =>
      [
        buttonClass,
        state.variant === "trial" ? trialClass : compactClass,
        state.playing ? playingClass : "",
        state.selected ? selectedClass : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
    this.b.bindAttr(buttonRef, "aria-label", (state) => state.ariaLabel);
    this.b.bindAttr(buttonRef, "aria-pressed", (state) =>
      String(state.selected ?? state.playing),
    );
    this.b.bindAttr(buttonRef, "aria-busy", (state) =>
      state.playing ? "true" : undefined,
    );
    this.b.bindStyle(buttonRef, (state) => {
      const styles: Record<string, string> = {};
      if (state.playing && state.durationMs !== undefined) {
        styles["--play-duration"] = `${state.durationMs}ms`;
      }
      return styles;
    });
  }

  sync(state: PlayButtonState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
