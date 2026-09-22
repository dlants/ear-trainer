import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("trial flow", () => {
  test("writes exactly one log entry per trial with the committed pair", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      const cardId = state.trial?.card.id;
      dispatch({ type: "COMMIT", confidence: "unsure" });
      const phase = state.trial?.phase;
      dispatch({ type: "GRADE", outcome: "got-it" });
      const log = env.deck.getState().log;
      return {
        cardId,
        phase,
        log: log.map((entry) => ({
          cardId: entry.cardId,
          confidence: entry.confidence,
          outcome: entry.outcome,
        })),
      };
    });
    expect(result.phase).toBe("revealing");
    expect(result.log).toHaveLength(1);
    expect(result.log[0]).toMatchObject({
      cardId: result.cardId,
      confidence: "unsure",
      outcome: "got-it",
    });
  });

  test("replays nothing into the deck, in either phase", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      const before = JSON.stringify(env.deck.getState());
      dispatch({ type: "PLAY_CONTEXT" });
      dispatch({ type: "PLAY_PATTERN" });
      dispatch({ type: "COMMIT", confidence: "known" });
      dispatch({ type: "PLAY_CONTEXT" });
      dispatch({ type: "PLAY_PATTERN" });
      return {
        unchanged: JSON.stringify(env.deck.getState()) === before,
        phase: state.trial?.phase,
      };
    });
    expect(result.unchanged).toBe(true);
    expect(result.phase).toBe("revealing");
  });

  test("autoplays context then pattern for a transcription presentation", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const { state } = start(env.ctx);
      const call = env.play.calls[0];
      return {
        mode: state.trial?.card.mode,
        callType: call?.type,
        steps: call?.type === "autoplay" ? call.steps : [],
        context: state.trial?.pattern.context,
        pattern: state.trial?.pattern,
      };
    });
    expect(result.mode).toBe("transcription");
    expect(result.callType).toBe("autoplay");
    expect(result.steps).toEqual([
      {
        buttonId: "trial:context",
        type: "context",
        context: result.context,
        tonic: 60,
        speed: "medium",
      },
      {
        buttonId: "trial:pattern",
        type: "pattern",
        pattern: result.pattern,
        tonic: 60,
      },
    ]);
  });

  test("autoplays only context and gates manual pattern play in audiation", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start, pattern, preferMode } = await import(
        "/test/trial-harness.ts"
      );
      const env = setupDue();
      preferMode(env.deck, pattern("1-3-5").id, "audiation");
      const { state, dispatch } = start(env.ctx);
      const call = env.play.calls[0];
      const first = {
        mode: state.trial?.card.mode,
        callType: call?.type,
        steps: call?.type === "autoplay" ? call.steps : [],
        context: state.trial?.pattern.context,
      };
      env.play.calls = [];
      dispatch({ type: "PLAY_PATTERN" });
      return { ...first, afterManualPlay: env.play.calls };
    });
    expect(result.mode).toBe("audiation");
    expect(result.callType).toBe("autoplay");
    expect(result.steps).toEqual([
      {
        buttonId: "trial:context",
        type: "context",
        context: result.context,
        tonic: 60,
        speed: "medium",
      },
    ]);
    expect(result.afterManualPlay).toEqual([]);
  });

  test("audiation reveal replaces presentation playback with only the pattern", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start, withMode } = await import(
        "/test/trial-harness.ts"
      );
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      withMode(state, env.deck, "audiation");
      env.play.calls = [];
      dispatch({ type: "COMMIT", confidence: "known" });
      const call = env.play.calls[0];
      const revealed = {
        callType: call?.type,
        steps: call?.type === "autoplay" ? call.steps : [],
        pattern: state.trial?.pattern,
      };
      dispatch({ type: "PLAY_PATTERN" });
      return { ...revealed, secondType: env.play.calls[1]?.type };
    });
    expect(result.callType).toBe("autoplay");
    expect(result.steps).toEqual([
      {
        buttonId: "trial:pattern",
        type: "pattern",
        pattern: result.pattern,
        tonic: 60,
      },
    ]);
    expect(result.secondType).toBe("toggle");
  });

  test("does not autoplay again when revealing a transcription trial", async ({
    page,
  }) => {
    const calls = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const { dispatch } = start(env.ctx);
      env.play.calls = [];
      dispatch({ type: "COMMIT", confidence: "known" });
      return env.play.calls;
    });
    expect(calls).toEqual([]);
  });

  test("plays pattern audio in transcription during presentation", async ({
    page,
  }) => {
    const last = await page.evaluate(async () => {
      const { setupDue, start, withMode } = await import(
        "/test/trial-harness.ts"
      );
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      withMode(state, env.deck, "transcription");
      dispatch({ type: "PLAY_PATTERN" });
      return env.play.calls.at(-1);
    });
    expect(last).toMatchObject({ type: "toggle", buttonId: "trial:pattern" });
  });

  test("uses the configured tonic on every trial", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      const first = state.trial?.tonic;
      dispatch({ type: "COMMIT", confidence: "known" });
      dispatch({ type: "GRADE", outcome: "missed" });
      return { first, next: state.trial?.tonic };
    });
    expect(result.first).toBe(60);
    expect(result.next).toBe(60);
  });

  test("replaces active trial playback when grading selects the next trial", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const { dispatch } = start(env.ctx);
      dispatch({ type: "COMMIT", confidence: "known" });
      env.play.calls = [];
      dispatch({ type: "GRADE", outcome: "got-it" });
      const call = env.play.calls[0];
      return {
        calls: env.play.calls.length,
        callType: call?.type,
        steps: call?.type === "autoplay" ? call.steps.length : -1,
      };
    });
    expect(result.calls).toBe(1);
    expect(result.callType).toBe("autoplay");
    expect(result.steps).toBe(1);
  });

  test("holds the trial tonic under the drone by default", async ({ page }) => {
    const drones = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      start(env.ctx);
      return env.play.drones;
    });
    expect(drones).toEqual([60]);
  });

  test("toggling the drone persists on the profile and survives the next trial", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const { dispatch } = start(env.ctx);
      dispatch({ type: "TOGGLE_DRONE" });
      const toggled = {
        profileDrone: env.profile.drone,
        storedDrone: env.profiles.get("p1")?.drone,
        lastDrone: env.play.drones.at(-1) ?? null,
      };
      dispatch({ type: "COMMIT", confidence: "known" });
      dispatch({ type: "GRADE", outcome: "got-it" });
      return { ...toggled, afterNext: env.play.drones.at(-1) ?? null };
    });
    expect(result.profileDrone).toBe(false);
    expect(result.storedDrone).toBe(false);
    expect(result.lastDrone).toBeNull();
    expect(result.afterNext).toBeNull();
  });

  test("offers extra practice and keeps selecting cards after due work is done", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const env = setupDue();
      const cards = Object.values(env.deck.getState().cards);
      for (const card of cards) {
        env.deck.grade(card.id, "known", "got-it", env.ctx.now());
      }
      const { state, dispatch } = start(env.ctx);
      const caughtUp = {
        hasTrial: state.trial !== undefined,
        canKeepPracticing: state.canKeepPracticing,
      };
      dispatch({ type: "KEEP_PRACTICING" });
      const firstExtra = state.trial?.card.id;
      dispatch({ type: "COMMIT", confidence: "known" });
      dispatch({ type: "GRADE", outcome: "got-it" });
      return {
        caughtUp,
        mode: state.practiceMode,
        firstExtra,
        nextExtra: state.trial?.card.id,
      };
    });
    expect(result.caughtUp).toEqual({
      hasTrial: false,
      canKeepPracticing: true,
    });
    expect(result.mode).toBe("extra");
    expect(result.firstExtra).toBeTruthy();
    expect(result.nextExtra).toBeTruthy();
  });

  test("renders the caught-up actions only when cards are available", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setup, setupDue, start } = await import("/test/trial-harness.ts");
      const { TrialView } = await import("/views/trial.ts");
      const render = (env: ReturnType<typeof setup>) => {
        const { state, dispatch } = start(env.ctx);
        const container = document.createElement("div");
        document.body.append(container);
        new TrialView(container, dispatch, state, env.ctx);
        const keep = [...container.querySelectorAll("button")].find(
          (button) => button.textContent?.trim() === "keep practicing",
        );
        return {
          text: container.textContent ?? "",
          keepVisible:
            keep instanceof HTMLElement &&
            getComputedStyle(keep).display !== "none",
        };
      };
      const due = setupDue();
      for (const card of Object.values(due.deck.getState().cards)) {
        due.deck.grade(card.id, "known", "got-it", due.ctx.now());
      }
      return { caughtUp: render(due), empty: render(setup()) };
    });
    expect(result.caughtUp.text).toContain("all caught up");
    expect(result.caughtUp.text).toContain("add more cards");
    expect(result.caughtUp.text).toContain("least confident ones");
    expect(result.caughtUp.keepVisible).toBe(true);
    expect(result.empty.text).toContain("nothing to practice yet");
    expect(result.empty.keepVisible).toBe(false);
  });

  test("clears the drone when nothing is due", async ({ page }) => {
    const drones = await page.evaluate(async () => {
      const { setup, start } = await import("/test/trial-harness.ts");
      const empty = setup();
      start(empty.ctx);
      return empty.play.drones.map((drone) => drone ?? null);
    });
    expect(drones).toEqual([null]);
  });

  test("stops playback when nothing is due", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { setup, start } = await import("/test/trial-harness.ts");
      const empty = setup();
      const { state } = start(empty.ctx);
      return { hasTrial: state.trial !== undefined, calls: empty.play.calls };
    });
    expect(result.hasTrial).toBe(false);
    expect(result.calls).toEqual([{ type: "stop" }]);
  });

  test("shows mode-specific instructions and the confident action", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start, withMode } = await import(
        "/test/trial-harness.ts"
      );
      const { TrialView } = await import("/views/trial.ts");
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      const container = document.createElement("div");
      document.body.append(container);
      const view = new TrialView(container, dispatch, state, env.ctx);
      const transcription = container.textContent ?? "";
      withMode(state, env.deck, "audiation");
      view.sync(state);
      return { transcription, audiation: container.textContent ?? "" };
    });
    expect(result.transcription).toContain("identify the notes");
    expect(result.transcription).toContain("confident");
    expect(result.audiation).toContain("sing these notes");
  });

  test("renders sequence spacing, stacked harmonies, and octave modifiers", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start, pattern } = await import(
        "/test/trial-harness.ts"
      );
      const { TrialView } = await import("/views/trial.ts");
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      const trial = state.trial;
      if (!trial) throw new Error("no trial");
      state.trial = {
        ...trial,
        pattern: pattern("5^-3v-1+3+5"),
        phase: "revealing",
      };
      const container = document.createElement("div");
      document.body.append(container);
      new TrialView(container, dispatch, state, env.ctx);
      const events = [...container.querySelectorAll("[data-notation-event]")];
      return {
        count: events.length,
        texts: events.map((event) =>
          [...event.querySelectorAll("[data-notation-note]")]
            .map((note) => note.textContent?.trim())
            .join(""),
        ),
        lastNoteCount:
          events[2]?.querySelectorAll("[data-notation-note]").length ?? 0,
        firstSup: events[0]?.querySelector("sup")?.textContent,
        secondSub: events[1]?.querySelector("sub")?.textContent,
        text: container.textContent ?? "",
      };
    });
    expect(result.count).toBe(3);
    expect(result.texts).toEqual(["5↑", "3↓", "531"]);
    expect(result.lastNoteCount).toBe(3);
    expect(result.firstSup).toBe("↑");
    expect(result.secondSub).toBe("↓");
    expect(result.text).not.toContain("5↑-");
  });

  test("moves the active treatment from context to pattern during autoplay", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setupDue, start } = await import("/test/trial-harness.ts");
      const { TrialView } = await import("/views/trial.ts");
      const env = setupDue();
      const { state, dispatch } = start(env.ctx);
      const container = document.createElement("div");
      document.body.append(container);
      const view = new TrialView(container, dispatch, state, env.ctx);
      const contextButton = container.querySelector<HTMLButtonElement>(
        '[aria-label="play key"]',
      );
      const patternButton = container.querySelector<HTMLButtonElement>(
        '[aria-label="play pattern"]',
      );
      const snapshot = () => ({
        context: contextButton?.getAttribute("aria-pressed"),
        pattern: patternButton?.getAttribute("aria-pressed"),
        duration: patternButton?.style.getPropertyValue("--play-duration"),
      });
      env.play.state = {
        status: "playing",
        buttonId: "trial:context",
        durationMs: 900,
        queueLength: 1,
      };
      view.sync(state);
      const playingContext = snapshot();
      env.play.state = {
        status: "playing",
        buttonId: "trial:pattern",
        durationMs: 700,
        queueLength: 0,
      };
      view.sync(state);
      return { playingContext, playingPattern: snapshot() };
    });
    expect(result.playingContext.context).toBe("true");
    expect(result.playingContext.pattern).toBe("false");
    expect(result.playingPattern.context).toBe("false");
    expect(result.playingPattern.pattern).toBe("true");
    expect(result.playingPattern.duration).toBe("700ms");
  });
});
