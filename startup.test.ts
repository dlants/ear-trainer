import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AudioEngine,
  PlaybackEnd,
  PlaybackHandle,
} from "./audio/engine.ts";
import { PlayController } from "./audio/play-controller.ts";
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
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
  });

  it("constructs app dependencies only after a successful unlock gesture", async () => {
    const container = appContainer();
    const audio = new FakeAudio();
    let constructed = false;

    startStartup({
      container,
      audio,
      window: standaloneWindow(),
      storage: localStorage,
      ready: (unlockedAudio) => {
        const play = new PlayController(unlockedAudio, vi.fn());
        constructed = true;
        play.autoplay([{ buttonId: "options:tonic", type: "note", note: 60 }]);
      },
    });

    expect(constructed).toBe(false);
    expect(audio.attempts).toHaveLength(0);
    clickButton(container, "start practicing");
    expect(audio.attempts).toHaveLength(1);
    expect(constructed).toBe(false);

    audio.attempts[0].resolve();
    await audio.attempts[0].promise;
    await vi.waitFor(() => expect(constructed).toBe(true));

    expect(audio.unlocked).toBe(true);
    expect(audio.played).toEqual([60]);
  });

  it("shows an unlock failure and allows retry without mounting the app", async () => {
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

    clickButton(container, "start practicing");
    audio.attempts[0].reject(new Error("audio blocked"));
    await vi.waitFor(() =>
      expect(container.textContent).toContain("Error: audio blocked"),
    );
    expect(ready).not.toHaveBeenCalled();

    clickButton(container, "try again");
    expect(audio.attempts).toHaveLength(2);
    audio.attempts[1].resolve();
    await vi.waitFor(() => expect(ready).toHaveBeenCalledWith(audio));
  });

  it("continues from the install prompt to the audio gate", () => {
    const container = appContainer();
    const audio = new FakeAudio();

    startStartup({
      container,
      audio,
      window,
      storage: localStorage,
      ready: vi.fn(),
    });

    expect(container.textContent).toContain("install ear trainer");
    clickButton(container, "continue in browser");

    expect(localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(container.textContent).toContain(
      "Turn on sound to begin practicing.",
    );
    expect(audio.attempts).toHaveLength(0);
  });

  it("takes an installed launch directly to the audio gate", () => {
    const container = appContainer();

    startStartup({
      container,
      audio: new FakeAudio(),
      window: standaloneWindow(),
      storage: localStorage,
      ready: vi.fn(),
    });

    expect(container.textContent).not.toContain("install ear trainer");
    expect(container.textContent).toContain(
      "Turn on sound to begin practicing.",
    );
  });
});
