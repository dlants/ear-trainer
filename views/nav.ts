import { type Route, routeToPath } from "../router.ts";
import {
  Binder,
  cls,
  mountStyle,
  onPress,
  ref,
  sanitize,
  type View,
} from "../vamp.ts";
import { APP_VERSION } from "../version.ts";
import type { DismissStack } from "./dropdown.ts";

export type State = { page: Route["page"] | "about" };
export type NavCtx = { dismissStack: DismissStack };

const navClass = cls("burger-nav");

mountStyle(`
.${navClass} {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  right: 12px;
  z-index: 20;
  font-family: system-ui, sans-serif;
}
.${navClass} summary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  box-sizing: border-box;
  list-style: none;
  border: 0;
  border-radius: var(--radius-control);
  background: var(--color-brand-strong);
  color: white;
  cursor: pointer;
  font-size: 27px;
  line-height: 1;
  box-shadow: 0 2px 10px rgb(0 0 0 / 20%);
}
.${navClass} summary::-webkit-details-marker { display: none; }
.${navClass} .menu-items {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  display: flex;
  flex-direction: column;
  min-width: 190px;
  padding: 6px;
  border-radius: var(--radius-control);
  background: var(--color-brand-strong);
  box-shadow: 0 4px 18px rgb(0 0 0 / 25%);
}
.${navClass} .menu-version {
  padding: 6px 14px 10px;
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
}
.${navClass} .menu-items a {
  padding: 12px 14px;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-size: 17px;
}
.${navClass} .menu-items a[aria-current="page"] {
  background: var(--color-brand-active);
}
`);

export class NavView implements View<State, never, NavCtx> {
  container: HTMLElement;
  private readonly b: Binder<State>;
  private readonly detachClose: () => void;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    initial: State,
    ctx: NavCtx,
  ) {
    const detailsRef = ref("menu");
    const homeRef = ref("home");
    const optionsRef = ref("options");
    const aboutRef = ref("about");

    this.container = container;
    container.innerHTML = sanitize`
      <details class="${navClass}" data-ref="${detailsRef}">
        <summary aria-label="open navigation menu">☰</summary>
        <nav class="menu-items" aria-label="main navigation">
          <span class="menu-version">the ecological ear trainer v${APP_VERSION}</span>
          <a href="${routeToPath({ page: "catalog" })}" data-ref="${homeRef}">home</a>
          <a href="${routeToPath({ page: "options" })}" data-ref="${optionsRef}">options</a>
          <a href="/about" data-router-ignore data-ref="${aboutRef}">about</a>
        </nav>
      </details>
    `;
    this.b = new Binder(container, initial);
    this.b.bindAttr(homeRef, "aria-current", (s) =>
      s.page === "catalog" ? "page" : undefined,
    );
    this.b.bindAttr(optionsRef, "aria-current", (s) =>
      s.page === "options" ? "page" : undefined,
    );
    this.b.bindAttr(aboutRef, "aria-current", (s) =>
      s.page === "about" ? "page" : undefined,
    );

    const details = this.b.ref<HTMLDetailsElement>(detailsRef);
    const summary = details.querySelector("summary") as HTMLElement;
    summary.addEventListener("click", (event) => event.preventDefault());
    onPress(summary, () => {
      details.open = !details.open;
    });
    details.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        details.open = false;
      }
    });
    this.detachClose = ctx.dismissStack.attach(details, () => {
      details.open = false;
    });
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.detachClose();
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
