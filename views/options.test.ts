import { describe, expect, it } from "vitest";
import type {
  PlayButtonId,
  PlayController,
  PlayState,
  PlayStep,
} from "../audio/play-controller.ts";
import { type Profile, ProfileStore } from "../deck/profiles.ts";
import type { KeyValueStore } from "../deck/store.ts";
import {
  initialState,
  MAX_TONIC,
  MIN_TONIC,
  noteName,
  type OptionsCtx,
  OptionsView,
  update,
} from "./options.ts";

class FakePlay {
  state: PlayState = { status: "idle" };
  toggles: { buttonId: PlayButtonId; step: PlayStep }[] = [];

  getState(): PlayState {
    return this.state;
  }

  toggle(buttonId: PlayButtonId, step: PlayStep): void {
    this.toggles.push({ buttonId, step });
  }
}

function memoryStorage(): KeyValueStore {
  const data: Record<string, string> = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

function setup(): {
  ctx: OptionsCtx;
  storage: KeyValueStore;
  play: FakePlay;
} {
  const storage = memoryStorage();
  const profiles = new ProfileStore(storage);
  const profile: Profile = {
    id: "p1",
    name: "me",
    color: "#000000",
    tonic: 60,
    cadenceSpeed: "medium",
    drone: true,
  };
  profiles.save(profile);
  const play = new FakePlay();
  return {
    ctx: { play: play as unknown as PlayController, profile, profiles },
    storage,
    play,
  };
}

describe("options", () => {
  it("persists the home note", () => {
    const { ctx, storage } = setup();
    const state = initialState(ctx);
    update(state, { type: "SET_TONIC", tonic: 52 }, ctx);
    expect(new ProfileStore(storage).get("p1")).toMatchObject({
      tonic: 52,
      cadenceSpeed: "medium",
    });
  });

  it("persists cadence speed and previews the cadence", () => {
    const { ctx, storage, play } = setup();
    const state = initialState(ctx);

    update(state, { type: "SET_CADENCE_SPEED", speed: "fast" }, ctx);

    expect(state.cadenceSpeed).toBe("fast");
    expect(new ProfileStore(storage).get("p1")?.cadenceSpeed).toBe("fast");
    expect(play.toggles).toEqual([
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

  it("clamps the home note to the playable range", () => {
    const { ctx } = setup();
    const state = initialState(ctx);
    update(state, { type: "SET_TONIC", tonic: 200 }, ctx);
    expect(state.tonic).toBe(MAX_TONIC);
    update(state, { type: "SET_TONIC", tonic: 0 }, ctx);
    expect(state.tonic).toBe(MIN_TONIC);
  });

  it("plays the released slider's current note", () => {
    const { ctx, play } = setup();
    const state = initialState(ctx);

    update(state, { type: "SET_TONIC", tonic: 52 }, ctx);
    update(state, { type: "PREVIEW" }, ctx);
    expect(play.toggles).toEqual([
      {
        buttonId: "options:tonic",
        step: { buttonId: "options:tonic", type: "note", note: 52 },
      },
    ]);
  });

  it("formats MIDI pitches as readable note names", () => {
    expect(noteName(60)).toBe("C4");
    expect(noteName(67)).toBe("G4");
  });

  it("preserves compact labels, aria labels, and slider-release previews", () => {
    const { ctx, play } = setup();
    const state = initialState(ctx);
    const container = document.createElement("div");
    let view: OptionsView;
    const dispatch = (msg: Parameters<typeof update>[1]) => {
      update(state, msg, ctx);
      view.sync(state);
    };
    view = new OptionsView(container, dispatch, state, ctx);

    const intro = container.querySelector(".intro");
    expect(
      intro?.closest("fieldset")?.querySelector("legend")?.textContent,
    ).toBe("key");
    expect(
      [...container.querySelectorAll("legend, input[type=range]")].map(
        (element) => element.tagName,
      ),
    ).toEqual(["LEGEND", "INPUT", "LEGEND"]);

    const fastCadence = container.querySelector<HTMLButtonElement>(
      '[aria-label="select fast cadence speed and preview cadence"]',
    );
    expect(fastCadence).not.toBeNull();
    fastCadence?.click();
    expect(state.cadenceSpeed).toBe("fast");
    expect(fastCadence?.getAttribute("aria-pressed")).toBe("true");
    expect(play.toggles.at(-1)).toMatchObject({
      buttonId: "options:cadence:fast",
      step: { type: "context", speed: "fast" },
    });

    const tonicButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="play home note"]',
    );
    expect(tonicButton?.textContent?.trim()).toBe("C4");
    expect(tonicButton?.className).toContain("play-button-compact");
    const tonicSlider = container.querySelector<HTMLInputElement>(
      'input[type="range"]',
    );
    if (!tonicSlider) throw new Error("no tonic slider");
    tonicSlider.value = "52";
    tonicSlider.dispatchEvent(new Event("input", { bubbles: true }));
    tonicSlider.dispatchEvent(new Event("change", { bubbles: true }));
    expect(tonicButton?.textContent?.trim()).toBe("E3");
    expect(play.toggles.at(-1)).toEqual({
      buttonId: "options:tonic",
      step: { buttonId: "options:tonic", type: "note", note: 52 },
    });
  });
});
