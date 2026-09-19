import type { PlayButtonId } from "../audio/play-controller.ts";
import {
  arrowRightIcon,
  droneIcon,
  eyeIcon,
  gearIcon,
  keyIcon,
  pauseIcon,
  playIcon,
  restartIcon,
  shuffleIcon,
} from "../icons.ts";
import {
  Binder,
  cls,
  mountStyle,
  onPress,
  ref,
  sanitize,
  type View,
} from "../vamp.ts";

/** Controls that share the button chrome without starting playback. */
export type ActionButtonId =
  | "identify:change-key"
  | "identify:situations"
  | "identify:reveal"
  | "identify:next";

export type PlayButtonIcon =
  | "key"
  | "play"
  | "pause"
  | "restart"
  | "drone"
  | "gear"
  | "shuffle"
  | "eye"
  | "next";
export type PlayButtonVariant = "trial" | "compact";

export type PlayButtonState = {
  id: PlayButtonId | ActionButtonId;
  label: string;
  ariaLabel: string;
  icon: PlayButtonIcon;
  variant: PlayButtonVariant;
  visible: boolean;
  playing: boolean;
  selected?: boolean;
  disabled?: boolean;
  durationMs: number | undefined;
  animated?: boolean;
};

export type PlayButtonMsg = {
  type: "PRESS";
  id: PlayButtonId | ActionButtonId;
};

const buttonClass = cls("play-button");
const trialClass = cls("play-button-trial");
const compactClass = cls("play-button-compact");
const playingClass = cls("play-button-playing");
const selectedClass = cls("play-button-selected");
const contentClass = cls("play-button-content");
const iconClass = cls("play-button-icon");

mountStyle(`
.${buttonClass} {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-control);
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
  justify-content: center;
  gap: inherit;
  line-height: 1;
}
.${buttonClass} .${iconClass} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.${buttonClass} svg {
  flex: 0 0 auto;
}
.${buttonClass}.${trialClass} {
  width: 100%;
  box-sizing: border-box;
  min-height: 56px;
  padding: 8px 12px;
  font-size: 19px;
  font-weight: 700;
}
.${buttonClass}.${trialClass} svg {
  font-size: 1.15em;
}
.${buttonClass}.${compactClass} {
  box-sizing: border-box;
  min-height: 42px;
  padding: 0 14px;
  color: var(--color-brand);
  font-weight: 700;
}
.${buttonClass}.${compactClass} svg {
  font-size: 0.95em;
}
.${buttonClass}:disabled {
  opacity: 0.45;
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
    const iconRefs = {
      key: ref("keyIcon"),
      play: ref("playIcon"),
      pause: ref("pauseIcon"),
      restart: ref("restartIcon"),
      drone: ref("droneIcon"),
      gear: ref("gearIcon"),
      shuffle: ref("shuffleIcon"),
      eye: ref("eyeIcon"),
      next: ref("nextIcon"),
    };

    this.container = container;
    container.innerHTML = sanitize`
      <button type="button" data-ref="${buttonRef}">
        <span class="${contentClass}">
          <span class="${iconClass}" data-ref="${iconRefs.key}">${keyIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.play}">${playIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.pause}">${pauseIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.restart}">${restartIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.drone}">${droneIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.gear}">${gearIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.shuffle}">${shuffleIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.eye}">${eyeIcon()}</span>
          <span class="${iconClass}" data-ref="${iconRefs.next}">${arrowRightIcon()}</span>
          <span data-ref="${labelRef}"></span>
        </span>
      </button>
    `;
    this.b = new Binder(container, initial);

    onPress(this.b.ref(buttonRef), () =>
      dispatch({ type: "PRESS", id: initial.id }),
    );
    this.b.bindText(labelRef, (state) => state.label);
    for (const [icon, iconRef] of Object.entries(iconRefs)) {
      this.b.bindVisible(iconRef, (state) => state.icon === icon);
    }
    this.b.bindVisible(buttonRef, (state) => state.visible);
    this.b.bindDisabled(buttonRef, (state) => state.disabled === true);
    this.b.bindClass(buttonRef, (state) =>
      [
        buttonClass,
        state.variant === "trial" ? trialClass : compactClass,
        state.playing && state.animated !== false ? playingClass : "",
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
      if (
        state.playing &&
        state.animated !== false &&
        state.durationMs !== undefined
      ) {
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
