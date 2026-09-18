import type { Activity } from "./views/tonic-practice.ts";

export type Route =
  | { page: "catalog" }
  | { page: "activity"; activity: Activity }
  | { page: "options" };

export type UrlWriteKind = "push" | "replace";

export type RouterMsg = {
  type: "NAVIGATE";
  route: Route;
  kind?: UrlWriteKind;
};

export function parseRoute(pathname: string): Route {
  switch (pathname.replace(/\/+$/, "") || "/") {
    case "/activities/identify-notes":
      return { page: "activity", activity: "identify-notes" };
    case "/options":
      return { page: "options" };
    default:
      return { page: "catalog" };
  }
}

type DisconnectedRoute = { page: "practice" | "cards" | "songs" };

export function routeToPath(route: Route | DisconnectedRoute): string {
  switch (route.page) {
    case "catalog":
    case "practice":
    case "cards":
    case "songs":
      return "/";
    case "activity":
      return `/activities/${route.activity}`;
    case "options":
      return "/options";
  }
}

export function currentRoute(): Route {
  return parseRoute(window.location.pathname);
}

export class RouterController {
  route: Route;
  epoch = 0;
  private writeKind: UrlWriteKind = "replace";

  constructor(initialRoute: Route) {
    this.route = initialRoute;
  }

  update(msg: RouterMsg): Route {
    this.route = msg.route;
    this.writeKind = msg.kind ?? "push";
    this.epoch++;
    return this.route;
  }

  desired(): { path: string; kind: UrlWriteKind } {
    return { path: routeToPath(this.route), kind: this.writeKind };
  }
}

export class RouterView {
  private lastEpoch = 0;
  private mounted = false;

  constructor(
    private readonly controller: RouterController,
    private readonly dispatch: (msg: RouterMsg) => void,
  ) {}

  private readonly onPopState = (): void => {
    this.dispatch({ type: "NAVIGATE", route: currentRoute() });
  };

  private readonly onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest("a");
    if (
      !link ||
      link.hasAttribute("download") ||
      link.hasAttribute("data-router-ignore")
    )
      return;
    if (link.target && link.target !== "_self") return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    if (url.pathname === window.location.pathname) return;
    this.dispatch({ type: "NAVIGATE", route: parseRoute(url.pathname) });
  };

  mount(): void {
    if (this.mounted) return;
    window.addEventListener("popstate", this.onPopState);
    document.addEventListener("click", this.onClick);
    this.mounted = true;
  }

  sync(): void {
    if (this.controller.epoch === this.lastEpoch) return;
    this.lastEpoch = this.controller.epoch;
    const desired = this.controller.desired();
    if (desired.path === window.location.pathname) return;
    if (desired.kind === "push") history.pushState(null, "", desired.path);
    else history.replaceState(null, "", desired.path);
  }

  destroy(): void {
    if (!this.mounted) return;
    window.removeEventListener("popstate", this.onPopState);
    document.removeEventListener("click", this.onClick);
    this.mounted = false;
  }
}
