import { expect, test } from "@playwright/test";
import { parseRoute, routeToPath } from "./router.ts";
import { HARNESS_URL } from "./test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
  await page.evaluate(() => history.replaceState(null, "", "/"));
});

test.describe("router", () => {
  test("round-trips the catalog, activities, and options", () => {
    const routes = [
      { page: "catalog" },
      { page: "activity", activity: "identify-notes" },
      { page: "options" },
    ] as const;
    for (const route of routes) {
      expect(parseRoute(routeToPath(route))).toEqual(route);
    }
  });

  test("obsolete and former SRS paths fall back to the catalog", () => {
    for (const path of [
      "/activities/sing-tonic",
      "/activities/identify-tonic-notes",
      "/practice",
      "/cards",
      "/songs",
    ]) {
      expect(parseRoute(path)).toEqual({ page: "catalog" });
    }
  });

  test("writes activity navigation to browser history", async ({ page }) => {
    const pathname = await page.evaluate(async () => {
      const { RouterController, RouterView } = await import("/router.ts");
      const controller = new RouterController({ page: "catalog" });
      const view = new RouterView(controller, () => {});

      controller.update({
        type: "NAVIGATE",
        route: { page: "activity", activity: "identify-notes" },
      });
      view.sync();

      return window.location.pathname;
    });

    expect(pathname).toBe("/activities/identify-notes");
  });

  test("leaves router-ignored links to native navigation", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { RouterView, RouterController } = await import("/router.ts");
      const messages: unknown[] = [];
      const controller = new RouterController({ page: "catalog" });
      const view = new RouterView(controller, (msg) => messages.push(msg));
      const link = document.createElement("a");
      link.href = "/";
      link.setAttribute("data-router-ignore", "");
      document.body.append(link);
      view.mount();

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

  test("link navigation and browser back restore activity and catalog routes", async ({
    page,
  }) => {
    await page.evaluate(async () => {
      const { RouterView, RouterController } = await import("/router.ts");
      const controller = new RouterController({ page: "catalog" });
      let view: InstanceType<typeof RouterView>;
      const routeState = document.createElement("output");
      routeState.id = "route-state";
      const link = document.createElement("a");
      link.href = "/activities/identify-notes";
      link.textContent = "identify";
      document.body.append(routeState, link);
      const render = () => {
        routeState.textContent = JSON.stringify(controller.route);
      };
      view = new RouterView(controller, (msg) => {
        controller.update(msg);
        render();
        view.sync();
      });
      view.mount();
      render();
      link.click();
    });

    await expect(page).toHaveURL(/\/activities\/identify-notes$/);
    await expect(page.locator("#route-state")).toHaveText(
      JSON.stringify({ page: "activity", activity: "identify-notes" }),
    );

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#route-state")).toHaveText(
      JSON.stringify({ page: "catalog" }),
    );

    await page.goForward();

    await expect(page).toHaveURL(/\/activities\/identify-notes$/);
    await expect(page.locator("#route-state")).toHaveText(
      JSON.stringify({ page: "activity", activity: "identify-notes" }),
    );
  });
});
