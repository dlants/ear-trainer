import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("the song screen", () => {
  test("lists each song's distinct patterns and hides the decomposition until complete", async ({
    page,
  }) => {
    const song = await page.evaluate(async () => {
      const { makeCtx } = await import("/test/songs-harness.ts");
      const { initialState, update } = await import("/views/songs.ts");
      const ctx = makeCtx();
      const state = initialState(ctx);
      update(state, { type: "SELECT", songId: "a" }, ctx);
      const song = state.songs[0];
      return {
        labels: song.patterns.map((p) => p.label),
        knownCount: song.knownCount,
        decomposition: song.decomposition,
      };
    });
    expect(song.labels).toEqual(["1-2-3", "3-2-1"]);
    expect(song.knownCount).toBe(0);
    expect(song.decomposition).toBe("");
  });

  test("shows the full decomposition, repeats included, once every pattern is known", async ({
    page,
  }) => {
    const decomposition = await page.evaluate(async () => {
      const { makeCtx } = await import("/test/songs-harness.ts");
      const { initialState, update } = await import("/views/songs.ts");
      const ctx = makeCtx();
      const state = initialState(ctx);
      update(state, { type: "ADD_ALL", songId: "a" }, ctx);
      return state.songs[0].decomposition;
    });
    expect(decomposition).toBe("1-2-3  ·  3-2-1  ·  1-2-3");
  });

  test("marks a pattern known in every song that references it", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { makeCtx, SONGS } = await import("/test/songs-harness.ts");
      const { initialState, update } = await import("/views/songs.ts");
      const ctx = makeCtx();
      const state = initialState(ctx);
      update(state, { type: "ADD", id: SONGS[0].patternIds[0] }, ctx);
      return {
        added: state.songs[1].patterns[0].added,
        knownCount: state.songs[1].knownCount,
      };
    });
    expect(result.added).toBe(true);
    expect(result.knownCount).toBe(1);
  });

  test("reflects a pattern added from outside the song screen", async ({
    page,
  }) => {
    const knownCount = await page.evaluate(async () => {
      const { makeCtx, SONGS } = await import("/test/songs-harness.ts");
      const { initialState } = await import("/views/songs.ts");
      const ctx = makeCtx();
      ctx.deck.addPattern(SONGS[0].patternIds[1], ctx.now());
      return initialState(ctx).songs[0].knownCount;
    });
    expect(knownCount).toBe(1);
  });

  test("selecting toggles, and only one song is open at a time", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { makeCtx } = await import("/test/songs-harness.ts");
      const { initialState, update } = await import("/views/songs.ts");
      const ctx = makeCtx();
      const state = initialState(ctx);
      update(state, { type: "SELECT", songId: "a" }, ctx);
      update(state, { type: "SELECT", songId: "b" }, ctx);
      const afterB = state.songs.map((s) => s.selected);
      update(state, { type: "SELECT", songId: "b" }, ctx);
      return { afterB, afterToggleOff: state.songs.map((s) => s.selected) };
    });
    expect(result.afterB).toEqual([false, true]);
    expect(result.afterToggleOff).toEqual([false, false]);
  });
});
