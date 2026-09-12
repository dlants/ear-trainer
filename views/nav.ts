import { type Route, routeToPath } from "../router.ts";
import { Binder, cls, mountStyle, ref, sanitize, type View } from "../vamp.ts";
import type { DismissStack } from "./dropdown.ts";

export type State = { route: Route };
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
  border-radius: 12px;
  background: #1a2238;
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
  border-radius: 12px;
  background: #1a2238;
  box-shadow: 0 4px 18px rgb(0 0 0 / 25%);
}
.${navClass} .menu-items a {
  padding: 12px 14px;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-size: 17px;
}
.${navClass} .menu-items a[aria-current="page"] {
  background: #365078;
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
    const practiceRef = ref("practice");
    const patternsRef = ref("patterns");
    const songsRef = ref("songs");

    this.container = container;
    container.innerHTML = sanitize`
      <details class="${navClass}" data-ref="${detailsRef}">
        <summary aria-label="open navigation menu">☰</summary>
        <nav class="menu-items" aria-label="main navigation">
          <a href="${routeToPath({ page: "practice" })}" data-ref="${practiceRef}">practice</a>
          <a href="${routeToPath({ page: "patterns" })}" data-ref="${patternsRef}">add patterns</a>
          <a href="${routeToPath({ page: "songs" })}" data-ref="${songsRef}">songs</a>
        </nav>
      </details>
    `;
    this.b = new Binder(container, initial);
    this.b.bindAttr(practiceRef, "aria-current", (s) =>
      s.route.page === "practice" ? "page" : undefined,
    );
    this.b.bindAttr(patternsRef, "aria-current", (s) =>
      s.route.page === "patterns" ? "page" : undefined,
    );
    this.b.bindAttr(songsRef, "aria-current", (s) =>
      s.route.page === "songs" ? "page" : undefined,
    );

    const details = this.b.ref<HTMLDetailsElement>(detailsRef);
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
