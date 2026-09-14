import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("options", () => {
  test("persists the home note", async ({ page }) => {
    const persisted = await page.evaluate(async () => {
      const { ProfileStore, setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx, storage } = setup();
      const state = initialState(ctx);
      update(state, { type: "SET_TONIC", tonic: 52 }, ctx);
      return new ProfileStore(storage).get("p1");
    });
    expect(persisted).toMatchObject({ tonic: 52, cadenceSpeed: "medium" });
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

  test("clamps the home note to the playable range", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, MAX_TONIC, MIN_TONIC, update } = await import(
        "/views/options.ts"
      );
      const { ctx } = setup();
      const state = initialState(ctx);
      update(state, { type: "SET_TONIC", tonic: 200 }, ctx);
      const high = state.tonic;
      update(state, { type: "SET_TONIC", tonic: 0 }, ctx);
      return { high, low: state.tonic, MAX_TONIC, MIN_TONIC };
    });
    expect(result.high).toBe(result.MAX_TONIC);
    expect(result.low).toBe(result.MIN_TONIC);
  });

  test("plays the released slider's current note", async ({ page }) => {
    const toggles = await page.evaluate(async () => {
      const { setup } = await import("/test/options-harness.ts");
      const { initialState, update } = await import("/views/options.ts");
      const { ctx, play } = setup();
      const state = initialState(ctx);
      update(state, { type: "SET_TONIC", tonic: 52 }, ctx);
      update(state, { type: "PREVIEW" }, ctx);
      return play.toggles;
    });
    expect(toggles).toEqual([
      {
        buttonId: "options:tonic",
        step: { buttonId: "options:tonic", type: "note", note: 52 },
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
            },
          },
        },
        ctx,
      );
      update(state, { type: "USE_HEARD_NOTE" }, ctx);
      return state.tonic;
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
              reading: { ...r, meter: 1, pitch: r.pitch },
            },
          },
          ctx,
        );
      reading({ level: 0.1, pitch });
      reading({ level: 0.001 });
      return state.mic;
    });
    expect(mic).toEqual({
      status: "listening",
      level: 0.001,
      meter: 1,
      pitch: { hz: 196.5, midi: 55.04 },
    });
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
        '[aria-label="play home note"]',
      );
      const tonicLabel = tonicButton?.textContent?.trim() ?? null;
      const tonicClass = tonicButton?.className ?? "";
      const tonicSlider = container.querySelector<HTMLInputElement>(
        'input[type="range"]',
      );
      if (!tonicSlider) throw new Error("no tonic slider");
      tonicSlider.value = "52";
      tonicSlider.dispatchEvent(new Event("input", { bubbles: true }));
      tonicSlider.dispatchEvent(new Event("change", { bubbles: true }));

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

    expect(snapshot.introLegend).toBe("key");
    expect(snapshot.tagNames).toEqual(["LEGEND", "INPUT", "LEGEND"]);
    expect(snapshot.hasFastCadence).toBe(true);
    expect(snapshot.cadenceSpeed).toBe("fast");
    expect(snapshot.cadencePressed).toBe("true");
    expect(snapshot.cadenceToggle).toMatchObject({
      buttonId: "options:cadence:fast",
      step: { type: "context", speed: "fast" },
    });
    expect(snapshot.tonicLabel).toBe("C4");
    expect(snapshot.tonicClass).toContain("play-button-compact");
    expect(snapshot.movedTonicLabel).toBe("E3");
    expect(snapshot.tonicToggle).toEqual({
      buttonId: "options:tonic",
      step: { buttonId: "options:tonic", type: "note", note: 52 },
    });
  });
});
