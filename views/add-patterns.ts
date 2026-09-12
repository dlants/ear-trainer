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

export type State = { rows: Row[] };

export type Msg = { type: "ADD"; id: PatternId };

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
  return { rows: rows(ctx) };
}

export function update(state: State, msg: Msg, ctx: AddPatternsCtx): void {
  switch (msg.type) {
    case "ADD":
      ctx.deck.addPattern(msg.id, ctx.now());
      state.rows = rows(ctx);
      break;
  }
}

const listClass = cls("add-list");
const rowClass = cls("add-row");

mountStyle(`
.${listClass} {
  list-style: none;
  margin: 0;
  padding: max(16px, env(safe-area-inset-top)) 16px
    max(16px, env(safe-area-inset-bottom));
  font-family: system-ui, sans-serif;
}
.${listClass} .${rowClass} {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
}
.${listClass} .${rowClass} .label {
  font-size: 24px;
  flex: 0 0 auto;
}
.${listClass} .${rowClass} .gloss {
  flex: 1;
  font-size: 13px;
  color: #666;
}
.${listClass} .${rowClass} button {
  font-size: 16px;
  padding: 12px 20px;
  border-radius: 10px;
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
    const addedRef = ref("added");

    this.container = container;
    container.className = rowClass;
    container.innerHTML = sanitize`
      <span class="label" data-ref="${labelRef}"></span>
      <span class="gloss" data-ref="${glossRef}"></span>
      <span data-ref="${addedRef}">added</span>
      <button type="button" data-ref="${addRef}">add</button>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref(addRef)
      .addEventListener("click", () =>
        dispatch({ type: "ADD", id: initial.id }),
      );

    this.b.bindText(labelRef, (s) => s.label);
    this.b.bindText(glossRef, (s) => s.gloss);
    this.b.bindVisible(addedRef, (s) => s.added);
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
    const listRef = ref("list");

    this.container = container;
    container.innerHTML = sanitize`<ul class="${listClass}" data-ref="${listRef}"></ul>`;
    this.b = new Binder(container, initial);

    this.b.bindList(listRef, "li", (s) =>
      s.rows.map((row) => showKeyed(row.id, RowView, row, {}, dispatch)),
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
