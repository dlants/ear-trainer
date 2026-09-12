import { beforeEach, describe, expect, it } from "vitest";
import { HelloView, type Msg, type State, update } from "./hello.ts";

function mount() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const state: State = { taps: 0 };
  const view = new HelloView(container, dispatch, state);
  function dispatch(msg: Msg): void {
    update(state, msg);
    view.sync(state);
  }
  return { container, state, view };
}

describe("HelloView", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders bound state on mount", () => {
    const { container } = mount();
    expect(container.textContent).toContain("taps: 0");
  });

  it("syncs bindings when state changes via dispatch", () => {
    const { container } = mount();
    container.querySelector("button")?.click();
    expect(container.textContent).toContain("taps: 1");
  });

  it("destroys cleanly", () => {
    const { container, view } = mount();
    view.destroy();
    expect(container.innerHTML).toBe("");
  });
});
