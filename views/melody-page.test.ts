import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("the melody page", () => {
  test("shows the whole melody revealed, with no guess chrome", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { cells } = await import("/music/melody.ts");
      const { initialState, MelodyPageView } = await import(
        "/views/melody-page.ts"
      );
      const ctx = appContext(new RecordingPlay().asController(), {
        page: "melody",
        melodyId: "twinkle",
      }).melodyPage;
      const melody = ctx.melodies.find((m) => m.id === "twinkle");
      if (!melody) throw new Error("no twinkle");
      const container = document.createElement("div");
      new MelodyPageView(container, () => {}, initialState("twinkle"), ctx);
      return {
        title: container.querySelector("h1")?.textContent ?? "",
        expectedTitle: melody.title,
        source: container.querySelector(".source")?.textContent ?? "",
        expectedSource: melody.source.description,
        measures: container.querySelectorAll("[data-measure-index]").length,
        expectedMeasures: melody.measures.length,
        cellCount: container.querySelectorAll("[data-cell-id]").length,
        expectedCells: cells(melody).length,
        unlabeled: Array.from(
          container.querySelectorAll<HTMLElement>('[data-part="note"]'),
        ).filter((label) => label.textContent === "?").length,
        visibleResultIcons: Array.from(
          container.querySelectorAll<HTMLElement>("[data-result-icon]"),
        ).filter((icon) => icon.style.display !== "none").length,
        visibleGuesses: Array.from(
          container.querySelectorAll<HTMLElement>('[data-part="guess"]'),
        ).filter((guess) => guess.textContent !== "").length,
      };
    });

    expect(result.title).toBe(result.expectedTitle);
    expect(result.source).toBe(result.expectedSource);
    expect(result.measures).toBe(result.expectedMeasures);
    expect(result.cellCount).toBe(result.expectedCells);
    expect(result.unlabeled).toBe(0);
    expect(result.visibleResultIcons).toBe(0);
    expect(result.visibleGuesses).toBe(0);
  });

  test("plays the melody, a single note, and a chord region", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { cells } = await import("/music/melody.ts");
      const { noteToMidi } = await import("/music/pitch.ts");
      const { initialState, update } = await import("/views/melody-page.ts");
      const recording = new RecordingPlay();
      const ctx = appContext(recording.asController(), {
        page: "melody",
        melodyId: "twinkle",
      }).melodyPage;
      const melody = ctx.melodies.find((m) => m.harmony.length > 0);
      if (!melody) throw new Error("no harmonized melody");
      const state = initialState(melody.id);
      const firstCell = cells(melody)[0];
      const region = melody.harmony[0];

      update(state, { type: "PLAY_MELODY" }, ctx);
      update(
        state,
        { type: "GRID", msg: { type: "CELL", cellId: firstCell.id } },
        ctx,
      );
      update(
        state,
        { type: "GRID", msg: { type: "REGION", regionId: region.id } },
        ctx,
      );

      return {
        toggle: recording.toggle,
        autoplay: recording.autoplay,
        melodyId: melody.id,
        expectedMidi: noteToMidi(firstCell.note, ctx.profile.tonic),
        regionRange: {
          startTicks: region.startTicks,
          endTicks: region.endTicks,
        },
      };
    });

    expect(result.toggle).toHaveLength(1);
    expect(result.toggle[0][0]).toBe(`melodies:${result.melodyId}`);
    expect(result.toggle[0][1]).toMatchObject({ type: "score" });
    expect(result.autoplay).toHaveLength(2);
    expect(result.autoplay[0][0]).toMatchObject([
      { type: "notes", notes: [result.expectedMidi] },
    ]);
    expect(result.autoplay[1][0]).toMatchObject([
      { type: "score", range: result.regionRange },
    ]);
  });

  test("falls back to the melody list for an unknown id", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { appContext, emptyState, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { AppView } = await import("/views/app.ts");
      const route = { page: "melody", melodyId: "not-a-melody" } as const;
      const ctx = appContext(new RecordingPlay().asController(), route);
      const state = emptyState(route);
      const container = document.createElement("div");
      new AppView(container, () => {}, state, ctx);
      return {
        headings: Array.from(container.querySelectorAll("h1")).map(
          (h) => h.textContent ?? "",
        ),
        entries: container.querySelectorAll("li > button").length,
        melodyCount: ctx.melodies.melodies.length,
      };
    });

    expect(result.headings).toEqual(["melodies"]);
    expect(result.entries).toBe(result.melodyCount);
  });
});
