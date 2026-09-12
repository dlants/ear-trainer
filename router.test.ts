import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  parseRoute,
  RouterController,
  type RouterMsg,
  RouterView,
  routeToPath,
} from "./router.ts";

describe("router", () => {
  beforeEach(() => history.replaceState(null, "", "/"));
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("round-trips every route", () => {
    const routes = [
      { page: "practice" },
      { page: "cards" },
      { page: "songs" },
    ] as const;
    for (const route of routes)
      expect(parseRoute(routeToPath(route))).toEqual(route);
  });

  it("writes controller navigation to browser history", () => {
    const controller = new RouterController({ page: "practice" });
    const view = new RouterView(controller, () => {});

    controller.update({ type: "NAVIGATE", route: { page: "cards" } });
    view.sync();

    expect(window.location.pathname).toBe("/cards");
  });

  it("turns local link clicks into navigation messages", () => {
    const messages: RouterMsg[] = [];
    const controller = new RouterController({ page: "practice" });
    const view = new RouterView(controller, (msg) => messages.push(msg));
    const link = document.createElement("a");
    link.href = "/songs";
    document.body.append(link);
    view.mount();

    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );

    expect(messages).toEqual([{ type: "NAVIGATE", route: { page: "songs" } }]);
    view.destroy();
  });
});
