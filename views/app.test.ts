import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("app playback lifecycle", () => {
  test("routes controller completion through update and the root sync path", async ({
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
      const state = emptyState("cards");
      const ctx = appContext(play, state.route);
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

  for (const page_ of ["practice", "options"] as const) {
    test(`stops playback when leaving ${page_}`, async ({ page }) => {
      const stopCalls = await page.evaluate(async (from) => {
        const { appContext, emptyState, RecordingPlay } = await import(
          "/test/app-harness.ts"
        );
        const { update } = await import("/views/app.ts");

        const recorder = new RecordingPlay();
        const play = recorder.asController();
        const state = emptyState(from);
        const ctx = appContext(play, state.route);

        update(
          state,
          { type: "NAVIGATE", route: { page: "cards" } },
          ctx,
          () => {},
        );

        return recorder.stop.length;
      }, page_);

      expect(stopCalls).toBe(1);
    });
  }

  test("requests one autoplay sequence when entering practice", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { update } = await import("/views/app.ts");

      const recorder = new RecordingPlay();
      const play = recorder.asController();
      const state = emptyState("cards");
      const ctx = appContext(play, state.route);

      update(
        state,
        { type: "NAVIGATE", route: { page: "practice" } },
        ctx,
        () => {},
      );

      return {
        autoplay: recorder.autoplay,
        pattern: state.trial.trial?.pattern,
      };
    });

    expect(result.autoplay).toHaveLength(1);
    expect(result.autoplay).toContainEqual([
      [
        {
          buttonId: "trial:context",
          type: "context",
          context: "major-cadence",
          tonic: 60,
          speed: "medium",
        },
        {
          buttonId: "trial:pattern",
          type: "pattern",
          pattern: result.pattern,
          tonic: 60,
        },
      ],
    ]);
  });

  test("starts practice after the audio gate unlocks", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, FakeAudio, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { update } = await import("/views/app.ts");

      const audio = new FakeAudio();
      audio.unlocked = false;
      const recorder = new RecordingPlay();
      const play = recorder.asController();
      const state = emptyState("practice");
      state.audioUnlocked = false;
      const ctx = appContext(play, state.route, audio);

      update(
        state,
        { type: "START_MSG", msg: { type: "UNLOCKED" } },
        ctx,
        () => {},
      );

      return {
        audioUnlocked: state.audioUnlocked,
        autoplayCount: recorder.autoplay.length,
      };
    });

    expect(result.audioUnlocked).toBe(true);
    expect(result.autoplayCount).toBe(1);
  });

  test("leaves other pages reachable while audio is locked", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, FakeAudio, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { update } = await import("/views/app.ts");

      const audio = new FakeAudio();
      audio.unlocked = false;
      const recorder = new RecordingPlay();
      const play = recorder.asController();
      const state = emptyState("cards");
      state.audioUnlocked = false;
      const ctx = appContext(play, state.route, audio);

      update(
        state,
        { type: "NAVIGATE", route: { page: "practice" } },
        ctx,
        () => {},
      );

      return {
        page: state.route.page,
        autoplayCount: recorder.autoplay.length,
      };
    });

    expect(result.page).toBe("practice");
    expect(result.autoplayCount).toBe(0);
  });
});
