import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test("activity catalog exposes only the two activity links", async ({
  page,
}) => {
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
    {
      text: "Sing the tonic Hear a melody, then sing its home note.",
      href: "/activities/sing-tonic",
    },
    {
      text: "Identify the tonic notes Mark which notes in a melody sound like home.",
      href: "/activities/identify-tonic-notes",
    },
  ]);
  expect(result.text).not.toMatch(/practice|cards|song library/i);
});

test("sing-tonic support and answer playback require explicit actions", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountSing } = await import("/test/tonic-practice-harness.ts");
    const env = mountSing();
    const buttons = () =>
      Array.from(env.container.querySelectorAll("button")).filter(
        (button) => button.style.display !== "none",
      );
    const press = (label: string) => {
      const button = buttons().find((candidate) =>
        candidate.textContent?.includes(label),
      );
      if (!button) throw new Error(`missing ${label}`);
      button.click();
    };
    const initial = {
      calls: [...env.play.calls],
      labels: buttons().map((button) => button.textContent?.trim()),
    };
    press("key");
    press("drone off");
    press("repeat melody");
    press("reveal tonic");
    const revealed = buttons().map((button) => button.textContent?.trim());
    press("tonic");
    return {
      initial,
      revealed,
      calls: env.play.calls,
      drones: env.play.drones,
      phase: env.state.trial?.phase,
    };
  });
  expect(result.initial.calls).toEqual([]);
  expect(result.initial.labels).toContain("repeat melody");
  expect(result.initial.labels).not.toContain("tonic");
  expect(result.calls).toEqual([
    "toggle:trial:context",
    "toggle:tonic:melody",
    "autoplay:tonic:answer",
    "toggle:tonic:answer",
  ]);
  expect(result.drones).toEqual([60]);
  expect(result.phase).toBe("revealing");
  expect(result.revealed).toContain("tonic");
  expect(result.revealed).toContain("next melody");
});

test("slots use one shared extensible answer palette and keyed updates", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(3, [1, 3]);
    const slots = () =>
      Array.from(
        env.container.querySelectorAll<HTMLButtonElement>(
          "button[data-event-index]",
        ),
      );
    const first = slots()[0];
    const initial = slots().map((slot) => slot.textContent);
    first.click();
    const palette = Array.from(
      env.container.querySelectorAll<HTMLElement>(
        '[aria-label="answer choices"] button',
      ),
    );
    const labels = palette.map((button) => button.textContent);
    palette.find((button) => button.textContent === "3")?.click();
    const sameNodeAfterAnswer = first === slots()[0];
    const afterThree = slots().map((slot) => slot.textContent);
    first.click();
    palette.find((button) => button.textContent === "?")?.click();
    const tonicOnly = mountIdentify(2);
    tonicOnly.container
      .querySelector<HTMLButtonElement>('button[data-event-index="0"]')
      ?.click();
    const notOne = Array.from(
      tonicOnly.container.querySelectorAll<HTMLButtonElement>(
        '[aria-label="answer choices"] button',
      ),
    ).find((button) => button.textContent === "not 1");
    notOne?.click();
    return {
      initial,
      labels,
      afterThree,
      reset: slots().map((slot) => slot.textContent),
      sameNodeAfterAnswer,
      tonicOnlyAnswer: tonicOnly.state.trial?.answers[0],
    };
  });
  expect(result.initial.every((value) => value === "?")).toBe(true);
  expect(result.labels).toEqual(["?", "1", "3", "other"]);
  expect(result.afterThree[0]).toBe("3");
  expect(result.afterThree.slice(1).every((value) => value === "?")).toBe(true);
  expect(result.reset[0]).toBe("?");
  expect(result.sameNodeAfterAnswer).toBe(true);
  expect(result.tonicOnlyAnswer).toBe("other");
});

test("slot geometry follows authored rhythm and ignores pitch", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(2);
    const slots = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        "button[data-event-index]",
      ),
    );
    const rows = Array.from(
      env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
    );
    return {
      slots: slots.map((slot) => ({
        left: slot.style.left,
        width: slot.style.width,
      })),
      rowCount: rows.length,
      beatCounts: rows.map(
        (row) => row.querySelectorAll('[class*="tonic-beat"]').length,
      ),
    };
  });
  expect(result.slots).toEqual([
    { left: "0%", width: "25%" },
    { left: "50%", width: "50%" },
    { left: "0%", width: "25%" },
    { left: "50%", width: "50%" },
  ]);
  expect(result.rowCount).toBe(2);
  expect(result.beatCounts).toEqual([3, 3]);
});

test("viewport shows at most three complete measures and scrolls one bar", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const snapshots: Record<
      string,
      {
        before: { rows: string[]; range: string | undefined };
        afterOne: { rows: string[]; range: string | undefined };
        final: { rows: string[]; range: string | undefined };
        answer: number | string | undefined;
      }
    > = {};
    for (const count of [2, 3, 4, 7]) {
      const env = mountIdentify(count);
      const read = () => ({
        rows: Array.from(
          env.container.querySelectorAll<HTMLElement>("[data-measure-index]"),
        ).map((row) => row.dataset.measureIndex ?? ""),
        range: Array.from(env.container.querySelectorAll("span")).find((span) =>
          span.textContent?.startsWith("bars "),
        )?.textContent,
      });
      const before = read();
      env.dispatch({ type: "SELECT_SLOT", eventIndex: 0 });
      env.dispatch({ type: "SET_ANSWER", answer: 1 });
      env.dispatch({ type: "SCROLL", delta: 1 });
      const afterOne = read();
      for (let index = 0; index < 10; index += 1) {
        env.dispatch({ type: "SCROLL", delta: 1 });
      }
      snapshots[String(count)] = {
        before,
        afterOne,
        final: read(),
        answer: env.state.trial?.answers[0],
      };
    }
    return snapshots;
  });
  expect(result["2"]).toMatchObject({
    before: { rows: ["0", "1"], range: "bars 1–2 of 2" },
    afterOne: { rows: ["0", "1"] },
  });
  expect(result["3"].before).toEqual({
    rows: ["0", "1", "2"],
    range: "bars 1–3 of 3",
  });
  expect(result["4"].afterOne).toEqual({
    rows: ["1", "2", "3"],
    range: "bars 2–4 of 4",
  });
  expect(result["7"].final).toEqual({
    rows: ["4", "5", "6"],
    range: "bars 5–7 of 7",
  });
  expect(result["7"].answer).toBe(1);
});

test("replay and playback cues reset or minimally advance the viewport", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(7);
    for (let index = 0; index < 4; index += 1) {
      env.dispatch({ type: "SCROLL", delta: 1 });
    }
    env.dispatch({ type: "REPEAT" });
    const afterReplay = env.state.trial?.firstVisibleMeasureIndex;

    env.play.state = {
      status: "playing",
      buttonId: "tonic:melody",
      durationMs: 1000,
      queueLength: 0,
      eventIndex: 6,
    };
    env.dispatch({ type: "SYNC_PLAYBACK" });
    const afterBarFour = env.state.trial?.firstVisibleMeasureIndex;
    const playing = env.container.querySelector(
      'button[data-event-index="6"][aria-current="true"]',
    )?.textContent;

    env.play.state = {
      status: "playing",
      buttonId: "tonic:melody",
      durationMs: 1000,
      queueLength: 0,
    };
    env.dispatch({ type: "SYNC_PLAYBACK" });
    const duringRest = env.container.querySelector('[aria-current="true"]');

    env.play.state = { status: "idle" };
    env.dispatch({ type: "SYNC_PLAYBACK" });
    const beforeStale = env.state.trial?.firstVisibleMeasureIndex;
    const afterStale = env.state.trial?.firstVisibleMeasureIndex;
    return {
      afterReplay,
      afterBarFour,
      playing,
      duringRest: duringRest !== null,
      beforeStale,
      afterStale,
      calls: env.play.calls,
    };
  });
  expect(result.afterReplay).toBe(0);
  expect(result.afterBarFour).toBe(1);
  expect(result.playing).toContain("playing");
  expect(result.duringRest).toBe(false);
  expect(result.afterStale).toBe(result.beforeStale);
  expect(result.calls).toContain("toggle:tonic:melody");
});

test("reveal shows semantic text results and locks answer editing", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { mountIdentify } = await import("/test/tonic-practice-harness.ts");
    const env = mountIdentify(2);
    const answer = (eventIndex: number, value: 1 | "other") => {
      env.dispatch({ type: "SELECT_SLOT", eventIndex });
      env.dispatch({ type: "SET_ANSWER", answer: value });
    };
    answer(0, 1);
    answer(1, 1);
    env.dispatch({ type: "REVEAL" });
    const revealed = Array.from(
      env.container.querySelectorAll<HTMLButtonElement>(
        "button[data-event-index]",
      ),
    ).map((slot) => ({
      result: slot.dataset.result,
      text: slot.textContent,
      disabled: slot.disabled,
    }));
    env.dispatch({ type: "SELECT_SLOT", eventIndex: 2 });
    env.dispatch({ type: "SET_ANSWER", answer: 1 });
    return {
      revealed,
      answers: env.state.trial?.answers.map((value) => value ?? null),
      paletteButtons: env.container.querySelectorAll(
        '[aria-label="answer choices"] button',
      ).length,
    };
  });
  expect(result.revealed.map((slot) => slot.result)).toEqual([
    "correct",
    "extra",
    "unanswered",
    "missed",
  ]);
  expect(result.revealed.every((slot) => slot.disabled)).toBe(true);
  expect(result.revealed.map((slot) => slot.text)).toEqual([
    "1 · expected 1 · correct",
    "1 · expected not a prompted degree · extra",
    "? · expected not a prompted degree · unanswered",
    "? · expected 1 · missed",
  ]);
  expect(result.answers).toEqual([1, 1, null, null]);
  expect(result.paletteButtons).toBe(0);
});
