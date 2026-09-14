import { expect, test } from "@playwright/test";
import { parseRoute, type RouterMsg, routeToPath } from "./router.ts";
import { HARNESS_URL } from "./test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
  await page.evaluate(() => history.replaceState(null, "", "/"));
});

test.describe("router", () => {
  test("round-trips every route", () => {
    const routes = [
      { page: "practice" },
      { page: "cards" },
      { page: "songs" },
      { page: "options" },
    ] as const;
    for (const route of routes)
      expect(parseRoute(routeToPath(route))).toEqual(route);
  });

  test("writes controller navigation to browser history", async ({ page }) => {
    const pathname = await page.evaluate(async () => {
      const { RouterController, RouterView } = await import("/router.ts");
      const controller = new RouterController({ page: "practice" });
      const view = new RouterView(controller, () => {});

      controller.update({ type: "NAVIGATE", route: { page: "cards" } });
      view.sync();

      return window.location.pathname;
    });

    expect(pathname).toBe("/cards");
  });

  test("leaves router-ignored links to native navigation", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { RouterView, RouterController } = await import("/router.ts");
      const messages: RouterMsg[] = [];
      const controller = new RouterController({ page: "practice" });
      const view = new RouterView(controller, (msg) => messages.push(msg));
      const link = document.createElement("a");
      link.href = "/";
      link.setAttribute("data-router-ignore", "");
      document.body.append(link);
      view.mount();

      // The harness must not actually navigate, so a window-level listener
      // records the outcome after the router has had its chance and then
      // suppresses the browser's default follow-the-link behavior.
      let defaultPrevented = false;
      window.addEventListener(
        "click",
        (event) => {
          defaultPrevented = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );

      link.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );

      view.destroy();
      link.remove();
      return { messages, defaultPrevented };
    });

    expect(result.messages).toEqual([]);
    expect(result.defaultPrevented).toBe(false);
  });

  test("turns local link clicks into navigation messages", async ({ page }) => {
    const messages = await page.evaluate(async () => {
      const { RouterView, RouterController } = await import("/router.ts");
      const messages: RouterMsg[] = [];
      const controller = new RouterController({ page: "practice" });
      const view = new RouterView(controller, (msg) => messages.push(msg));
      const link = document.createElement("a");
      link.href = "/songs";
      document.body.append(link);
      view.mount();

      window.addEventListener("click", (event) => event.preventDefault(), {
        once: true,
      });

      link.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );

      view.destroy();
      link.remove();
      return messages;
    });

    expect(messages).toEqual([{ type: "NAVIGATE", route: { page: "songs" } }]);
  });
});
