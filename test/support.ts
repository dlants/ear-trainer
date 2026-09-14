/**
 * Test-only stand-ins for the pieces vitest used to provide. Playwright's
 * runner is deliberately minimal, so mocks and timer control live here.
 */

export type Mock<Args extends unknown[] = unknown[], R = void> = ((
  ...args: Args
) => R) & { calls: Args[] };

/** Minimal `vi.fn()`: records calls, optionally delegates to `impl`. */
export function fn<Args extends unknown[] = unknown[], R = void>(
  impl?: (...args: Args) => R,
): Mock<Args, R> {
  const calls: Args[] = [];
  const mock = ((...args: Args): R => {
    calls.push(args);
    return impl ? impl(...args) : (undefined as R);
  }) as Mock<Args, R>;
  mock.calls = calls;
  return mock;
}

type Pending = { id: number; due: number; run: () => void };

/**
 * Replaces `setTimeout`/`clearTimeout` on `globalThis` with a manually advanced
 * clock. Awaiting `advance` drains microtasks between each fired timer so
 * promise chains scheduled by a timeout settle before the next one runs.
 */
export function fakeTimers(): {
  advance(ms: number): Promise<void>;
  runAll(): Promise<void>;
  restore(): void;
} {
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  let now = 0;
  let nextId = 1;
  let pending: Pending[] = [];

  globalThis.setTimeout = ((run: () => void, ms = 0) => {
    const id = nextId++;
    pending.push({ id, due: now + ms, run });
    return id as unknown as ReturnType<typeof setTimeout>;
  }) as typeof setTimeout;
  globalThis.clearTimeout = ((id: number) => {
    pending = pending.filter((timer) => timer.id !== id);
  }) as typeof clearTimeout;

  const flush = () =>
    new Promise<void>((resolve) => realSetTimeout(resolve, 0));

  const fireUntil = async (limit: number) => {
    for (;;) {
      const next = pending
        .filter((timer) => timer.due <= limit)
        .sort((a, b) => a.due - b.due)[0];
      if (!next) break;
      pending = pending.filter((timer) => timer !== next);
      now = next.due;
      next.run();
      await flush();
    }
    now = limit;
  };

  return {
    advance: (ms) => fireUntil(now + ms),
    runAll: async () => {
      while (pending.length > 0) {
        const furthest = Math.max(...pending.map((timer) => timer.due));
        await fireUntil(furthest);
      }
    },
    restore() {
      globalThis.setTimeout = realSetTimeout;
      globalThis.clearTimeout = realClearTimeout;
      pending = [];
    },
  };
}

/** Empty page for browser-side unit tests that mount a view themselves. */
export const HARNESS_URL = "/test/blank.html";
