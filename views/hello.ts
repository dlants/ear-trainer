import { Binder, cls, mountStyle, ref, sanitize, type View } from "../vamp.ts";

export interface State {
  taps: number;
}

export type Msg = { type: "TAP" };

export function update(state: State, msg: Msg): void {
  switch (msg.type) {
    case "TAP":
      state.taps++;
      break;
  }
}

const helloClass = cls("hello");

mountStyle(`
.${helloClass} {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  font-family: system-ui, sans-serif;
}
.${helloClass} button {
  font-size: 24px;
  padding: 16px 32px;
}
`);

export class HelloView implements View<State, Msg> {
  container: HTMLElement;
  private b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initialState: State,
  ) {
    const tapsRef = ref("taps");
    const buttonRef = ref("button");
    this.container = container;
    container.innerHTML = sanitize`
      <div class="${helloClass}">
        <h1>ear trainer</h1>
        <span data-ref="${tapsRef}"></span>
        <button type="button" data-ref="${buttonRef}">tap</button>
      </div>
    `;
    this.b = new Binder(container, initialState);
    this.b
      .ref(buttonRef)
      .addEventListener("click", () => dispatch({ type: "TAP" }));
    this.b.bindText(tapsRef, (s: State) => `taps: ${s.taps}`);
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
