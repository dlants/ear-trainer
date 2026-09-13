import { State as FsrsState } from "ts-fsrs";
import type { CardProgress, DeckStore, PatternStatus } from "../deck/store.ts";
import { chevronIcon, questionIcon } from "../icons.ts";
import type { InventoryEntry } from "../inventory/entry.ts";
import { patternFromId } from "../music/format.ts";
import type { Pattern, PatternId } from "../music/note.ts";
import {
  Binder,
  cls,
  mountStyle,
  noop,
  onPress,
  type RawHtml,
  raw,
  ref,
  sanitize,
  show,
  showKeyed,
  type View,
} from "../vamp.ts";
import { PatternNotationView } from "./pattern-notation.ts";

export type Row = {
  id: PatternId;
  pattern: Pattern;
  gloss: string;
  count: number;
  status: PatternStatus;
  expanded: boolean;
  knowledge: CardProgress[];
  observedAt: Date;
};

export type State = {
  rows: Row[];
  showKnown: boolean;
  showDeck: boolean;
  expandedId?: PatternId;
};

export type Msg =
  | { type: "TOGGLE_DETAILS"; id: PatternId }
  | { type: "ADD_TO_DECK"; id: PatternId }
  | { type: "MARK_KNOWN"; id: PatternId }
  | { type: "REMOVE_FROM_DECK"; id: PatternId }
  | { type: "SET_SHOW_KNOWN"; value: boolean }
  | { type: "SET_SHOW_DECK"; value: boolean };

export type AddPatternsCtx = {
  deck: DeckStore;
  now(): Date;
  /** Injected so tests can drive a fixture inventory. */
  inventory: InventoryEntry[];
};

export function rows(
  ctx: AddPatternsCtx,
  expandedId?: PatternId,
  observedAt: Date = ctx.now(),
): Row[] {
  return ctx.inventory.map((entry) => {
    const pattern = patternFromId(entry.id);
    if (!pattern.ok) throw new Error(pattern.error);
    return {
      id: entry.id,
      pattern: pattern.value,
      gloss: entry.gloss,
      count: entry.count,
      status: ctx.deck.patternStatus(entry.id),
      expanded: entry.id === expandedId,
      knowledge: ctx.deck.progressForPattern(entry.id, observedAt),
      observedAt,
    };
  });
}

export function initialState(ctx: AddPatternsCtx): State {
  return { rows: rows(ctx), showKnown: false, showDeck: true };
}

function rebuild(state: State, ctx: AddPatternsCtx): void {
  state.rows = rows(ctx, state.expandedId, ctx.now());
}
function visible(row: Row, state: State): boolean {
  if (row.status === "known") return state.showKnown;
  if (row.status === "deck") return state.showDeck;
  return true;
}

function clearHiddenExpansion(state: State, ctx: AddPatternsCtx): void {
  const expanded = state.rows.find((row) => row.id === state.expandedId);
  if (expanded && !visible(expanded, state)) {
    state.expandedId = undefined;
    rebuild(state, ctx);
  }
}

export function update(state: State, msg: Msg, ctx: AddPatternsCtx): void {
  switch (msg.type) {
    case "TOGGLE_DETAILS":
      state.expandedId = state.expandedId === msg.id ? undefined : msg.id;
      rebuild(state, ctx);
      break;
    case "ADD_TO_DECK":
      ctx.deck.addPattern(msg.id, ctx.now());
      rebuild(state, ctx);
      clearHiddenExpansion(state, ctx);
      break;
    case "MARK_KNOWN":
      ctx.deck.markPatternKnown(msg.id);
      rebuild(state, ctx);
      clearHiddenExpansion(state, ctx);
      break;
    case "REMOVE_FROM_DECK":
      ctx.deck.removePattern(msg.id);
      rebuild(state, ctx);
      break;
    case "SET_SHOW_KNOWN":
      state.showKnown = msg.value;
      clearHiddenExpansion(state, ctx);
      break;
    case "SET_SHOW_DECK":
      state.showDeck = msg.value;
      clearHiddenExpansion(state, ctx);
      break;
  }
}

const pageClass = cls("add-page");
const filterClass = cls("add-filter");
const listClass = cls("add-list");
const rowClass = cls("add-row");
const deckRowClass = cls("card-in-deck");
const knownRowClass = cls("card-known");
const knowledgeClass = cls("card-knowledge");
const metricClass = cls("card-metric");
const helpClass = cls("metric-help");
const caretClass = cls("card-details-caret");
const expandedCaretClass = cls("card-details-caret-expanded");

mountStyle(`
.${pageClass} {
  font-family: system-ui, sans-serif;
}
.${pageClass} h1 {
  margin: 0;
  padding: max(16px, env(safe-area-inset-top)) 16px 8px;
  font-size: 24px;
}
.${filterClass} {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  padding: 0 16px 8px;
  font-size: 15px;
}
.${filterClass} label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.${filterClass} input {
  width: 20px;
  height: 20px;
}
.${listClass} {
  list-style: none;
  margin: 0;
  padding: 4px 16px max(16px, env(safe-area-inset-bottom));
}
.${listClass} .${rowClass} {
  border-bottom: 1px solid var(--color-border);
}
.${listClass} .${rowClass}.${deckRowClass} {
  background: var(--color-brand-surface);
}
.${listClass} .${rowClass}.${knownRowClass} {
  border-left: 3px solid var(--color-brand-border);
  background: var(--color-surface);
}
.${listClass} .${rowClass} .summary {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
}
.${listClass} .${rowClass} .toggle-details {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.${listClass} .${rowClass} .toggle-details:focus-visible {
  z-index: 1;
}
.${listClass} .${rowClass} .${caretClass} {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex: 0 0 auto;
  color: var(--color-text-muted);
  font-size: 20px;
  pointer-events: none;
  transition: transform 160ms ease;
}
.${listClass} .${rowClass} .${caretClass}.${expandedCaretClass} {
  transform: rotate(90deg);
}
@media (prefers-reduced-motion: reduce) {
  .${listClass} .${rowClass} .${caretClass} {
    transition: none;
  }
}
.${listClass} .${rowClass} .notation {
  position: relative;
  z-index: 1;
  pointer-events: none;
}
.${listClass} .${rowClass} .notation {
  flex: 0 0 auto;
  font-size: 24px;
}
.${listClass} .${rowClass} .gloss {
  margin: 0 0 12px;
  color: var(--color-text-muted);
  font-size: 14px;
}
.${listClass} .${rowClass} .status {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  color: var(--color-brand);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}
.${listClass} .${rowClass} .actions {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
}
.${listClass} .${rowClass} .action {
  padding: 10px 12px;
  border-radius: var(--radius-control);
  font-size: 14px;
}
.${listClass} .${rowClass} .details {
  padding: 0 10px 16px;
}
.${listClass} .${rowClass} .corpus-count,
.${listClass} .${rowClass} .tracking-prompt {
  margin: 0 0 12px;
  color: var(--color-text-muted);
  font-size: 14px;
}
.${listClass} .${rowClass} .knowledge-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
}
.${knowledgeClass} {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
}
.${knowledgeClass} h3 {
  margin: 0 0 10px;
  font-size: 16px;
}
.${knowledgeClass} dl {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  margin: 0;
  font-size: 13px;
}
.${knowledgeClass} dt,
.${knowledgeClass} dd {
  margin: 0;
}
.${knowledgeClass} dd {
  font-variant-numeric: tabular-nums;
}
.${metricClass} {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.${helpClass} {
  position: relative;
  display: inline-flex;
}
.${helpClass} > button {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  padding: 1px;
  border-radius: 50%;
  color: var(--color-text-muted);
  font-size: 13px;
}
.${helpClass} .tooltip {
  position: absolute;
  z-index: 4;
  bottom: calc(100% + 6px);
  left: 0;
  display: none;
  width: min(240px, 70vw);
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-text);
  color: var(--color-surface);
  font-size: 12px;
  font-weight: normal;
  line-height: 1.35;
}
.${helpClass}:hover .tooltip,
.${helpClass}:focus-within .tooltip {
  display: block;
}
`);

function help(label: string, text: string): RawHtml {
  const tooltipId = ref("tooltip");
  return raw(sanitize`
    <span class="${helpClass}">
      <button type="button" aria-label="About ${label}" aria-describedby="${tooltipId}">${questionIcon()}</button>
      <span class="tooltip" id="${tooltipId}" role="tooltip">${text}</span>
    </span>
  `);
}

function metric(label: string, tooltip: string, valueRef: string): RawHtml {
  return raw(sanitize`
    <dt class="${metricClass}">${label}${help(label, tooltip)}</dt>
    <dd data-ref="${valueRef}"></dd>
  `);
}

function stageLabel(state: FsrsState): string {
  switch (state) {
    case FsrsState.New:
      return "Not practiced yet";
    case FsrsState.Learning:
      return "Learning";
    case FsrsState.Review:
      return "Reviewing";
    case FsrsState.Relearning:
      return "Relearning";
  }
}

function dueLabel(due: Date, now: Date): string {
  const remaining = due.getTime() - now.getTime();
  if (remaining <= 0) return "Due now";
  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) return `In ${minutes} min`;
  const hours = Math.ceil(remaining / 3_600_000);
  if (hours < 24) return `In ${hours} hr`;
  const days = Math.ceil(remaining / 86_400_000);
  return `In ${days} ${days === 1 ? "day" : "days"}`;
}

function decimalDays(value: number): string {
  if (value === 0) return "Not set";
  return `${value.toFixed(1)} days`;
}

function difficultyLabel(value: number): string {
  return value === 0 ? "Not set" : `${value.toFixed(1)} / 10`;
}

type KnowledgeState = { progress: CardProgress; observedAt: Date };

class KnowledgeView implements View<KnowledgeState> {
  container: HTMLElement;
  private b: Binder<KnowledgeState>;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    initial: KnowledgeState,
  ) {
    const modeRef = ref("mode");
    const stageRef = ref("stage");
    const recallRef = ref("recall");
    const dueRef = ref("due");
    const reviewsRef = ref("reviews");
    const lapsesRef = ref("lapses");
    const stabilityRef = ref("stability");
    const difficultyRef = ref("difficulty");

    this.container = container;
    container.innerHTML = sanitize`
      <h3 data-ref="${modeRef}"></h3>
      <dl>
        ${metric("Stage", "The card's current step in the learning cycle.", stageRef)}
        ${metric("Estimated recall", "FSRS's estimate of the chance that you could recall this card right now.", recallRef)}
        ${metric("Next review", "When this card is scheduled to appear in practice again.", dueRef)}
        ${metric("Practiced", "How many times you have practiced this card, including successful and unsuccessful attempts.", reviewsRef)}
        ${metric("Lapses", "How many times this card returned to learning after a miss or an unsure answer.", lapsesRef)}
        ${metric("Stability", "About how many days it takes this card's estimated recall to fall to 90%. Higher means the memory lasts longer.", stabilityRef)}
        ${metric("Difficulty", "FSRS's estimate from 1 to 10 of how hard this card is to retain. Higher is harder.", difficultyRef)}
      </dl>
    `;
    this.b = new Binder(container, initial);
    this.b.bindClass(container, () => knowledgeClass);
    this.b.bindText(modeRef, (s) =>
      s.progress.mode === "transcription" ? "Transcription" : "Audiation",
    );
    this.b.bindText(stageRef, (s) => stageLabel(s.progress.state));
    this.b.bindText(recallRef, (s) =>
      s.progress.retrievability === undefined
        ? "Not available"
        : `${Math.round(s.progress.retrievability * 100)}%`,
    );
    this.b.bindText(dueRef, (s) => dueLabel(s.progress.due, s.observedAt));
    this.b.bindText(reviewsRef, (s) => String(s.progress.reps));
    this.b.bindText(lapsesRef, (s) => String(s.progress.lapses));
    this.b.bindText(stabilityRef, (s) => decimalDays(s.progress.stability));
    this.b.bindText(difficultyRef, (s) =>
      difficultyLabel(s.progress.difficulty),
    );
  }

  sync(state: KnowledgeState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

class RowView implements View<Row, Msg> {
  container: HTMLElement;
  private b: Binder<Row>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: Row,
  ) {
    const toggleRef = ref("toggle-details");
    const caretRef = ref("details-caret");
    const notationRef = ref("notation");
    const glossRef = ref("gloss");
    const statusRef = ref("status");
    const addRef = ref("add-to-deck");
    const knownRef = ref("mark-known");
    const removeRef = ref("remove-from-deck");
    const detailsRef = ref("details");
    const countRef = ref("count");
    const promptRef = ref("prompt");
    const knowledgeRef = ref("knowledge");

    this.container = container;
    container.innerHTML = sanitize`
      <div class="summary">
        <button type="button" class="toggle-details" data-ref="${toggleRef}" aria-controls="${detailsRef}"></button>
        <span class="${caretClass}" data-ref="${caretRef}">${chevronIcon()}</span>
        <div class="notation" data-ref="${notationRef}"></div>
        <span class="status" data-ref="${statusRef}"></span>
        <span class="actions">
          <button type="button" class="action" data-ref="${knownRef}">mark known</button>
          <button type="button" class="action" data-ref="${removeRef}">remove</button>
          <button type="button" class="action" data-ref="${addRef}">add to deck</button>
        </span>
      </div>
      <div class="details" id="${detailsRef}" data-ref="${detailsRef}">
        <p class="gloss" data-ref="${glossRef}"></p>
        <p class="corpus-count" data-ref="${countRef}"></p>
        <p class="tracking-prompt" data-ref="${promptRef}">Add this card to the deck to start practicing it.</p>
        <div class="knowledge-list" data-ref="${knowledgeRef}"></div>
      </div>
    `;
    this.b = new Binder(container, initial);

    this.b.bindClass(container, (s) => {
      if (s.status === "deck") return `${rowClass} ${deckRowClass}`;
      if (s.status === "known") return `${rowClass} ${knownRowClass}`;
      return rowClass;
    });
    onPress(this.b.ref(toggleRef), () =>
      dispatch({ type: "TOGGLE_DETAILS", id: initial.id }),
    );
    onPress(this.b.ref(addRef), () =>
      dispatch({ type: "ADD_TO_DECK", id: initial.id }),
    );
    onPress(this.b.ref(knownRef), () =>
      dispatch({ type: "MARK_KNOWN", id: initial.id }),
    );
    onPress(this.b.ref(removeRef), () =>
      dispatch({ type: "REMOVE_FROM_DECK", id: initial.id }),
    );

    this.b.bindAttr(toggleRef, "aria-expanded", (s) => String(s.expanded));
    this.b.bindClass(caretRef, (s) =>
      s.expanded ? `${caretClass} ${expandedCaretClass}` : caretClass,
    );
    this.b.bindAttr(toggleRef, "aria-label", (s) =>
      s.expanded ? "hide card details" : "show card details",
    );
    this.b.bindSlot(notationRef, (s) =>
      show(PatternNotationView, s.pattern, {}, noop),
    );
    this.b.bindText(glossRef, (s) => s.gloss);
    this.b.bindText(countRef, (s) =>
      s.count === 1
        ? "Occurs once in the corpus."
        : `Occurs ${s.count} times in the corpus.`,
    );
    this.b.bindText(statusRef, (s) => {
      if (s.status === "deck") return "in deck";
      if (s.status === "known") return "known";
      return "";
    });
    this.b.bindVisible(statusRef, (s) => s.status !== "proposed");
    this.b.bindVisible(knownRef, (s) => s.status === "deck");
    this.b.bindVisible(removeRef, (s) => s.status === "deck");
    this.b.bindVisible(addRef, (s) => s.status !== "deck");
    this.b.bindVisible(detailsRef, (s) => s.expanded);
    this.b.bindVisible(promptRef, (s) => s.knowledge.length === 0);
    this.b.bindList(knowledgeRef, "section", (s) =>
      s.knowledge.map((progress) =>
        showKeyed(
          progress.mode,
          KnowledgeView,
          { progress, observedAt: s.observedAt },
          {},
          noop,
        ),
      ),
    );
  }

  sync(state: Row): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

export class AddPatternsView implements View<State, Msg> {
  container: HTMLElement;
  private b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
  ) {
    const showKnownRef = ref("show-known");
    const showDeckRef = ref("show-deck");
    const listRef = ref("list");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${pageClass}">
        <h1>card library</h1>
        <div class="${filterClass}">
          <label>
            <input type="checkbox" data-ref="${showKnownRef}" />
            known cards
          </label>
          <label>
            <input type="checkbox" data-ref="${showDeckRef}" />
            deck
          </label>
        </div>
        <ul class="${listClass}" data-ref="${listRef}"></ul>
      </section>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref<HTMLInputElement>(showKnownRef)
      .addEventListener("change", (event) =>
        dispatch({
          type: "SET_SHOW_KNOWN",
          value: (event.currentTarget as HTMLInputElement).checked,
        }),
      );
    this.b
      .ref<HTMLInputElement>(showDeckRef)
      .addEventListener("change", (event) =>
        dispatch({
          type: "SET_SHOW_DECK",
          value: (event.currentTarget as HTMLInputElement).checked,
        }),
      );
    this.b.bindChecked(showKnownRef, (s) => s.showKnown);
    this.b.bindChecked(showDeckRef, (s) => s.showDeck);
    this.b.bindList(listRef, "li", (s) =>
      s.rows
        .filter((row) => visible(row, s))
        .map((row) => showKeyed(row.id, RowView, row, {}, dispatch)),
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
