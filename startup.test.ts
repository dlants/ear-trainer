import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AudioEngine,
  PlaybackEnd,
  PlaybackHandle,
} from "./audio/engine.ts";
import { DISMISS_KEY } from "./pwa/install.ts";
import { startStartup } from "./startup.ts";

function deferred<T>() {
  let resolve = (_value: T | PromiseLike<T>): void => {
    throw new Error("deferred promise is not initialized");
  };
  let reject = (_reason?: unknown): void => {
    throw new Error("deferred promise is not initialized");
  };
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const completedHandle = (): PlaybackHandle => ({
  durationMs: 0,
  ended: Promise.resolve<PlaybackEnd>("completed"),
  cancel() {},
});

class FakeAudio implements AudioEngine {
  unlocked = false;
  readonly attempts: ReturnType<typeof deferred<void>>[] = [];
  readonly played: number[] = [];

  unlock(): Promise<void> {
    const attempt = deferred<void>();
    this.attempts.push(attempt);
    return attempt.promise.then(() => {
      this.unlocked = true;
    });
  }

  setDrone(): void {}
  playContext(): PlaybackHandle {
    return completedHandle();
  }

  playPattern(): PlaybackHandle {
    return completedHandle();
  }

  playNote(note: number): PlaybackHandle {
    this.played.push(note);
    return completedHandle();
  }
}

function appContainer(): HTMLElement {
  const container = document.getElementById("app");
  if (!container) throw new Error("missing app container");
  return container;
}

function clickButton(container: HTMLElement, label: string): void {
  const button = [...container.querySelectorAll("button")].find(
    (candidate) => candidate.textContent === label,
  );
  if (!button) throw new Error(`missing button: ${label}`);
  button.click();
}

function standaloneWindow(): Window {
  return {
    navigator: { standalone: true, userAgent: "iPhone" },
    matchMedia: () => ({ matches: true }),
  } as unknown as Window;
}

describe("startup", () => {
  beforeEach(() => {
    history.replaceState(null, "", "/");
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
  });

  it("renders the about page without unlocking audio", () => {
    history.replaceState(null, "", "/about");
    const container = appContainer();
    const audio = new FakeAudio();

    startStartup({
      container,
      audio,
      window,
      storage: localStorage,
      ready: vi.fn(),
    });

    expect(container.textContent).toContain("My journey with ear training");
    expect(
      container.querySelector('summary[aria-label="open navigation menu"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('a[href="/about"][aria-current="page"]'),
    ).not.toBeNull();
    expect(audio.attempts).toHaveLength(0);
  });

  it("continues from the install prompt to the app", () => {
    const container = appContainer();
    const audio = new FakeAudio();
    const ready = vi.fn();

    startStartup({
      container,
      audio,
      window,
      storage: localStorage,
      ready,
    });

    expect(container.textContent).toContain(
      "install the ecological ear trainer",
    );
    clickButton(container, "continue in browser");

    expect(localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(ready).toHaveBeenCalledWith(audio);
    expect(audio.attempts).toHaveLength(0);
  });

  it("takes an installed launch straight to the app", () => {
    const container = appContainer();
    const audio = new FakeAudio();
    const ready = vi.fn();

    startStartup({
      container,
      audio,
      window: standaloneWindow(),
      storage: localStorage,
      ready,
    });

    expect(container.textContent).not.toContain(
      "install the ecological ear trainer",
    );
    expect(ready).toHaveBeenCalledWith(audio);
  });
});
