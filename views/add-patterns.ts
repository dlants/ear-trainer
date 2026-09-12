import type { DeckStore } from "../deck/store.ts";
import type { InventoryEntry } from "../inventory/entry.ts";
import { formatPattern, patternFromId } from "../music/format.ts";
import type { PatternId } from "../music/note.ts";
import {
  Binder,
  cls,
  mountStyle,
  ref,
  sanitize,
  showKeyed,
  type View,
} from "../vamp.ts";

export type Row = {
  id: PatternId;
  label: string;
  gloss: string;
  added: boolean;
};

export type State = { rows: Row[]; hideAdded: boolean };

export type Msg =
  | { type: "ADD"; id: PatternId }
  | { type: "REMOVE"; id: PatternId }
  | { type: "SET_HIDE_ADDED"; value: boolean };

export type AddPatternsCtx = {
  deck: DeckStore;
  now(): Date;
  /** Injected so tests can drive a fixture inventory. */
  inventory: InventoryEntry[];
};

/**
 * "Known" is a property of the deck, so it is read from the deck on every
 * rebuild rather than tracked separately here.
 */
export function rows(ctx: AddPatternsCtx): Row[] {
  const added = new Set(
    Object.values(ctx.deck.getState().cards).map((c) => c.patternId),
  );
  return ctx.inventory.map((entry) => {
    const pattern = patternFromId(entry.id);
    return {
      id: entry.id,
      label: pattern.ok ? formatPattern(pattern.value, "numeric") : entry.id,
      gloss: entry.gloss,
      added: added.has(entry.id),
    };
  });
}

export function initialState(ctx: AddPatternsCtx): State {
  return { rows: rows(ctx), hideAdded: false };
}

export function update(state: State, msg: Msg, ctx: AddPatternsCtx): void {
  switch (msg.type) {
    case "ADD":
      ctx.deck.addPattern(msg.id, ctx.now());
      state.rows = rows(ctx);
      break;
    case "REMOVE":
      ctx.deck.removePattern(msg.id);
      state.rows = rows(ctx);
      break;
    case "SET_HIDE_ADDED":
      state.hideAdded = msg.value;
      break;
  }
}

const pageClass = cls("add-page");
const filterClass = cls("add-filter");
const listClass = cls("add-list");
const rowClass = cls("add-row");
const addedRowClass = cls("add-row-in-stack");

mountStyle(`
.${pageClass} {
  font-family: system-ui, sans-serif;
}
.${filterClass} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: max(16px, env(safe-area-inset-top)) 16px 4px;
  font-size: 15px;
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
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border-bottom: 1px solid var(--color-border);
}
.${listClass} .${rowClass}.${addedRowClass} {
  background: var(--color-brand-surface);
}
.${listClass} .${rowClass} .label {
  font-size: 24px;
  flex: 0 0 auto;
}
.${listClass} .${rowClass} .gloss {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-muted);
}
.${listClass} .${rowClass} button {
  font-size: 16px;
  padding: 12px 20px;
  border-radius: var(--radius-control);
  touch-action: manipulation;
}
`);

class RowView implements View<Row, Msg> {
  container: HTMLElement;
  private b: Binder<Row>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: Row,
  ) {
    const labelRef = ref("label");
    const glossRef = ref("gloss");
    const addRef = ref("add");
    const removeRef = ref("remove");

    this.container = container;
    container.innerHTML = sanitize`
      <span class="label" data-ref="${labelRef}"></span>
      <span class="gloss" data-ref="${glossRef}"></span>
      <button type="button" data-ref="${removeRef}">remove</button>
      <button type="button" data-ref="${addRef}">add</button>
    `;
    this.b = new Binder(container, initial);

    this.b.bindClass(container, (s) =>
      s.added ? `${rowClass} ${addedRowClass}` : rowClass,
    );
    this.b
      .ref(addRef)
      .addEventListener("click", () =>
        dispatch({ type: "ADD", id: initial.id }),
      );
    this.b
      .ref(removeRef)
      .addEventListener("click", () =>
        dispatch({ type: "REMOVE", id: initial.id }),
      );

    this.b.bindText(labelRef, (s) => s.label);
    this.b.bindText(glossRef, (s) => s.gloss);
    this.b.bindVisible(removeRef, (s) => s.added);
    this.b.bindVisible(addRef, (s) => !s.added);
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
    const hideAddedRef = ref("hide-added");
    const listRef = ref("list");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${pageClass}">
        <label class="${filterClass}">
          <input type="checkbox" data-ref="${hideAddedRef}" />
          hide patterns already in the card stack
        </label>
        <ul class="${listClass}" data-ref="${listRef}"></ul>
      </section>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref<HTMLInputElement>(hideAddedRef)
      .addEventListener("change", (event) =>
        dispatch({
          type: "SET_HIDE_ADDED",
          value: (event.currentTarget as HTMLInputElement).checked,
        }),
      );
    this.b.bindChecked(hideAddedRef, (s) => s.hideAdded);
    this.b.bindList(listRef, "li", (s) =>
      s.rows
        .filter((row) => !s.hideAdded || !row.added)
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
