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
    tonicMode: "fixed",
    tonic: 60,
    tonicLow: 55,
    tonicHigh: 67,
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
  it("persists key mode and pitch settings", () => {
    const { ctx, storage } = setup();
    const state = initialState(ctx);

    update(state, { type: "SET_MODE", mode: "moving" }, ctx);
    update(state, { type: "SET_LOW", tonic: 52 }, ctx);
    update(state, { type: "SET_HIGH", tonic: 64 }, ctx);

    expect(new ProfileStore(storage).get("p1")).toMatchObject({
      tonicMode: "moving",
      tonicLow: 52,
      tonicHigh: 64,
    });
  });

  it("keeps the movable range ordered", () => {
    const { ctx } = setup();
    const state = initialState(ctx);

    update(state, { type: "SET_LOW", tonic: 70 }, ctx);
    expect(state.tonicLow).toBe(67);
    update(state, { type: "SET_HIGH", tonic: 50 }, ctx);
    expect(state.tonicHigh).toBe(67);
  });

  it("plays the released slider's current note", () => {
    const { ctx, play } = setup();
    const state = initialState(ctx);

    update(state, { type: "SET_LOW", tonic: 52 }, ctx);
    update(state, { type: "PREVIEW", setting: "low" }, ctx);

    expect(play.toggles).toEqual([
      {
        buttonId: "options:low",
        step: { buttonId: "options:low", type: "note", note: 52 },
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

    const tonicButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="play home note"]',
    );
    const lowButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="play lowest home note"]',
    );
    expect(tonicButton?.textContent?.trim()).toBe("C4");
    expect(lowButton?.textContent?.trim()).toBe("G3");
    expect(tonicButton?.className).toContain("play-button-compact");

    const lowSlider = container.querySelectorAll<HTMLInputElement>(
      'input[type="range"]',
    )[1];
    lowSlider.value = "52";
    lowSlider.dispatchEvent(new Event("input", { bubbles: true }));
    lowSlider.dispatchEvent(new Event("change", { bubbles: true }));

    expect(lowButton?.textContent?.trim()).toBe("E3");
    expect(play.toggles.at(-1)).toEqual({
      buttonId: "options:low",
      step: { buttonId: "options:low", type: "note", note: 52 },
    });
  });
});
