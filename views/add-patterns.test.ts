import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test.describe("the add screen", () => {
  test("formats each entry and marks nothing added on an empty deck", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { initialState } = await import("/views/add-patterns.ts");
      const state = initialState(makeCtx());
      return {
        rows: state.rows.map((r) => [r.pattern.id, r.status]),
        ids: INVENTORY.map((entry) => entry.id),
      };
    });
    expect(result.rows).toEqual([
      [result.ids[0], "proposed"],
      [result.ids[1], "proposed"],
    ]);
  });

  test("renders patterns with the shared notation view", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { makeCtx } = await import("/test/add-patterns-harness.ts");
      const { AddPatternsView, initialState } = await import(
        "/views/add-patterns.ts"
      );
      const state = initialState(makeCtx());
      const container = document.createElement("div");
      new AddPatternsView(container, () => {}, state);

      const firstRow = container.querySelector("li");
      return {
        events: firstRow?.querySelectorAll("[data-notation-event]").length,
        notes: firstRow?.querySelectorAll("[data-notation-note]").length,
        text: firstRow?.textContent ?? "",
      };
    });
    expect(result.events).toBe(3);
    expect(result.notes).toBe(3);
    expect(result.text).not.toContain("5-3-1");
  });

  test("shows a caret that rotates with the expanded state", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { AddPatternsView, initialState, update } = await import(
        "/views/add-patterns.ts"
      );
      const ctx = makeCtx();
      const state = initialState(ctx);
      const container = document.createElement("div");
      const view = new AddPatternsView(container, () => {}, state);
      const caret = container.querySelector(".summary > span");
      const collapsedClass = caret?.className;
      const hasIcon = caret?.querySelector("svg") !== null;

      update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[0].id }, ctx);
      view.sync(state);

      return {
        hasIcon,
        collapsedClass,
        expandedClass: caret?.className,
        ariaExpanded: container
          .querySelector<HTMLButtonElement>(".toggle-details")
          ?.getAttribute("aria-expanded"),
      };
    });
    expect(result.hasIcon).toBe(true);
    expect(result.expandedClass).not.toBe(result.collapsedClass);
    expect(result.ariaExpanded).toBe("true");
  });

  test("toggles one expanded row at a time", async ({ page }) => {
    const expansions = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { initialState, update } = await import("/views/add-patterns.ts");
      const ctx = makeCtx();
      const state = initialState(ctx);
      const expanded = () => state.rows.map((row) => row.expanded);
      const snapshots: boolean[][] = [];

      update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[0].id }, ctx);
      snapshots.push(expanded());
      update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[1].id }, ctx);
      snapshots.push(expanded());
      update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[1].id }, ctx);
      snapshots.push(expanded());
      return snapshots;
    });
    expect(expansions[0]).toEqual([true, false]);
    expect(expansions[1]).toEqual([false, true]);
    expect(expansions[2]).toEqual([false, false]);
  });

  test("renders corpus and per-mode FSRS details with help tooltips", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { AddPatternsView, initialState, update } = await import(
        "/views/add-patterns.ts"
      );
      const ctx = makeCtx();
      ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
      const transcription = Object.values(ctx.deck.getState().cards).find(
        (card) =>
          card.patternId === INVENTORY[0].id && card.mode === "transcription",
      );
      if (!transcription) throw new Error("missing transcription card");
      ctx.deck.grade(transcription.id, "known", "got-it", ctx.now());

      const state = initialState(ctx);
      update(state, { type: "TOGGLE_DETAILS", id: INVENTORY[0].id }, ctx);
      const container = document.createElement("div");
      new AddPatternsView(container, () => {}, state);

      const firstRow = container.querySelector("li");
      return {
        text: firstRow?.textContent ?? "",
        headings: [...(firstRow?.querySelectorAll("h3") ?? [])].map((heading) =>
          heading.textContent?.trim(),
        ),
        tooltips: firstRow?.querySelectorAll('[role="tooltip"]').length,
      };
    });
    expect(result.text).toContain("Occurs 4 times in the corpus.");
    expect(result.headings).toEqual(["Transcription", "Audiation"]);
    expect(result.text).toContain("Estimated recall");
    expect(result.text).toContain("Stability");
    expect(result.text).toContain("Difficulty");
    expect(result.tooltips).toBe(14);
    expect(result.text).toContain("2.3 days");
    expect(result.text).toContain("2.1 / 10");
    expect(result.text).toContain("Not available");
  });

  test("keeps row expansion separate from add and remove actions", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { AddPatternsView, initialState } = await import(
        "/views/add-patterns.ts"
      );
      const state = initialState(makeCtx());
      const messages: unknown[] = [];
      const container = document.createElement("div");
      new AddPatternsView(container, (msg) => messages.push(msg), state);

      const firstRow = container.querySelector("li");
      firstRow
        ?.querySelector<HTMLButtonElement>('[aria-label="show card details"]')
        ?.click();
      firstRow
        ?.querySelector<HTMLButtonElement>("button.action:last-child")
        ?.click();

      return { messages, id: INVENTORY[0].id };
    });
    expect(result.messages).toEqual([
      { type: "TOGGLE_DETAILS", id: result.id },
      { type: "ADD_TO_DECK", id: result.id },
    ]);
  });

  test("marks a pattern as in the deck regardless of where it was added", async ({
    page,
  }) => {
    const statuses = await page.evaluate(async () => {
      const { makeCtx } = await import("/test/add-patterns-harness.ts");
      const { initialState, update } = await import("/views/add-patterns.ts");
      const { asPatternId } = await import("/test/add-patterns-harness.ts");
      const ctx = makeCtx();
      const state = initialState(ctx);
      ctx.deck.addPattern(asPatternId("major-cadence|5-3-1"), ctx.now());
      update(
        state,
        { type: "ADD_TO_DECK", id: asPatternId("major-cadence|b3-2") },
        ctx,
      );
      return state.rows.map((r) => r.status);
    });
    expect(statuses).toEqual(["deck", "deck"]);
  });

  test("shows proposed cards and the deck by default, but hides known cards", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { initialState } = await import("/views/add-patterns.ts");
      const ctx = makeCtx();
      ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
      ctx.deck.addPattern(INVENTORY[1].id, ctx.now());
      ctx.deck.markPatternKnown(INVENTORY[1].id);
      const state = initialState(ctx);

      return {
        showKnown: state.showKnown,
        showDeck: state.showDeck,
        visibleIds: state.rows
          .filter(
            (row) =>
              row.status === "proposed" ||
              (row.status === "deck" && state.showDeck) ||
              (row.status === "known" && state.showKnown),
          )
          .map((row) => row.id),
        firstId: INVENTORY[0].id,
      };
    });
    expect(result.showKnown).toBe(false);
    expect(result.showDeck).toBe(true);
    expect(result.visibleIds).toEqual([result.firstId]);
  });

  test("filters known cards and the deck independently", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { initialState, update } = await import("/views/add-patterns.ts");
      const ctx = makeCtx();
      ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
      ctx.deck.addPattern(INVENTORY[1].id, ctx.now());
      ctx.deck.markPatternKnown(INVENTORY[1].id);
      const state = initialState(ctx);

      update(state, { type: "SET_SHOW_DECK", value: false }, ctx);
      update(state, { type: "SET_SHOW_KNOWN", value: true }, ctx);

      return { showDeck: state.showDeck, showKnown: state.showKnown };
    });
    expect(result.showDeck).toBe(false);
    expect(result.showKnown).toBe(true);
  });

  test("removes a pattern from the deck and returns it to proposed", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { initialState, update } = await import("/views/add-patterns.ts");
      const ctx = makeCtx();
      ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
      const state = initialState(ctx);

      update(state, { type: "REMOVE_FROM_DECK", id: INVENTORY[0].id }, ctx);

      return {
        status: state.rows[0]?.status,
        cardCount: Object.keys(ctx.deck.getState().cards).length,
      };
    });
    expect(result.status).toBe("proposed");
    expect(result.cardCount).toBe(0);
  });

  test("marks a deck card known and hides it by default", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { initialState, update } = await import("/views/add-patterns.ts");
      const ctx = makeCtx();
      ctx.deck.addPattern(INVENTORY[0].id, ctx.now());
      const state = initialState(ctx);

      update(state, { type: "MARK_KNOWN", id: INVENTORY[0].id }, ctx);

      return { status: state.rows[0]?.status, showKnown: state.showKnown };
    });
    expect(result.status).toBe("known");
    expect(result.showKnown).toBe(false);
  });

  test("adding twice does not duplicate cards", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { INVENTORY, makeCtx } = await import(
        "/test/add-patterns-harness.ts"
      );
      const { initialState, update } = await import("/views/add-patterns.ts");
      const ctx = makeCtx();
      const state = initialState(ctx);
      const msg = { type: "ADD_TO_DECK", id: INVENTORY[0].id } as const;
      update(state, msg, ctx);
      const ids = Object.keys(ctx.deck.getState().cards);
      update(state, msg, ctx);
      return { ids, after: Object.keys(ctx.deck.getState().cards) };
    });
    expect(result.after).toEqual(result.ids);
    expect(result.ids).toHaveLength(2);
  });
});
