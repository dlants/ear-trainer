import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("the melody browser", () => {
  test("lists every corpus melody and reveals its phrases when opened", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext } = await import("/test/app-harness.ts");
      const { RecordingPlay } = await import("/test/app-harness.ts");
      const { initialState, update, MelodiesView } = await import(
        "/views/melodies.ts"
      );
      const ctx = appContext(new RecordingPlay().asController(), {
        page: "melodies",
      }).melodies;
      const state = initialState();
      const container = document.createElement("div");
      const view = new MelodiesView(container, () => {}, state, ctx);
      const collapsed = container.querySelectorAll("li li").length;

      update(state, { type: "TOGGLE", melodyId: "twinkle" }, ctx);
      view.sync(state);
      const twinkle = ctx.melodies.find((m) => m.id === "twinkle");

      return {
        titles: Array.from(container.querySelectorAll("li > button")).map(
          (b) => b.textContent ?? "",
        ),
        collapsed,
        expandedPhrases: container.querySelectorAll("li li").length,
        phraseCount: twinkle?.phrases.length ?? 0,
        melodyCount: ctx.melodies.length,
      };
    });

    expect(result.titles).toHaveLength(result.melodyCount);
    expect(result.titles[0]).toContain("Twinkle, Twinkle, Little Star");
    expect(result.collapsed).toBe(0);
    expect(result.expandedPhrases).toBe(result.phraseCount);
  });

  test("plays a melody and a single phrase in the learner's key", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { initialState, update } = await import("/views/melodies.ts");
      const recording = new RecordingPlay();
      const ctx = appContext(recording.asController(), {
        page: "melodies",
      }).melodies;
      const state = initialState();
      const twinkle = ctx.melodies.find((m) => m.id === "twinkle");
      const phraseId = twinkle?.phrases[1].id ?? "";

      update(state, { type: "PLAY_MELODY", melodyId: "twinkle" }, ctx);
      update(
        state,
        { type: "PLAY_PHRASE", melodyId: "twinkle", phraseId },
        ctx,
      );

      return {
        steps: recording.toggle.map(([buttonId, step]) => ({
          buttonId,
          durationTicks: (step as { score: { durationTicks: number } }).score
            .durationTicks,
          tonic: (step as { tonic: number }).tonic,
        })),
        phraseId,
        melodyTicks: twinkle?.durationTicks ?? 0,
        phraseTicks: twinkle?.phrases[1].durationTicks ?? 0,
      };
    });

    expect(result.steps).toEqual([
      {
        buttonId: "melodies:twinkle",
        durationTicks: result.melodyTicks,
        tonic: 60,
      },
      {
        buttonId: `melodies:${result.phraseId}`,
        durationTicks: result.phraseTicks,
        tonic: 60,
      },
    ]);
  });
});
