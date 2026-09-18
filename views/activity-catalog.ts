import { Binder, cls, mountStyle, sanitize, type View } from "../vamp.ts";

export type ActivityCatalogState = Record<string, never>;

const catalogClass = cls("activity-catalog");
const introClass = cls("activity-catalog-intro");
const listClass = cls("activity-catalog-list");
const cardClass = cls("activity-catalog-card");

mountStyle(`
.${catalogClass} {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100dvh;
  box-sizing: border-box;
  padding: max(72px, env(safe-area-inset-top)) 16px 24px;
}
.${catalogClass} h1 {
  margin: 0;
  font-size: 32px;
}
.${catalogClass} .${introClass} {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 17px;
  line-height: 1.45;
}
.${catalogClass} .${listClass} {
  display: grid;
  gap: 14px;
}
.${catalogClass} .${cardClass} {
  display: block;
  padding: 20px;
  border: 2px solid var(--color-brand-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
  color: var(--color-brand);
  text-decoration: none;
}
.${catalogClass} .${cardClass} strong {
  display: block;
  margin-bottom: 6px;
  font-size: 21px;
}
.${catalogClass} .${cardClass} span {
  color: var(--color-text-muted);
  line-height: 1.4;
}
`);

export class ActivityCatalogView implements View<ActivityCatalogState, never> {
  container: HTMLElement;
  private readonly b: Binder<ActivityCatalogState>;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    initial: ActivityCatalogState,
  ) {
    this.container = container;
    container.innerHTML = sanitize`
      <section class="${catalogClass}">
        <header>
          <h1>ear training activities</h1>
          <p class="${introClass}">Choose a short listening activity. Use the key or drone only when you want extra support.</p>
        </header>
        <nav class="${listClass}" aria-label="activities">
          <a class="${cardClass}" href="/activities/identify-notes">
            <strong>Identify the notes</strong>
            <span>Choose musical situations, then identify every note in a melody.</span>
          </a>
        </nav>
      </section>
    `;
    this.b = new Binder(container, initial);
  }

  sync(state: ActivityCatalogState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
