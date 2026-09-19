import { githubIcon } from "../icons.ts";
import {
  Binder,
  cls,
  mountStyle,
  onActivate,
  ref,
  sanitize,
  type View,
} from "../vamp.ts";
import { APP_VERSION } from "../version.ts";

export type ActivityCatalogState = Record<string, never>;
export type ActivityCatalogMsg = { type: "ACTIVATE_ACTIVITY" };

const catalogClass = cls("activity-catalog");
const introClass = cls("activity-catalog-intro");
const listClass = cls("activity-catalog-list");
const cardClass = cls("activity-catalog-card");
const aboutLinkClass = cls("activity-catalog-about");
const cornerClass = cls("activity-catalog-github");
const versionClass = cls("activity-catalog-version");

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
  font-size: 24px;
}
.${catalogClass} h2 {
  margin: 8px 0 0;
  font-size: 28px;
}
.${catalogClass} .${versionClass} {
  color: var(--color-text-muted);
  font-size: 15px;
  font-weight: normal;
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
.${catalogClass} .${aboutLinkClass} {
  align-self: center;
  color: var(--color-brand);
  text-underline-offset: 3px;
}
.${cornerClass} {
  position: fixed;
  top: 0;
  left: 0;
  width: 68px;
  height: 68px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: max(7px, env(safe-area-inset-top)) 0 0 7px;
  box-sizing: border-box;
  clip-path: polygon(0 0, 100% 0, 0 100%);
  background: var(--color-brand-strong);
  color: white;
  font-size: 20px;
}
`);

export class ActivityCatalogView
  implements View<ActivityCatalogState, ActivityCatalogMsg>
{
  container: HTMLElement;
  private readonly b: Binder<ActivityCatalogState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: ActivityCatalogMsg) => void,
    initial: ActivityCatalogState,
  ) {
    const activityRef = ref("identifyNotes");
    this.container = container;
    container.innerHTML = sanitize`
      <section class="${catalogClass}">
        <a class="${cornerClass}" href="https://github.com/dlants/ear-trainer"
           target="_blank" rel="noreferrer" aria-label="source code on GitHub">${githubIcon()}</a>
        <header>
          <h1>the ecological ear trainer <span class="${versionClass}">v${APP_VERSION}</span></h1>
          <h2>ear training activities</h2>
          <p class="${introClass}">Choose a short listening activity. Use the key or drone only when you want extra support.</p>
        </header>
        <nav class="${listClass}" aria-label="activities">
          <a class="${cardClass}" href="/activities/identify-notes" data-ref="${activityRef}">
            <strong>Identify the notes</strong>
            <span>Choose musical situations, then identify every note in a melody.</span>
          </a>
        </nav>
        <a class="${aboutLinkClass}" href="/about" data-router-ignore>about</a>
      </section>
    `;
    this.b = new Binder(container, initial);
    onActivate(this.b.ref(activityRef), () =>
      dispatch({ type: "ACTIVATE_ACTIVITY" }),
    );
  }

  sync(state: ActivityCatalogState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
