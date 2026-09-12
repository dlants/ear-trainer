import type { InstallEnv } from "../pwa/install.ts";
import { Binder, cls, mountStyle, ref, sanitize, type View } from "../vamp.ts";

export type State = { env: InstallEnv };

export type Msg = { type: "DISMISS" };

const screenClass = cls("install");

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
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}
.${screenClass} h1 { font-size: 24px; margin: 0; }
.${screenClass} ol { margin: 0; padding-left: 20px; }
.${screenClass} button {
  font-size: 18px;
  padding: 16px;
  border-radius: 12px;
  touch-action: manipulation;
}
`);

export class InstallView implements View<State, Msg> {
  container: HTMLElement;
  private b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
  ) {
    const stepsRef = ref("steps");
    const otherRef = ref("other");
    const dismissRef = ref("dismiss");

    this.container = container;
    container.innerHTML = sanitize`
      <div class="${screenClass}">
        <h1>install ear trainer</h1>
        <p>
          add it to your home screen so it opens offline and your practice
          history is never evicted by the browser.
        </p>
        <ol data-ref="${stepsRef}">
          <li>tap the share button in Safari's toolbar</li>
          <li>choose "Add to Home Screen"</li>
          <li>open ear trainer from the home screen icon</li>
        </ol>
        <p data-ref="${otherRef}">
          use your browser's "install" or "add to home screen" action.
        </p>
        <button type="button" data-ref="${dismissRef}">continue in browser</button>
      </div>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref(dismissRef)
      .addEventListener("click", () => dispatch({ type: "DISMISS" }));

    this.b.bindVisible(stepsRef, (s) => s.env.ios);
    this.b.bindVisible(otherRef, (s) => !s.env.ios);
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
