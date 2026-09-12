import { describe, expect, it, vi } from "vitest";
import { type PlayButtonState, PlayButtonView } from "./play-button.ts";

function state(overrides: Partial<PlayButtonState> = {}): PlayButtonState {
  return {
    id: "trial:context",
    label: "key",
    ariaLabel: "play key",
    icon: "key",
    variant: "trial",
    visible: true,
    playing: false,
    durationMs: undefined,
    ...overrides,
  };
}

describe("PlayButtonView", () => {
  it("emits PRESS with its stable id", () => {
    const container = document.createElement("div");
    const dispatch = vi.fn();
    new PlayButtonView(container, dispatch, state());

    container.querySelector("button")?.click();

    expect(dispatch).toHaveBeenCalledWith({
      type: "PRESS",
      id: "trial:context",
    });
  });

  it("binds active duration and accessibility state", () => {
    const container = document.createElement("div");
    const view = new PlayButtonView(container, () => {}, state());
    const button = container.querySelector("button");

    view.sync(state({ playing: true, durationMs: 1250 }));

    expect(button?.className).toContain("play-button-playing");
    expect(button?.style.getPropertyValue("--play-duration")).toBe("1250ms");
    expect(button?.getAttribute("aria-pressed")).toBe("true");
    expect(button?.getAttribute("aria-busy")).toBe("true");

    view.sync(state());

    expect(button?.className).not.toContain("play-button-playing");
    expect(button?.style.getPropertyValue("--play-duration")).toBe("");
    expect(button?.getAttribute("aria-pressed")).toBe("false");
    expect(button?.hasAttribute("aria-busy")).toBe(false);
  });

  it("mounts a reduced-motion active treatment", () => {
    const styles = [...document.head.querySelectorAll("style")]
      .map((element) => element.textContent)
      .join("\n");

    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("background: var(--color-playback-active)");
  });
});
