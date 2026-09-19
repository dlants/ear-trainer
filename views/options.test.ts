import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("options", () => {
  test("persists the singing range", async ({ page }) => {
    const persisted = await page.evaluate(async () => {
      const { ProfileStore, setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx, storage } = setup();
      const state = initialState(ctx);
      update(state, { type: "SET_LOW_NOTE", note: 52 }, ctx);
      update(state, { type: "SET_HIGH_NOTE", note: 74 }, ctx);
      return new ProfileStore(storage).get("p1");
    });
    expect(persisted).toMatchObject({
      lowNote: 52,
      highNote: 74,
      cadenceSpeed: "medium",
    });
  });

  test("persists cadence speed and previews the cadence", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { ProfileStore, setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx, storage, play } = setup();
      const state = initialState(ctx);
      update(state, { type: "SET_CADENCE_SPEED", speed: "fast" }, ctx);
      return {
        cadenceSpeed: state.cadenceSpeed,
        persisted: new ProfileStore(storage).get("p1")?.cadenceSpeed,
        toggles: play.toggles,
      };
    });
    expect(result.cadenceSpeed).toBe("fast");
    expect(result.persisted).toBe("fast");
    expect(result.toggles).toEqual([
      {
        buttonId: "options:cadence:fast",
        step: {
          buttonId: "options:cadence:fast",
          type: "context",
          context: "major-cadence",
          tonic: 60,
          speed: "fast",
        },
      },
    ]);
  });

  test("pushes the opposite handle only to preserve the one-octave minimum", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, MIN_SINGING_SPAN, update } = await import(
        "/views/options.ts"
      );
      const { ctx } = setup();
      const state = initialState(ctx);

      update(state, { type: "SET_LOW_NOTE", note: 59 }, ctx);
      const lowWithinRange = { low: state.lowNote, high: state.highNote };
      update(state, { type: "SET_LOW_NOTE", note: 61 }, ctx);
      const lowPushesHigh = { low: state.lowNote, high: state.highNote };
      update(state, { type: "SET_LOW_NOTE", note: 58 }, ctx);
      const lowMovesBackAlone = { low: state.lowNote, high: state.highNote };
      update(state, { type: "SET_HIGH_NOTE", note: 69 }, ctx);
      const highPushesLow = { low: state.lowNote, high: state.highNote };
      update(state, { type: "SET_HIGH_NOTE", note: 75 }, ctx);
      const highMovesBackAlone = { low: state.lowNote, high: state.highNote };

      return {
        lowWithinRange,
        lowPushesHigh,
        lowMovesBackAlone,
        highPushesLow,
        highMovesBackAlone,
        MIN_SINGING_SPAN,
      };
    });

    expect(result.lowWithinRange).toEqual({ low: 59, high: 72 });
    expect(result.lowPushesHigh).toEqual({ low: 61, high: 73 });
    expect(result.lowMovesBackAlone).toEqual({ low: 58, high: 73 });
    expect(result.highPushesLow).toEqual({ low: 57, high: 69 });
    expect(result.highMovesBackAlone).toEqual({ low: 57, high: 75 });
    expect(result.lowPushesHigh.high - result.lowPushesHigh.low).toBe(
      result.MIN_SINGING_SPAN,
    );
    expect(result.highPushesLow.high - result.highPushesLow.low).toBe(
      result.MIN_SINGING_SPAN,
    );
  });

  test("keeps the visible track between the slider thumb centers", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, OptionsView, update } = await import(
        "/views/options.ts"
      );
      const { ctx } = setup();
      const state = initialState(ctx);
      const container = document.createElement("div");
      document.body.append(container);
      const view = new OptionsView(
        container,
        (msg) => {
          update(state, msg, ctx);
          view.sync(state);
        },
        state,
        ctx,
      );
      const input = container.querySelector<HTMLInputElement>(
        'input[aria-label="lowest note"]',
      );
      const rail = container.querySelector<HTMLElement>(".rail");
      if (!input || !rail) throw new Error("missing singing range");
      const inputRect = input.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      return {
        leftInset: railRect.left - inputRect.left,
        rightInset: inputRect.right - railRect.right,
        lowMin: input.min,
        lowMax: input.max,
        highMin: container.querySelector<HTMLInputElement>(
          'input[aria-label="highest note"]',
        )?.min,
      };
    });

    expect(result.leftInset).toBe(12);
    expect(result.rightInset).toBe(12);
    expect(result.lowMin).toBe("36");
    expect(result.lowMax).toBe("84");
    expect(result.highMin).toBe("36");
  });

  test("plays the released slider's current note", async ({ page }) => {
    const toggles = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx, play } = setup();
      const state = initialState(ctx);
      update(state, { type: "SET_LOW_NOTE", note: 52 }, ctx);
      update(state, { type: "PREVIEW", target: "low" }, ctx);
      return play.toggles;
    });
    expect(toggles).toEqual([
      {
        buttonId: "options:low-note",
        step: { buttonId: "options:low-note", type: "note", note: 52 },
      },
    ]);
  });

  test("adopts the note the microphone heard", async ({ page }) => {
    const tonic = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx } = setup();
      const state = initialState(ctx);
      update(state, { type: "MIC_MSG", msg: { type: "MIC_STARTED" } }, ctx);
      update(
        state,
        {
          type: "MIC_MSG",
          msg: {
            type: "MIC_READING",
            reading: {
              level: 0.1,
              meter: 1,
              pitch: { hz: 196.5, midi: 55.04 },
              spectrum: [],
            },
          },
        },
        ctx,
      );
      update(state, { type: "USE_HEARD_NOTE", target: "low" }, ctx);
      return state.lowNote;
    });
    expect(tonic).toBe(55);
  });

  test("keeps the last heard note through a silent reading", async ({
    page,
  }) => {
    const mic = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx } = setup();
      const state = initialState(ctx);
      update(state, { type: "MIC_MSG", msg: { type: "MIC_STARTED" } }, ctx);
      const pitch = { hz: 196.5, midi: 55.04 };
      const reading = (r: { level: number; pitch?: typeof pitch }) =>
        update(
          state,
          {
            type: "MIC_MSG",
            msg: {
              type: "MIC_READING",
              reading: { ...r, meter: 1, pitch: r.pitch, spectrum: [] },
            },
          },
          ctx,
        );
      reading({ level: 0.1, pitch });
      reading({ level: 0.001 });
      if (state.mic.status !== "listening") throw new Error("not listening");
      return {
        status: state.mic.status,
        level: state.mic.level,
        meter: state.mic.meter,
        pitch: state.mic.pitch,
        nextFrame: state.mic.nextFrame,
      };
    });
    expect(mic).toEqual({
      status: "listening",
      level: 0.001,
      meter: 1,
      pitch: { hz: 196.5, midi: 55.04 },
      nextFrame: 2,
    });
  });

  test("loops the 30 second spectrogram back over its oldest frames", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { SPECTROGRAM_FRAME_COUNT } = await import("/audio/mic-pitch.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx } = setup();
      const state = initialState(ctx);
      update(state, { type: "MIC_MSG", msg: { type: "MIC_STARTED" } }, ctx);
      for (let i = 0; i <= SPECTROGRAM_FRAME_COUNT; i++) {
        update(
          state,
          {
            type: "MIC_MSG",
            msg: {
              type: "MIC_READING",
              reading: {
                level: 0.1,
                meter: 1,
                pitch: undefined,
                spectrum: [i],
              },
            },
          },
          ctx,
        );
      }
      if (state.mic.status !== "listening") throw new Error("not listening");
      return {
        frameCount: state.mic.frames.length,
        first: state.mic.frames[0]?.spectrum[0],
        second: state.mic.frames[1]?.spectrum[0],
        nextFrame: state.mic.nextFrame,
      };
    });
    expect(result).toEqual({
      frameCount: 375,
      first: 375,
      second: 1,
      nextFrame: 1,
    });
  });

  test("renders a note-by-time spectrogram while listening", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, OptionsView, update } = await import(
        "/views/options.ts"
      );
      const { ctx } = setup();
      const state = initialState(ctx);
      const container = document.createElement("div");
      document.body.append(container);
      let view: InstanceType<typeof OptionsView>;
      const dispatch = (msg: Parameters<typeof update>[1]) => {
        update(state, msg, ctx);
        view.sync(state);
      };
      view = new OptionsView(container, dispatch, state, ctx);
      dispatch({ type: "MIC_MSG", msg: { type: "MIC_STARTED" } });
      const spectrum = new Array(49).fill(0);
      spectrum[24] = 1;
      dispatch({
        type: "MIC_MSG",
        msg: {
          type: "MIC_READING",
          reading: {
            level: 0.1,
            meter: 1,
            pitch: { hz: 261.6, midi: 60 },
            spectrum,
          },
        },
      });
      const canvas = container.querySelector("canvas");
      if (!canvas) throw new Error("no spectrogram");
      return {
        visible: getComputedStyle(canvas).display !== "none",
        label: canvas.getAttribute("aria-label"),
        width: canvas.width,
        height: canvas.height,
      };
    });
    expect(result.visible).toBe(true);
    expect(result.label).toContain("30 second timeline");
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test("surfaces a microphone failure", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx } = setup();
      const state = initialState(ctx);
      update(state, { type: "TOGGLE_MIC" }, ctx);
      const starting = state.mic.status;
      update(
        state,
        { type: "MIC_MSG", msg: { type: "MIC_ERROR", message: "denied" } },
        ctx,
      );
      return { starting, mic: state.mic };
    });
    expect(result.starting).toBe("starting");
    expect(result.mic).toEqual({ status: "error", message: "denied" });
  });

  test("formats MIDI pitches as readable note names", async ({ page }) => {
    const names = await page.evaluate(async () => {
      const { noteName } = await import("/views/options.ts");
      return [noteName(60), noteName(67)];
    });
    expect(names).toEqual(["C4", "G4"]);
  });

  test("preserves compact labels, aria labels, and slider-release previews", async ({
    page,
  }) => {
    const snapshot = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, OptionsView, update } = await import(
        "/views/options.ts"
      );
      const { ctx, play } = setup();
      const state = initialState(ctx);
      const container = document.createElement("div");
      document.body.append(container);
      let view: InstanceType<typeof OptionsView>;
      const dispatch = (msg: Parameters<typeof update>[1]) => {
        update(state, msg, ctx);
        view.sync(state);
      };
      view = new OptionsView(container, dispatch, state, ctx);

      const intro = container.querySelector(".intro");
      const introLegend =
        intro?.closest("fieldset")?.querySelector("legend")?.textContent ??
        null;
      const tagNames = [
        ...container.querySelectorAll("legend, input[type=range]"),
      ].map((element) => element.tagName);

      const fastCadence = container.querySelector<HTMLButtonElement>(
        '[aria-label="select fast cadence speed and preview cadence"]',
      );
      const hasFastCadence = fastCadence !== null;
      fastCadence?.click();
      const cadenceSpeed = state.cadenceSpeed;
      const cadencePressed = fastCadence?.getAttribute("aria-pressed") ?? null;
      const cadenceToggle = play.toggles.at(-1) ?? null;

      const tonicButton = container.querySelector<HTMLButtonElement>(
        '[aria-label="play lowest note"]',
      );
      const tonicLabel = tonicButton?.textContent?.trim() ?? null;
      const tonicClass = tonicButton?.className ?? "";
      const tonicSlider = container.querySelector<HTMLInputElement>(
        'input[aria-label="lowest note"]',
      );
      if (!tonicSlider) throw new Error("no tonic slider");
      tonicSlider.value = "52";
      tonicSlider.dispatchEvent(new Event("input", { bubbles: true }));
      tonicSlider.dispatchEvent(new Event("pointerup", { bubbles: true }));

      return {
        introLegend,
        tagNames,
        hasFastCadence,
        cadenceSpeed,
        cadencePressed,
        cadenceToggle,
        tonicLabel,
        tonicClass,
        movedTonicLabel: tonicButton?.textContent?.trim() ?? null,
        tonicToggle: play.toggles.at(-1) ?? null,
      };
    });

    expect(snapshot.introLegend).toBe("singing range");
    expect(snapshot.tagNames).toEqual(["LEGEND", "INPUT", "INPUT", "LEGEND"]);
    expect(snapshot.hasFastCadence).toBe(true);
    expect(snapshot.cadenceSpeed).toBe("fast");
    expect(snapshot.cadencePressed).toBe("true");
    expect(snapshot.cadenceToggle).toMatchObject({
      buttonId: "options:cadence:fast",
      step: { type: "context", speed: "fast" },
    });
    expect(snapshot.tonicLabel).toBe("F3");
    expect(snapshot.tonicClass).toContain("play-button-compact");
    expect(snapshot.movedTonicLabel).toBe("E3");
    expect(snapshot.tonicToggle).toEqual({
      buttonId: "options:low-note",
      step: { buttonId: "options:low-note", type: "note", note: 52 },
    });
  });
});
