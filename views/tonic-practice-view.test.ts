import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test("activity catalog exposes only identify notes", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { ActivityCatalogView } = await import("/views/activity-catalog.ts");
    const container = document.createElement("div");
    new ActivityCatalogView(container, () => {}, {});
    return {
      links: Array.from(container.querySelectorAll("a")).map((link) => ({
        text: link.textContent?.replace(/\s+/g, " ").trim(),
        href: link.getAttribute("href"),
      })),
      text: container.textContent,
    };
  });
  expect(result.links).toEqual([
    { text: "", href: "https://github.com/dlants/ear-trainer" },
    {
      text: "Identify the notes Choose musical situations, then identify every note in a melody.",
      href: "/activities/identify-notes",
    },
    { text: "about", href: "/about" },
  ]);
  expect(result.text).not.toMatch(/practice|cards|song library/i);
});

test("situation selector is keyed, accessible, persistent, and never empty", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { memoryStorage, mountIdentifySelector } = await import(
      "/test/tonic-practice-harness.ts"
    );
    const storage = memoryStorage();
    const env = mountIdentifySelector(undefined, storage);
    const choices = () =>
      Array.from(
        env.container.querySelectorAll<HTMLButtonElement>(
          "button[data-situation-id]",
        ),
      );
    const tonic = choices().find(
      (button) => button.dataset.situationId === "tonic",
    );
    const dominant = choices().find(
      (button) => button.dataset.situationId === "dominant-adjacent-tonic",
    );
    const stepwise2 = choices().find(
      (button) => button.dataset.situationId === "stepwise-2",
    );
    if (!tonic || !dominant || !stepwise2) throw new Error("missing choice");
    const tonicNode = tonic;
    const initiallyPressed = tonic.getAttribute("aria-pressed");
    dominant.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
    );
    const afterPointer = {
      selected: [...env.state.selectedSituationIds],
      vocabulary: env.container.querySelector<HTMLElement>(
        '[data-ref^="vocabulary"]',
      )?.textContent,
      sameTonicNode:
        tonicNode ===
        choices().find((button) => button.dataset.situationId === "tonic"),
    };
    dominant.click();
    tonic.click();
    const afterLastDeselection = [...env.state.selectedSituationIds];
    stepwise2.click();
    const restored = mountIdentifySelector(undefined, storage);
    return {
      count: choices().length,
      ids: choices().map((button) => button.dataset.situationId),
      labels: choices().map((button) =>
        button.textContent?.replace(/\s+/g, " ").trim(),
      ),
      initialTonicPressed: initiallyPressed,
      afterPointer,
      afterLastDeselection,
      keyboardSelection: [...env.state.selectedSituationIds],
      restoredSelection: [...restored.state.selectedSituationIds],
      returnLabel: Array.from(
        env.container.querySelectorAll<HTMLButtonElement>("button"),
      ).find((button) => button.textContent?.trim() === "back to practice")
        ?.textContent,
    };
  });

  expect(result.count).toBe(22);
  expect(result.ids).toEqual([
    "tonic",
    "dominant-adjacent-tonic",
    "third-adjacent-tonic",
    "tonic-triad-movement",
    "stepwise-2",
    "stepwise-4",
    "seventh-adjacent-tonic",
    "stepwise-6",
    "stepwise-7",
    "stepwise-1",
    "stepwise-3",
    "stepwise-5",
    "ascending-run",
    "descending-run",
    "harmonic-third",
    "harmonic-fifth",
    "harmonic-octave",
    "triad-together",
    "arpeggiated-triad",
    "pedal-tone",
    "authentic-cadence",
    "plagal-cadence",
  ]);
  expect(result.labels.every((label) => (label?.length ?? 0) > 10)).toBe(true);
  expect(result.afterPointer.selected).toEqual([
    "tonic",
    "dominant-adjacent-tonic",
  ]);
  expect(result.afterPointer.vocabulary).toBe(
    "? · 1 · 2 · 3 · 4 · 5 · 6 · 7 · other · _",
  );
  expect(result.afterPointer.sameTonicNode).toBe(true);
  expect(result.afterLastDeselection).toEqual(["tonic"]);
  expect(result.keyboardSelection).toEqual(["tonic", "stepwise-2"]);
  expect(result.restoredSelection).toEqual(["tonic", "stepwise-2"]);
  expect(result.returnLabel).toBe("back to practice");
  expect(result.initialTonicPressed).toBe("true");
});

test("returning from situations autoplays and change shows the selected count", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentifySelector, phrase } = await import(
      "/test/tonic-practice-harness.ts"
    );
    const env = mountIdentifySelector([phrase(2)]);
    const button = (label: string) =>
      Array.from(
        env.container.querySelectorAll<HTMLButtonElement>("button"),
      ).find((candidate) => candidate.textContent?.trim() === label);
    env.container
      .querySelector<HTMLButtonElement>(
        'button[data-situation-id="dominant-adjacent-tonic"]',
      )
      ?.click();
    button("back to practice")?.click();
    const practice = {
      screen: env.state.screen,
      target: env.state.trial?.targetSituationId,
      eventCount: env.state.trial?.cells.length,
      cellButtons: env.container.querySelectorAll("button[data-cell-index]")
        .length,
      source: env.container.querySelector<HTMLElement>('[data-ref^="source"]')
        ?.textContent,
      calls: [...env.play.calls],
      changeSituationsLabel: Array.from(
        env.container.querySelectorAll<HTMLButtonElement>("button"),
      )
        .find((candidate) =>
          candidate.textContent?.trim().startsWith("situations ("),
        )
        ?.textContent?.trim(),
    };
    env.container
      .querySelector<HTMLButtonElement>('button[data-cell-index="0"]')
      ?.click();
    const palette = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="answer choices"] button',
      ),
    ).map((choice) => choice.textContent);
    button("reveal answers")?.click();
    button("next melody")?.click();
    const afterNext = {
      screen: env.state.screen,
      selected: [...env.state.selectedSituationIds],
      autoplayCalls: env.play.calls.filter(
        (call) => call === "autoplay:tonic:melody",
      ).length,
    };
    Array.from(env.container.querySelectorAll<HTMLButtonElement>("button"))
      .find((candidate) =>
        candidate.textContent?.trim().startsWith("situations ("),
      )
      ?.click();
    return {
      practice,
      palette,
      afterNext,
      changed: {
        screen: env.state.screen,
        selected: env.state.selectedSituationIds,
        trial: env.state.trial,
        stopCalls: env.play.calls.filter((call) => call === "stop").length,
      },
    };
  });

  expect(result.practice).toEqual({
    screen: "practice",
    target: "tonic",
    eventCount: 4,
    cellButtons: 4,
    source: "from fixture-2",
    calls: ["autoplay:tonic:melody"],
    changeSituationsLabel: "situations (2)",
  });
  expect(result.palette).toEqual([
    "?",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "other",
    "_",
  ]);
  expect(result.afterNext).toEqual({
    screen: "practice",
    selected: ["tonic", "dominant-adjacent-tonic"],
    autoplayCalls: 2,
  });
  expect(result.changed.screen).toBe("situations");
  expect(result.changed.selected).toEqual(["tonic", "dominant-adjacent-tonic"]);
  expect(result.changed.trial).toBeUndefined();
  expect(result.changed.stopCalls).toBe(1);
});

test("a cell carries its own guess, with no separate guess row", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const env = harness.mountIdentify(2);
    const cells = () =>
      Array.from(
        env.container.querySelectorAll<HTMLButtonElement>(
          "button[data-cell-index]",
        ),
      );
    const initial = cells().map((cell) => cell.textContent);
    const first = cells()[0];
    cells()[0]?.click();
    const palette = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="answer choices"] button',
      ),
    );
    const paletteLabels = palette.map((button) => button.textContent);
    palette.find((button) => button.textContent === "1")?.click();
    const answered = cells()[0]?.textContent;
    cells()[0]?.click();
    palette.find((button) => button.textContent === "_")?.click();
    const skipped = cells()[0]?.textContent;
    cells()[0]?.click();
    palette.find((button) => button.textContent === "?")?.click();
    return {
      initial,
      paletteLabels,
      answered,
      skipped,
      reset: cells()[0]?.textContent,
      sameNode: first === cells()[0],
      guessRows: env.container.querySelectorAll('[data-row="guess"]').length,
      cellsPerMeasure: Array.from(
        env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
      ).map((measure) => measure.querySelectorAll("[data-cell-index]").length),
      selectedCell: harness.selectedCellIndex(env.state),
      notePlayCount: env.play.calls.filter(
        (call) => call === "autoplay:tonic:melody-note",
      ).length,
    };
  });
  expect(result.initial).toEqual(["?", "?", "?", "?"]);
  expect(result.paletteLabels).toEqual([
    "?",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "other",
    "_",
  ]);
  expect(result.answered).toBe("1");
  expect(result.skipped).toBe("_");
  expect(result.reset).toBe("?");
  expect(result.sameNode).toBe(true);
  expect(result.guessRows).toBe(0);
  expect(result.cellsPerMeasure).toEqual([2, 2]);
  expect(result.selectedCell).toBe(1);
  expect(result.notePlayCount).toBe(3);
});

test("cells span their duration across lanes of the grid", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const env = harness.mountIdentifyPhrase(harness.harmonyPhrase());
    const measures = Array.from(
      env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
    );
    const cellsIn = (measure: HTMLElement) =>
      Array.from(
        measure.querySelectorAll<HTMLButtonElement>("button[data-cell-index]"),
      );
    const chord = cellsIn(measures[0] as HTMLElement).filter(
      (cell) => cell.style.left === "calc(0% + 2px)",
    );
    const second = cellsIn(measures[1] as HTMLElement);
    const sustained = second.find((cell) => cell.dataset.lane === "0");
    const arpeggio = second.filter((cell) => cell.dataset.lane === "3");
    sustained?.scrollIntoView({ block: "center" });
    const sustainedRect = sustained?.getBoundingClientRect();
    const arpeggioRects = arpeggio.map((cell) => cell.getBoundingClientRect());
    const firstArpeggio = arpeggioRects[0];
    const lastArpeggio = arpeggioRects.at(-1);
    const tapAtRight =
      sustainedRect &&
      document.elementFromPoint(
        sustainedRect.right - 3,
        sustainedRect.top + sustainedRect.height / 2,
      );
    return {
      chordLanes: chord.map((cell) => cell.dataset.lane),
      chordTops: chord.map((cell) => cell.getBoundingClientRect().top),
      chordNotes: chord.map((cell) => cell.getAttribute("aria-label")),
      sustainedWidths:
        sustainedRect && firstArpeggio && lastArpeggio
          ? {
              spansArpeggio:
                Math.abs(sustainedRect.left - firstArpeggio.left) <= 1 &&
                Math.abs(sustainedRect.right - lastArpeggio.right) <= 1,
              widerThanOne: sustainedRect.width > firstArpeggio.width * 3,
            }
          : undefined,
      arpeggioCount: arpeggio.length,
      tapAtRight:
        tapAtRight instanceof HTMLElement
          ? (tapAtRight.closest("button")?.dataset.cellId ?? tapAtRight.tagName)
          : null,
      sustainedId: sustained?.dataset.cellId,
      lanesWithCells: new Set(
        cellsIn(measures[1] as HTMLElement).map((cell) => cell.dataset.lane),
      ).size,
      laneCount: env.state.trial?.lanes.length,
    };
  });
  expect(result.chordLanes).toEqual(["0", "1", "2"]);
  expect(result.chordTops[0]).toBeLessThan(result.chordTops[1] as number);
  expect(result.chordTops[1]).toBeLessThan(result.chordTops[2] as number);
  expect(result.chordNotes).toEqual([
    "masked melody note 1",
    "masked melody note 2",
    "masked melody note 3",
  ]);
  expect(result.arpeggioCount).toBe(4);
  expect(result.sustainedWidths).toEqual({
    spansArpeggio: true,
    widerThanOne: true,
  });
  expect(result.tapAtRight).toBe(result.sustainedId);
  expect(result.laneCount).toBe(4);
  expect(result.lanesWithCells).toBe(2);
});

test("stacked onsets get a play button and single tones do not", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const env = harness.mountIdentifyPhrase(harness.harmonyPhrase());
    const stacks = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>("[data-onset-index]"),
    );
    const perMeasure = Array.from(
      env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
    ).map((measure) => measure.querySelectorAll("[data-onset-index]").length);
    stacks[0]?.click();
    const afterStack = [...env.play.calls];
    const secondChordCell = env.container.querySelector<HTMLButtonElement>(
      'button[data-cell-index="1"]',
    );
    secondChordCell?.click();
    return {
      stackIndexes: stacks.map((button) => button.dataset.onsetIndex),
      perMeasure,
      afterStack,
      selectedCell: harness.selectedCellIndex(env.state),
      selectionKind: env.state.trial?.selection?.kind,
    };
  });
  // The block chord and each arpeggio tick under the sustained tone stack;
  // the lone melody note in bar 1 does not.
  expect(result.perMeasure).toEqual([1, 4]);
  expect(result.stackIndexes[0]).toBe("0");
  expect(result.afterStack).toEqual(["autoplay:tonic:melody-note"]);
  expect(result.selectedCell).toBe(1);
  expect(result.selectionKind).toBe("cell");
});

test("the harmony track renders regions, plays them, and takes chord answers", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const env = harness.mountIdentifyPhrase(harness.harmonyPhrase());
    const regions = () =>
      Array.from(
        env.container.querySelectorAll<HTMLButtonElement>("[data-region-id]"),
      );
    const perMeasure = Array.from(
      env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
    ).map((measure) => measure.querySelectorAll("[data-region-id]").length);
    const widths = regions().map((region) => region.style.width);
    regions()[1]?.click();
    const paletteAfterRegion = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="answer choices"] button',
      ),
    ).map((button) => button.textContent);
    const playCalls = [...env.play.calls];
    env.container
      .querySelectorAll<HTMLButtonElement>(
        '[aria-label="answer choices"] button',
      )[5]
      ?.click();
    const chordAnswers = { ...env.state.trial?.chordAnswers };
    const cellAnswers = { ...env.state.trial?.cellAnswers };
    env.container
      .querySelector<HTMLButtonElement>('button[data-cell-index="0"]')
      ?.click();
    const paletteAfterCell = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="answer choices"] button',
      ),
    ).map((button) => button.textContent);
    env.dispatch({ type: "REVEAL" });
    const revealed = regions().map((region) => ({
      text: region.textContent,
      result: region.dataset.result,
      parts: Array.from(region.querySelectorAll<HTMLElement>("[data-part]"))
        .filter((part) => part.style.display !== "none")
        .map((part) => part.dataset.part),
    }));
    return {
      perMeasure,
      widths,
      paletteAfterRegion,
      paletteAfterCell,
      playCalls,
      chordAnswers,
      cellAnswers,
      revealed,
    };
  });
  // Bar 2's second half is a harmony gap, so it renders no segment.
  expect(result.perMeasure).toEqual([1, 1]);
  expect(result.widths).toEqual(["calc(100% - 4px)", "calc(50% - 4px)"]);
  expect(result.paletteAfterRegion).toEqual([
    "?",
    "I",
    "ii",
    "iii",
    "IV",
    "V",
    "vi",
    "vii°",
    "other",
    "_",
  ]);
  expect(result.playCalls).toEqual(["autoplay:tonic:melody"]);
  expect(result.chordAnswers).toEqual({ "harmony:96": 5 });
  expect(result.cellAnswers).toEqual({});
  expect(result.paletteAfterCell[1]).toBe("1");
  expect(result.revealed).toEqual([
    { text: "I", result: "unanswered", parts: ["chord"] },
    { text: "V", result: "correct", parts: ["chord"] },
  ]);
});

test("harmony that is not askable is read-only, and no harmony renders no track", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const readOnly = harness.mountIdentifyPhrase(
      harness.harmonyPhrase("exclude"),
    );
    const region =
      readOnly.container.querySelector<HTMLButtonElement>("[data-region-id]");
    region?.click();
    const plain = harness.mountIdentify(2);
    const plainTrack = Array.from(
      plain.container.querySelectorAll<HTMLElement>('[aria-label="harmony"]'),
    );
    return {
      readOnlyLabel: region?.textContent,
      readOnlyAnswerable: region?.dataset.answerable,
      readOnlySelection: readOnly.state.trial?.selection,
      readOnlyPalette: readOnly.container.querySelectorAll(
        '[aria-label="answer choices"] button',
      ).length,
      readOnlyPlays: [...readOnly.play.calls],
      readOnlyAnswers: { ...readOnly.state.trial?.chordAnswers },
      plainRegions: plain.container.querySelectorAll("[data-region-id]").length,
      plainTrackHidden: plainTrack.every(
        (track) => track.style.display === "none",
      ),
      plainCells: plain.container.querySelectorAll("button[data-cell-index]")
        .length,
    };
  });
  expect(result.readOnlyLabel).toBe("I");
  expect(result.readOnlyAnswerable).toBe("false");
  expect(result.readOnlySelection).toBeUndefined();
  expect(result.readOnlyPalette).toBe(0);
  expect(result.readOnlyPlays).toEqual(["autoplay:tonic:melody"]);
  expect(result.readOnlyAnswers).toEqual({});
  expect(result.plainRegions).toBe(0);
  expect(result.plainTrackHidden).toBe(true);
  expect(result.plainCells).toBe(4);
});

test("viewport hides bar controls when every bar is visible", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const { mountIdentify } = harness;
    const snapshots: Record<
      string,
      {
        before: {
          rows: (string | undefined)[];
          buttons: (string | undefined)[];
          range: string | null | undefined;
        };
        after: {
          rows: (string | undefined)[];
          answer: number | string | undefined;
        };
      }
    > = {};
    for (const count of [2, 3, 4, 7]) {
      const env = mountIdentify(count);
      const visibleButtons = () =>
        Array.from(env.container.querySelectorAll<HTMLButtonElement>("button"))
          .filter((button) => button.style.display !== "none")
          .map((button) => button.textContent?.replace(/\s+/g, " ").trim());
      const readRows = () =>
        Array.from(
          env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
        ).map((row) => row.dataset.measureIndex);
      const range = env.container.querySelector<HTMLElement>(
        '[data-ref^="barRange"]',
      );
      const before = {
        rows: readRows(),
        buttons: visibleButtons(),
        range: range?.style.display === "none" ? undefined : range?.textContent,
      };
      env.dispatch({
        type: "SELECT_CELL",
        cellId: harness.cellIdAt(env.state, 0),
      });
      env.dispatch({ type: "SET_ANSWER", answer: 1 });
      env.dispatch({ type: "SCROLL", delta: 1 });
      const after = {
        rows: readRows(),
        answer: harness.answerAt(env.state, 0),
      };
      snapshots[String(count)] = { before, after };
    }
    return snapshots;
  });
  expect(result["2"].before.buttons).not.toContain("previous bar");
  expect(result["2"].before.range).toBeUndefined();
  expect(result["3"].before.buttons).not.toContain("next bar");
  expect(result["3"].before.range).toBeUndefined();
  expect(result["4"].before.buttons).toContain("previous bar");
  expect(result["4"].before.buttons).toContain("next bar");
  expect(result["4"].before.range).toBe("bars 1–3 of 4");
  expect(result["4"].after).toEqual({ rows: ["1", "2", "3"], answer: 1 });
  expect(result["7"].after.rows).toEqual(["1", "2", "3"]);
});

test("play controls and note taps keep a persistent cursor", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const { mountIdentify } = harness;
    const env = mountIdentify(7);
    const tone = env.container.querySelector<HTMLButtonElement>(
      'button[data-cell-index="4"]',
    );
    tone?.click();
    const afterTap = env.state.trial?.cursorOnsetIndex;
    const playDuringNote = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent?.trim() === "play");
    const notePlaybackControl = {
      label: playDuringNote?.textContent?.trim(),
      busy: playDuringNote?.getAttribute("aria-busy"),
    };
    const playbackLabels = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        '[data-ref^="restart"] button, [data-ref^="playPause"] button',
      ),
    ).map((button) => button.textContent?.trim());
    env.play.state = {
      status: "playing",
      buttonId: "tonic:melody",
      durationMs: 1000,
      queueLength: 0,
      onsetIndex: 8,
    };
    env.dispatch({ type: "SYNC_PLAYBACK" });
    const cursor = env.container.querySelector(
      'button[data-cell-index="8"][aria-current="true"]',
    )?.textContent;
    const viewport = env.state.trial?.firstVisibleMeasureIndex;
    const pauseLabel = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>("button"),
    )
      .find((button) => button.textContent?.trim() === "pause")
      ?.textContent?.trim();
    env.dispatch({ type: "PLAY_PAUSE" });
    env.dispatch({ type: "PLAY_PAUSE" });
    env.dispatch({ type: "PLAY_FROM_BEGINNING" });
    return {
      afterTap,
      cursor,
      viewport,
      notePlaybackControl,
      playbackLabels,
      pauseLabel,
      finalCursor: env.state.trial?.cursorOnsetIndex,
      finalViewport: env.state.trial?.firstVisibleMeasureIndex,
      calls: env.play.calls,
    };
  });
  expect(result.afterTap).toBe(4);
  expect(result.notePlaybackControl).toEqual({ label: "play", busy: null });
  expect(result.playbackLabels).toEqual(["from beginning", "play"]);
  expect(result.cursor).toBe("?");
  expect(result.viewport).toBe(2);
  expect(result.pauseLabel).toBe("pause");
  expect(result.finalCursor).toBe(0);
  expect(result.finalViewport).toBe(0);
  expect(result.calls).toContain("stop");
  expect(result.calls).toContain("autoplay:tonic:melody");
  expect(result.calls).toContain("autoplay:tonic:melody-restart");
});

test("combined answer controls fit a narrow mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const { mountIdentify } = harness;
    const env = mountIdentify(2);
    env.container.style.width = "320px";
    env.dispatch({
      type: "SELECT_CELL",
      cellId: harness.cellIdAt(env.state, 0),
    });
    const containerRect = env.container.getBoundingClientRect();
    const visibleButtons = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>("button"),
    ).filter((button) => button.style.display !== "none");
    const settings = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        '[data-ref^="context"] button, [data-ref^="changeKey"] button, [data-ref^="drone"] button, [data-ref^="changeSituations"] button',
      ),
    );
    const reveal = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent?.trim() === "reveal answers");
    return {
      palette: Array.from(
        env.container.querySelectorAll<HTMLButtonElement>(
          '[aria-label="answer choices"] button',
        ),
      ).map((button) => button.textContent),
      settingsCount: settings.length,
      settingsRows: new Set(
        settings.map((button) => button.getBoundingClientRect().top),
      ).size,
      revealRightAligned:
        reveal !== undefined &&
        Math.abs(
          reveal.getBoundingClientRect().right -
            (reveal.parentElement?.parentElement?.getBoundingClientRect()
              .right ?? 0),
        ) <= 1 &&
        reveal.getBoundingClientRect().width <
          (reveal.parentElement?.parentElement?.getBoundingClientRect().width ??
            0) -
            10,
      overflow: env.container.scrollWidth - env.container.clientWidth,
      buttonsWithinViewport: visibleButtons.every((button) => {
        const rect = button.getBoundingClientRect();
        return (
          rect.left >= containerRect.left && rect.right <= containerRect.right
        );
      }),
    };
  });

  expect(result.palette).toEqual([
    "?",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "other",
    "_",
  ]);
  expect(result.settingsCount).toBe(4);
  expect(result.settingsRows).toBe(1);
  expect(result.revealRightAligned).toBe(true);
  expect(result.overflow).toBe(0);
  expect(result.buttonsWithinViewport).toBe(true);
});

test("reveal shows the note, the check, and the struck wrong guess", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const harness = await import("/test/tonic-practice-harness.ts");
    const env = harness.mountIdentify(2);
    const answer = (index: number, value: 1 | "skip") => {
      env.dispatch({
        type: "SELECT_CELL",
        cellId: harness.cellIdAt(env.state, index),
      });
      env.dispatch({ type: "SET_ANSWER", answer: value });
    };
    answer(0, 1);
    answer(1, 1);
    answer(2, "skip");
    env.dispatch({ type: "REVEAL" });
    const cells = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        "button[data-cell-index]",
      ),
    ).map((cell) => ({
      text: cell.textContent?.trim(),
      result: cell.dataset.result,
      color: getComputedStyle(cell).color,
      parts: Array.from(
        cell.querySelectorAll<HTMLElement>("[data-part], [data-result-icon]"),
      )
        .filter((part) => part.style.display !== "none")
        .map((part) => part.dataset.part ?? part.dataset.resultIcon),
    }));
    return { cells, text: env.container.textContent };
  });
  expect(result.cells.map(({ text, result }) => ({ text, result }))).toEqual([
    { text: "1↓", result: "correct" },
    { text: "13", result: "incorrect" },
    { text: "5", result: "unanswered" },
    { text: "1", result: "unanswered" },
  ]);
  expect(result.cells.map(({ parts }) => parts)).toEqual([
    ["note", "correct"],
    ["incorrect", "guess", "note"],
    ["note"],
    ["note"],
  ]);
  expect(result.cells[0]?.color).not.toBe(result.cells[1]?.color);
  expect(result.cells[2]?.color).toBe(result.cells[3]?.color);
  expect(result.text).not.toContain("expected");
});
