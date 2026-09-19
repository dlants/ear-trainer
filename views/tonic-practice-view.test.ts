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

  expect(result.count).toBe(27);
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
    "authentic-cadence-inverted",
    "two-five-one-block",
    "two-five-one-arpeggiated",
    "plagal-cadence",
    "deceptive-cadence",
    "pop-progression",
  ]);
  expect(result.labels.every((label) => (label?.length ?? 0) > 10)).toBe(true);
  expect(result.afterPointer.selected).toEqual([
    "tonic",
    "dominant-adjacent-tonic",
  ]);
  expect(result.afterPointer.vocabulary).toBe(
    "? · 1 · 2 · 3 · 4 · 5 · 6 · 7 · other",
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
      eventCount: env.state.trial?.answers.length,
      toneSlots: env.container.querySelectorAll('button[data-row="tone"]')
        .length,
      guessSlots: env.container.querySelectorAll(
        '[data-row="guess"][data-event-index]',
      ).length,
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
      .querySelector<HTMLButtonElement>(
        'button[data-row="tone"][data-event-index="0"]',
      )
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
    toneSlots: 4,
    guessSlots: 4,
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

test("guess cells are blank until answered through the shared palette", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(2);
    const tones = () =>
      Array.from(
        env.container.querySelectorAll<HTMLButtonElement>(
          'button[data-row="tone"]',
        ),
      );
    const guesses = () =>
      Array.from(
        env.container.querySelectorAll<HTMLElement>(
          '[data-row="guess"][data-event-index]',
        ),
      );
    const initial = {
      tones: tones().map((slot) => slot.textContent),
      guesses: guesses().map((slot) => slot.textContent),
      beatCounts: Array.from(
        env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
      ).map((measure) => measure.querySelectorAll("[data-beat]").length),
      beatRows: Array.from(
        env.container.querySelectorAll<HTMLElement>("[data-beat]"),
      ).map((beat) =>
        Array.from(beat.querySelectorAll<HTMLElement>("[data-row]")).map(
          (row) => row.dataset.row,
        ),
      ),
      measureChildCounts: Array.from(
        env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
      ).map((measure) => measure.querySelector("section")?.children.length),
    };
    const first = guesses()[0];
    tones()[0]?.click();
    const palette = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="answer choices"] button',
      ),
    );
    const paletteLabels = palette.map((button) => button.textContent);
    palette.find((button) => button.textContent === "1")?.click();
    const marked = guesses()[0]?.textContent;
    tones()[0]?.click();
    palette.find((button) => button.textContent === "?")?.click();
    tones()[1]?.click();
    return {
      initial,
      paletteLabels,
      marked,
      reset: guesses()[0]?.textContent,
      sameNode: first === guesses()[0],
      guessTags: guesses().map((slot) => slot.tagName),
      selectedSlot: env.state.trial?.selectedSlotIndex,
      cursor: env.state.trial?.cursorEventIndex,
      notePlayCount: env.play.calls.filter(
        (call) => call === "autoplay:tonic:melody-note",
      ).length,
    };
  });
  expect(result.initial.tones.every((value) => value === "?")).toBe(true);
  expect(result.initial.guesses.every((value) => value === "")).toBe(true);
  expect(result.initial.beatCounts).toEqual([2, 2]);
  expect(result.initial.beatRows).toEqual([
    ["tone", "guess"],
    ["tone", "guess"],
    ["tone", "guess"],
    ["tone", "guess"],
  ]);
  expect(result.initial.measureChildCounts).toEqual([1, 1]);
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
  ]);
  expect(result.marked).toBe("1");
  expect(result.reset).toBe("");
  expect(result.sameNode).toBe(true);
  expect(result.guessTags.every((tag) => tag === "SPAN")).toBe(true);
  expect(result.selectedSlot).toBe(1);
  expect(result.cursor).toBe(1);
  expect(result.notePlayCount).toBe(3);
});

test("each rhythmic beat is a vertical tone and guess cell", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(2);
    const beats = Array.from(
      env.container.querySelectorAll<HTMLElement>("[data-beat]"),
    );
    env.container
      .querySelector<HTMLButtonElement>(
        'button[data-row="tone"][data-event-index="0"]',
      )
      ?.click();
    const selected = env.container.querySelector<HTMLElement>(
      '[data-beat="0"][data-selected="true"]',
    );
    const selectedTone =
      selected?.querySelector<HTMLElement>('[data-row="tone"]');
    const selectedGuess =
      selected?.querySelector<HTMLElement>('[data-row="guess"]');
    const selectedToneRect = selectedTone?.getBoundingClientRect();
    const selectedGuessRect = selectedGuess?.getBoundingClientRect();
    return {
      beats: beats.map((beat) => ({
        left: beat.style.left,
        width: beat.style.width,
        rows: Array.from(beat.querySelectorAll<HTMLElement>("[data-row]")).map(
          (row) => row.dataset.row,
        ),
      })),
      topLevelBeatCounts: Array.from(
        env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
      ).map(
        (measure) =>
          measure.querySelector("section")?.firstElementChild?.children.length,
      ),
      selectedBoxOnlyCoversTone:
        selected !== null &&
        selectedTone !== undefined &&
        selectedTone !== null &&
        selectedToneRect !== undefined &&
        selectedGuessRect !== undefined &&
        getComputedStyle(selected).borderTopWidth === "0px" &&
        getComputedStyle(selectedTone).borderTopWidth === "2px" &&
        selectedToneRect.bottom <= selectedGuessRect.top,
    };
  });
  expect(result.beats).toEqual([
    {
      left: "calc(0% + 2px)",
      width: "calc(25% - 4px)",
      rows: ["tone", "guess"],
    },
    {
      left: "calc(50% + 2px)",
      width: "calc(50% - 4px)",
      rows: ["tone", "guess"],
    },
    {
      left: "calc(0% + 2px)",
      width: "calc(25% - 4px)",
      rows: ["tone", "guess"],
    },
    {
      left: "calc(50% + 2px)",
      width: "calc(50% - 4px)",
      rows: ["tone", "guess"],
    },
  ]);
  expect(result.topLevelBeatCounts).toEqual([2, 2]);
  expect(result.selectedBoxOnlyCoversTone).toBe(true);
});

test("viewport hides bar controls when every bar is visible", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
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
      env.dispatch({ type: "SELECT_SLOT", eventIndex: 0 });
      env.dispatch({ type: "SET_ANSWER", answer: 1 });
      env.dispatch({ type: "SCROLL", delta: 1 });
      const after = { rows: readRows(), answer: env.state.trial?.answers[0] };
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
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(7);
    const tone = env.container.querySelector<HTMLButtonElement>(
      'button[data-row="tone"][data-event-index="4"]',
    );
    tone?.click();
    const afterTap = env.state.trial?.cursorEventIndex;
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
      eventIndex: 8,
    };
    env.dispatch({ type: "SYNC_PLAYBACK" });
    const cursor = env.container.querySelector(
      'button[data-row="tone"][data-event-index="8"][aria-current="true"]',
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
      finalCursor: env.state.trial?.cursorEventIndex,
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
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(2);
    env.container.style.width = "320px";
    env.dispatch({ type: "SELECT_SLOT", eventIndex: 0 });
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
  ]);
  expect(result.settingsCount).toBe(4);
  expect(result.settingsRows).toBe(1);
  expect(result.revealRightAligned).toBe(true);
  expect(result.overflow).toBe(0);
  expect(result.buttonsWithinViewport).toBe(true);
});

test("reveal keeps unanswered notes neutral", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(2);
    env.dispatch({ type: "SELECT_SLOT", eventIndex: 0 });
    env.dispatch({ type: "SET_ANSWER", answer: 1 });
    env.dispatch({ type: "SELECT_SLOT", eventIndex: 1 });
    env.dispatch({ type: "SET_ANSWER", answer: 1 });
    env.dispatch({ type: "REVEAL" });
    const tones = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        'button[data-row="tone"]',
      ),
    ).map((slot) => ({
      text: slot.textContent,
      result: slot.dataset.result ?? null,
    }));
    const guesses = Array.from(
      env.container.querySelectorAll<HTMLElement>(
        '[data-row="guess"][data-event-index]',
      ),
    ).map((slot) => ({
      text: slot.textContent?.trim(),
      result: slot.dataset.result ?? null,
      tag: slot.tagName,
      color: getComputedStyle(slot).color,
      background: getComputedStyle(slot).backgroundColor,
      icon: Array.from(
        slot.querySelectorAll<HTMLElement>("[data-result-icon]"),
      ).find((candidate) => candidate.style.display !== "none")?.dataset
        .resultIcon,
    }));
    env.dispatch({ type: "SELECT_SLOT", eventIndex: 2 });
    env.dispatch({ type: "SET_ANSWER", answer: 1 });
    return {
      tones,
      guesses,
      answers: env.state.trial?.answers.map((value) => value ?? null),
      text: env.container.textContent,
    };
  });
  expect(result.tones).toEqual([
    { text: "1↓", result: null },
    { text: "3", result: null },
    { text: "5", result: null },
    { text: "1", result: null },
  ]);
  expect(
    result.guesses.map(({ text, result, icon }) => ({ text, result, icon })),
  ).toEqual([
    { text: "1", result: "correct", icon: "correct" },
    { text: "1", result: "incorrect", icon: "incorrect" },
    { text: "", result: null, icon: undefined },
    { text: "", result: null, icon: undefined },
  ]);
  expect(
    result.guesses.every(({ background }) => background === "rgba(0, 0, 0, 0)"),
  ).toBe(true);
  expect(result.guesses[0]?.color).not.toBe(result.guesses[1]?.color);
  expect(result.guesses.every((slot) => slot.tag === "SPAN")).toBe(true);
  expect(result.answers).toEqual([1, 1, null, null]);
  expect(result.text).not.toContain("expected");
});
