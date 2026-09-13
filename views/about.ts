import aboutMarkdown from "../docs/about.md?raw";
import {
  Binder,
  cls,
  mountStyle,
  noop,
  ref,
  sanitize,
  show,
  type View,
} from "../vamp.ts";
import type { DismissStack } from "./dropdown.ts";
import { markdownHtml } from "./markdown.ts";
import { NavView } from "./nav.ts";

export type State = Record<string, never>;
export type AboutCtx = { dismissStack: DismissStack };

const pageClass = cls("about-page");

mountStyle(`
.${pageClass} {
  max-width: 640px;
  margin: 0 auto;
  padding: max(32px, env(safe-area-inset-top)) 24px
    max(32px, env(safe-area-inset-bottom));
  box-sizing: border-box;
  line-height: 1.6;
}
.${pageClass} h1 {
  margin: 40px 0 16px;
  font-size: 30px;
  line-height: 1.2;
}
.${pageClass} h1:first-of-type {
  margin-top: 0;
}
.${pageClass} h2 {
  margin: 32px 0 12px;
  font-size: 22px;
  line-height: 1.3;
}
.${pageClass} p {
  margin: 0 0 20px;
}
.${pageClass} a {
  color: var(--color-brand);
  text-underline-offset: 3px;
}
.${pageClass} code {
  padding: 2px 5px;
  border-radius: 5px;
  background: var(--color-brand-surface);
  font-size: 0.92em;
}
.${pageClass} .back {
  display: inline-block;
  margin: 16px 0 40px;
  color: var(--color-text-muted);
}
`);

export class AboutView implements View<State, never, AboutCtx> {
  container: HTMLElement;
  private readonly b: Binder<State>;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    _initial: State,
    ctx: AboutCtx,
  ) {
    const navRef = ref("nav");
    this.container = container;
    container.innerHTML = sanitize`
      <div data-ref="${navRef}"></div>
      <article class="${pageClass}">
        <a class="back" href="/">back to start</a>
        ${markdownHtml(aboutMarkdown)}
      </article>
    `;
    this.b = new Binder(container, {});
    this.b.bindSlot(navRef, () =>
      show(
        NavView,
        { page: "about" },
        { dismissStack: ctx.dismissStack },
        noop,
      ),
    );
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
