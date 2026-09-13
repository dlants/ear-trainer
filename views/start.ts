import type { AudioEngine } from "../audio/engine.ts";
import { githubIcon } from "../icons.ts";
import {
  Binder,
  cls,
  mountStyle,
  onPress,
  ref,
  sanitize,
  type View,
} from "../vamp.ts";
import { APP_VERSION } from "../version.ts";

export type State = {
  status: "idle" | "unlocking" | "error";
  error: string | undefined;
};

export type Msg =
  | { type: "UNLOCK" }
  | { type: "UNLOCKED" }
  | { type: "ERROR"; message: string };

export type StartCtx = { audio: AudioEngine };

export function initialState(): State {
  return { status: "idle", error: undefined };
}

export function update(
  state: State,
  msg: Msg,
  ctx: StartCtx,
  dispatch: (msg: Msg) => void,
): void {
  switch (msg.type) {
    case "UNLOCK":
      if (state.status === "unlocking") return;
      state.status = "unlocking";
      state.error = undefined;
      ctx.audio.unlock().then(
        () => dispatch({ type: "UNLOCKED" }),
        (error) => dispatch({ type: "ERROR", message: String(error) }),
      );
      break;
    case "UNLOCKED":
      break;
    case "ERROR":
      state.status = "error";
      state.error = msg.message;
      break;
  }
}

const screenClass = cls("start");
const errorClass = cls("start-error");
const cornerClass = cls("start-github");

mountStyle(`
.${screenClass} {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: max(24px, env(safe-area-inset-top)) 24px
    max(24px, env(safe-area-inset-bottom));
  min-height: 100dvh;
  box-sizing: border-box;
  justify-content: center;
  line-height: 1.5;
}
.${screenClass} h1 {
  margin: 0;
  font-size: 24px;
}
.${screenClass} p {
  margin: 0;
}
.${screenClass} .${errorClass} {
  color: var(--color-incorrect);
}
.${screenClass} button {
  padding: 16px;
  border-radius: var(--radius-control);
  font-size: 18px;
}
.${screenClass} h1 .version {
  color: var(--color-text-muted);
  font-size: 15px;
  font-weight: normal;
}
.${cornerClass} {
  position: fixed;
  top: 0;
  left: 0;
  width: 68px;
  height: 68px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: max(7px, env(safe-area-inset-top)) 0 0 7px;
  box-sizing: border-box;
  clip-path: polygon(0 0, 100% 0, 0 100%);
  background: var(--color-brand-strong);
  color: white;
  font-size: 20px;
}
.${screenClass} .about-link {
  align-self: center;
  color: var(--color-brand);
  text-underline-offset: 3px;
}
`);

export class StartView implements View<State, Msg, StartCtx> {
  container: HTMLElement;
  private readonly b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
    _ctx: StartCtx,
  ) {
    const errorRef = ref("error");
    const startRef = ref("start");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${screenClass}">
        <a class="${cornerClass}" href="https://github.com/dlants/ear-trainer"
           target="_blank" rel="noreferrer" aria-label="source code on GitHub">${githubIcon()}</a>
        <h1>the ecological ear trainer <span class="version">v${APP_VERSION}</span></h1>
        <p>Turn on sound to begin practicing.</p>
        <p class="${errorClass}" data-ref="${errorRef}" role="alert"></p>
        <button type="button" data-ref="${startRef}"></button>
        <a class="about-link" href="/about" data-router-ignore>about</a>
      </section>
    `;
    this.b = new Binder(container, initial);

    onPress(this.b.ref(startRef), () => dispatch({ type: "UNLOCK" }));
    this.b.bindText(errorRef, (state) => state.error ?? "");
    this.b.bindVisible(errorRef, (state) => state.error !== undefined);
    this.b.bindText(startRef, (state) => {
      if (state.status === "unlocking") return "starting…";
      if (state.status === "error") return "try again";
      return "start practicing";
    });
    this.b.bindDisabled(startRef, (state) => state.status === "unlocking");
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
