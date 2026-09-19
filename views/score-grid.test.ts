import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("the score grid in reveal mode", () => {
  test("labels every note and chord of a whole melody with no guess chrome", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { appContext, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { cells, lanes, onsets, cellsSoundingAt } = await import(
        "/music/melody.ts"
      );
      const { ScoreGridView } = await import("/views/score-grid.ts");
      const ctx = appContext(new RecordingPlay().asController(), {
        page: "melodies",
      }).melodies;
      const melody = ctx.melodies.find((m) => m.id === "twinkle");
      if (!melody) throw new Error("no twinkle");
      const melodyCells = cells(melody);
      const melodyOnsets = onsets(melodyCells);
      const container = document.createElement("div");
      const pressed: unknown[] = [];
      new ScoreGridView(container, (msg) => pressed.push(msg), {
        key: melody.id,
        score: melody,
        cells: melodyCells,
        onsets: melodyOnsets,
        laneCount: lanes(melody).length,
        firstMeasureIndex: 0,
        measureCount: melody.measures.length,
        promptDegrees: [1, 2, 3, 4, 5, 6, 7],
        cursorOnsetIndex: undefined,
        mode: { kind: "reveal" },
      });

      const cellButtons = Array.from(
        container.querySelectorAll<HTMLButtonElement>("button[data-cell-id]"),
      );
      const firstCell = cellButtons[0];
      firstCell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      return {
        measures: container.querySelectorAll("[data-measure-index]").length,
        expectedMeasures: melody.measures.length,
        cellCount: cellButtons.length,
        expectedCells: melodyCells.length,
        labels: cellButtons.map((button) => {
          const cell = melodyCells[Number(button.dataset.cellIndex)];
          const label =
            button.querySelector<HTMLElement>('[data-part="note"]')
              ?.textContent ?? "";
          const octave = (cell.note.octave > 0 ? "↑" : "↓").repeat(
            Math.abs(cell.note.octave),
          );
          return { label, expected: `${cell.note.degree}${octave}` };
        }),
        regionCount: container.querySelectorAll("[data-region-id]").length,
        expectedRegions: melody.harmony.length,
        visibleResultIcons: Array.from(
          container.querySelectorAll<HTMLElement>("[data-result-icon]"),
        ).filter((icon) => icon.style.display !== "none").length,
        visibleGuesses: Array.from(
          container.querySelectorAll<HTMLElement>('[data-part="guess"]'),
        ).filter((guess) => guess.textContent !== "").length,
        selected: container.querySelectorAll("[data-selected]").length,
        cursors: container.querySelectorAll('[aria-current="true"]').length,
        stackCount: container.querySelectorAll("[data-onset-index]").length,
        expectedStacks: melodyOnsets.filter(
          (onset) => cellsSoundingAt(melodyCells, onset.onsetTicks).length > 1,
        ).length,
        pressed,
      };
    });

    expect(result.measures).toBe(result.expectedMeasures);
    expect(result.cellCount).toBe(result.expectedCells);
    expect(result.labels.length).toBe(result.expectedCells);
    for (const { label, expected } of result.labels) {
      expect(label).toBe(expected);
    }
    expect(result.regionCount).toBe(result.expectedRegions);
    expect(result.visibleResultIcons).toBe(0);
    expect(result.visibleGuesses).toBe(0);
    expect(result.selected).toBe(0);
    expect(result.cursors).toBe(0);
    expect(result.stackCount).toBe(result.expectedStacks);
    expect(result.pressed).toEqual([{ type: "CELL", cellId: "0:0" }]);
  });

  test("renders only the measures inside the window", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { appContext, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { cells, lanes, onsets } = await import("/music/melody.ts");
      const { ScoreGridView } = await import("/views/score-grid.ts");
      const ctx = appContext(new RecordingPlay().asController(), {
        page: "melodies",
      }).melodies;
      const melody = ctx.melodies.find((m) => m.id === "twinkle");
      if (!melody) throw new Error("no twinkle");
      const melodyCells = cells(melody);
      const container = document.createElement("div");
      new ScoreGridView(container, () => {}, {
        key: melody.id,
        score: melody,
        cells: melodyCells,
        onsets: onsets(melodyCells),
        laneCount: lanes(melody).length,
        firstMeasureIndex: 1,
        measureCount: 2,
        promptDegrees: [1, 2, 3, 4, 5, 6, 7],
        cursorOnsetIndex: undefined,
        mode: { kind: "reveal" },
      });

      return {
        indexes: Array.from(
          container.querySelectorAll<HTMLElement>("[data-measure-index]"),
        ).map((measure) => measure.dataset.measureIndex ?? ""),
        totalMeasures: melody.measures.length,
      };
    });

    expect(result.totalMeasures).toBeGreaterThan(3);
    expect(result.indexes).toEqual(["1", "2"]);
  });

  test("labels harmony segments with their chord", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { appContext, RecordingPlay } = await import(
        "/test/app-harness.ts"
      );
      const { cells, lanes, onsets } = await import("/music/melody.ts");
      const { ScoreGridView } = await import("/views/score-grid.ts");
      const ctx = appContext(new RecordingPlay().asController(), {
        page: "melodies",
      }).melodies;
      const melody = ctx.melodies.find((m) => m.harmony.length > 0);
      if (!melody) throw new Error("no harmonized melody");
      const melodyCells = cells(melody);
      const container = document.createElement("div");
      const pressed: unknown[] = [];
      new ScoreGridView(container, (msg) => pressed.push(msg), {
        key: melody.id,
        score: melody,
        cells: melodyCells,
        onsets: onsets(melodyCells),
        laneCount: lanes(melody).length,
        firstMeasureIndex: 0,
        measureCount: melody.measures.length,
        promptDegrees: [1, 2, 3, 4, 5, 6, 7],
        cursorOnsetIndex: undefined,
        mode: { kind: "reveal" },
      });
      const regions = Array.from(
        container.querySelectorAll<HTMLButtonElement>("button[data-region-id]"),
      );
      regions[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      return {
        labels: regions.map(
          (region) =>
            region.querySelector<HTMLElement>('[data-part="chord"]')
              ?.textContent ?? "",
        ),
        answerable: regions.map((region) => region.dataset.answerable),
        pressed,
        firstRegionId: melody.harmony[0].id,
      };
    });

    expect(result.labels.length).toBeGreaterThan(0);
    for (const label of result.labels) expect(label).not.toBe("?");
    expect(new Set(result.answerable)).toEqual(new Set(["false"]));
    expect(result.pressed).toEqual([
      { type: "REGION", regionId: result.firstRegionId },
    ]);
  });
});
