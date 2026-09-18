import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("activity-only app integration", () => {
  test("routes controller completion through the root update path", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { PlayController } = await import("/audio/play-controller.ts");
      const { appContext, emptyState, FakeAudio } = await import(
        "/test/app-harness.ts"
      );
      const { update } = await import("/views/app.ts");
      type Msg = Parameters<typeof update>[1];

      const audio = new FakeAudio();
      let dispatch: (msg: Msg) => void;
      const play = new PlayController(audio, (msg) =>
        dispatch({ type: "PLAY_MSG", msg }),
      );
      const route = { page: "catalog" } as const;
      const state = emptyState(route);
      const ctx = appContext(play, route);
      const syncs: unknown[] = [];
      dispatch = (msg) => {
        update(state, msg, ctx, dispatch);
        syncs.push(state);
      };

      play.autoplay([{ buttonId: "options:tonic", type: "note", note: 60 }]);
      audio.handles[0].complete();
      await Promise.resolve();

      return { playState: play.getState(), syncCount: syncs.length };
    });

    expect(result.playState).toEqual({ status: "idle" });
    expect(result.syncCount).toBe(1);
  });

  test("mounts the catalog and menu without legacy or activity links", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { AppView } = await import("/views/app.ts");
      const route = { page: "catalog" } as const;
      const state = emptyState(route);
      const ctx = appContext(new RecordingPlay().asController(), route);
      const container = document.createElement("div");
      new AppView(container, () => {}, state, ctx);
      return {
        text: container.textContent ?? "",
        menuLinks: Array.from(
          container.querySelectorAll('nav[aria-label="main navigation"] a'),
        ).map((link) => ({
          text: link.textContent,
          href: link.getAttribute("href"),
        })),
      };
    });

    expect(result.text).toContain("ear training activities");
    expect(result.text).toContain("Identify the notes");
    expect(result.text).not.toContain("Sing the tonic");
    expect(result.menuLinks).toEqual([
      { text: "home", href: "/" },
      { text: "options", href: "/options" },
      { text: "about", href: "/about" },
    ]);
  });

  test("mounts the identify-notes selector without autoplay", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { AppView } = await import("/views/app.ts");
      const route = { page: "activity", activity: "identify-notes" } as const;
      const recorder = new RecordingPlay();
      const state = emptyState(route);
      const ctx = appContext(recorder.asController(), route);
      const container = document.createElement("div");
      new AppView(container, () => {}, state, ctx);
      return {
        text: container.textContent ?? "",
        screen: state.identifyNotes.screen,
        autoplay: recorder.autoplay,
      };
    });

    expect(result.text).toContain("Choose the musical situations");
    expect(result.text).toContain("Tonic");
    expect(result.screen).toBe("situations");
    expect(result.autoplay).toEqual([]);
  });

  test("keeps activity routes behind the explicit audio unlock", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, FakeAudio, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { AppView, update } = await import("/views/app.ts");
      const audio = new FakeAudio();
      audio.unlocked = false;
      const route = { page: "activity", activity: "identify-notes" } as const;
      const recorder = new RecordingPlay();
      const state = emptyState(route);
      state.audioUnlocked = false;
      const ctx = appContext(recorder.asController(), route, audio);
      const container = document.createElement("div");
      let view: InstanceType<typeof AppView>;
      const dispatch = (msg: Parameters<typeof update>[1]) => {
        update(state, msg, ctx, dispatch);
        view.sync(state);
      };
      view = new AppView(container, dispatch, state, ctx);
      const before = container.textContent ?? "";
      dispatch({ type: "START_MSG", msg: { type: "UNLOCKED" } });
      const afterUnlock = container.textContent ?? "";
      const screenAfterUnlock = state.identifyNotes.screen;
      const autoplayAfterUnlock = recorder.autoplay.length;
      dispatch({ type: "IDENTIFY_NOTES_MSG", msg: { type: "BEGIN" } });
      return {
        before,
        afterUnlock,
        screenAfterUnlock,
        screenAfterBegin: state.identifyNotes.screen,
        autoplayAfterUnlock,
        autoplayAfterBegin: recorder.autoplay.length,
      };
    });

    expect(result.before).toContain("Turn on sound to begin practicing");
    expect(result.before).not.toContain("Choose the musical situations");
    expect(result.afterUnlock).toContain("Choose the musical situations");
    expect(result.screenAfterUnlock).toBe("situations");
    expect(result.screenAfterBegin).toBe("practice");
    expect(result.autoplayAfterUnlock).toBe(0);
    expect(result.autoplayAfterBegin).toBe(1);
  });

  test("synchronizes playback cues into the active identify-notes trial", async ({
    page,
  }) => {
    const cursor = await page.evaluate(async () => {
      const { appContext, emptyState, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { update } = await import("/views/app.ts");
      const route = { page: "activity", activity: "identify-notes" } as const;
      const recorder = new RecordingPlay();
      const state = emptyState(route);
      const ctx = appContext(recorder.asController(), route);
      update(
        state,
        { type: "IDENTIFY_NOTES_MSG", msg: { type: "BEGIN" } },
        ctx,
        () => {},
      );
      recorder.state = {
        status: "playing",
        buttonId: "tonic:melody",
        durationMs: 1000,
        queueLength: 0,
        eventIndex: 2,
      };
      update(
        state,
        {
          type: "PLAY_MSG",
          msg: {
            type: "CUE_CHANGED",
            generation: 0,
            playbackId: 0,
            eventIndex: 2,
          },
        },
        ctx,
        () => {},
      );
      return state.identifyNotes.trial?.cursorEventIndex;
    });

    expect(cursor).toBe(2);
  });

  test("navigation stops playback, clears activity support, and silences the drone", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { update } = await import("/views/app.ts");
      const route = { page: "activity", activity: "identify-notes" } as const;
      const recorder = new RecordingPlay();
      const state = emptyState(route);
      state.identifyNotes.droneOn = true;
      const ctx = appContext(recorder.asController(), route);

      update(
        state,
        { type: "NAVIGATE", route: { page: "catalog" } },
        ctx,
        () => {},
      );
      return {
        stopCount: recorder.stop.length,
        drones: recorder.setDrone,
        droneOn: state.identifyNotes.droneOn,
      };
    });

    expect(result).toEqual({
      stopCount: 1,
      drones: [[undefined]],
      droneOn: false,
    });
  });
});
