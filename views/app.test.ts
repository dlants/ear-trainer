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
    expect(result.text).toContain("Sing the tonic");
    expect(result.text).toContain("Identify the tonic notes");
    expect(result.menuLinks).toEqual([
      { text: "home", href: "/" },
      { text: "options", href: "/options" },
      { text: "about", href: "/about" },
    ]);
  });

  for (const activity of ["sing-tonic", "identify-tonic-notes"] as const) {
    test(`mounts ${activity} with injected melodies and playback`, async ({
      page,
    }) => {
      const result = await page.evaluate(async (selectedActivity) => {
        const { appContext, emptyState, RecordingPlay } = await import(
          "/test/app-harness.ts"
        );
        const { AppView, update } = await import("/views/app.ts");
        const route = {
          page: "activity",
          activity: selectedActivity,
        } as const;
        const recorder = new RecordingPlay();
        const state = emptyState(route);
        const ctx = appContext(recorder.asController(), route);
        update(
          state,
          {
            type:
              selectedActivity === "sing-tonic"
                ? "SING_TONIC_MSG"
                : "IDENTIFY_TONIC_MSG",
            msg: { type: "START" },
          },
          ctx,
          () => {},
        );
        const container = document.createElement("div");
        new AppView(container, () => {}, state, ctx);
        return {
          text: container.textContent ?? "",
          autoplay: recorder.autoplay,
        };
      }, activity);

      expect(result.text).toContain(
        activity === "sing-tonic" ? "Sing the tonic" : "Identify the notes",
      );
      expect(result.text).toContain(
        activity === "sing-tonic" ? "repeat melody" : "from beginning",
      );
      expect(result.autoplay).toHaveLength(1);
    });
  }

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
      const route = { page: "activity", activity: "sing-tonic" } as const;
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
      return {
        before,
        after: container.textContent ?? "",
        autoplayCount: recorder.autoplay.length,
      };
    });

    expect(result.before).toContain("Turn on sound to begin practicing");
    expect(result.before).not.toContain("Listen to the melody");
    expect(result.after).toContain("Sing the tonic");
    expect(result.autoplayCount).toBe(1);
  });

  test("navigation stops playback, clears activity support, and silences the drone", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { update } = await import("/views/app.ts");
      const route = { page: "activity", activity: "sing-tonic" } as const;
      const recorder = new RecordingPlay();
      const state = emptyState(route);
      state.singTonic.droneOn = true;
      const ctx = appContext(recorder.asController(), route);

      update(
        state,
        {
          type: "NAVIGATE",
          route: {
            page: "activity",
            activity: "identify-tonic-notes",
          },
        },
        ctx,
        () => {},
      );
      const betweenActivities = {
        stopCount: recorder.stop.length,
        drones: [...recorder.setDrone],
        singDroneOn: state.singTonic.droneOn,
        autoplayCount: recorder.autoplay.length,
      };

      state.identifyTonic.droneOn = true;
      update(
        state,
        { type: "NAVIGATE", route: { page: "catalog" } },
        ctx,
        () => {},
      );
      return {
        betweenActivities,
        finalStopCount: recorder.stop.length,
        finalDrones: recorder.setDrone,
        identifyDroneOn: state.identifyTonic.droneOn,
      };
    });

    expect(result.betweenActivities).toEqual({
      stopCount: 1,
      drones: [[undefined]],
      singDroneOn: false,
      autoplayCount: 1,
    });
    expect(result.finalStopCount).toBe(2);
    expect(result.finalDrones).toEqual([[undefined], [undefined]]);
    expect(result.identifyDroneOn).toBe(false);
  });
});
