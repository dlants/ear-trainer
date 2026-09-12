import type { AudioEngine } from "../audio/engine.ts";
import { Binder, cls, mountStyle, ref, sanitize, type View } from "../vamp.ts";

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
  touch-action: manipulation;
}
`);

export class StartView implements View<State, Msg> {
  container: HTMLElement;
  private readonly b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
  ) {
    const errorRef = ref("error");
    const startRef = ref("start");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${screenClass}">
        <h1>ear trainer</h1>
        <p>Turn on sound to begin practicing.</p>
        <p class="${errorClass}" data-ref="${errorRef}" role="alert"></p>
        <button type="button" data-ref="${startRef}"></button>
      </section>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref(startRef)
      .addEventListener("click", () => dispatch({ type: "UNLOCK" }));
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
