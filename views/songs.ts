import type { DeckStore } from "../deck/store.ts";
import type { Song } from "../inventory/entry.ts";
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

export type PatternRow = { id: PatternId; label: string; added: boolean };

export type SongRow = {
  id: string;
  title: string;
  knownCount: number;
  total: number;
  selected: boolean;
  /** The song's distinct patterns, in order of first appearance. */
  patterns: PatternRow[];
  /** The ordered tiling, shown only once every pattern is known. */
  decomposition: string;
};

export type State = { songs: SongRow[] };

export type Msg =
  | { type: "SELECT"; songId: string }
  | { type: "ADD"; id: PatternId }
  | { type: "ADD_ALL"; songId: string };

export type SongsCtx = {
  deck: DeckStore;
  now(): Date;
  /** Injected so tests can drive a fixture song list. */
  songs: Song[];
};

function label(id: PatternId): string {
  const parsed = patternFromId(id);
  return parsed.ok ? formatPattern(parsed.value, "numeric") : id;
}

function addedIds(ctx: SongsCtx): Set<PatternId> {
  return new Set(
    Object.values(ctx.deck.getState().cards).map((c) => c.patternId),
  );
}

/** Known-ness lives in the deck, so it is re-read from it on every rebuild. */
export function rows(ctx: SongsCtx, selectedId?: string): SongRow[] {
  const added = addedIds(ctx);
  return ctx.songs.map((song) => {
    const distinct = [...new Set(song.patternIds)];
    const patterns = distinct.map((id) => ({
      id,
      label: label(id),
      added: added.has(id),
    }));
    const knownCount = patterns.filter((p) => p.added).length;
    return {
      id: song.id,
      title: song.title,
      knownCount,
      total: patterns.length,
      selected: song.id === selectedId,
      patterns,
      decomposition:
        knownCount === patterns.length
          ? song.patternIds.map(label).join("  ·  ")
          : "",
    };
  });
}

export function initialState(ctx: SongsCtx): State {
  return { songs: rows(ctx) };
}

export function update(state: State, msg: Msg, ctx: SongsCtx): void {
  const selected = state.songs.find((s) => s.selected)?.id;
  switch (msg.type) {
    case "SELECT":
      state.songs = rows(ctx, selected === msg.songId ? undefined : msg.songId);
      break;
    case "ADD":
      ctx.deck.addPattern(msg.id, ctx.now());
      state.songs = rows(ctx, selected);
      break;
    case "ADD_ALL": {
      const song = ctx.songs.find((s) => s.id === msg.songId);
      for (const id of new Set(song?.patternIds ?? []))
        ctx.deck.addPattern(id, ctx.now());
      state.songs = rows(ctx, selected);
      break;
    }
  }
}

const listClass = cls("song-list");
const songClass = cls("song");
const patternClass = cls("song-pattern");

mountStyle(`
.${listClass} {
  list-style: none;
  margin: 0;
  padding: max(16px, env(safe-area-inset-top)) 16px
    max(16px, env(safe-area-inset-bottom));
  font-family: system-ui, sans-serif;
}
.${listClass} .${songClass} {
  border-bottom: 1px solid var(--color-border);
  padding: 12px 0;
}
.${listClass} .${songClass} .head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: none;
  padding: 8px 0;
  font-size: 17px;
  text-align: left;
  touch-action: manipulation;
}
.${listClass} .${songClass} .head .progress {
  margin-left: auto;
  font-size: 13px;
  color: var(--color-text-muted);
}
.${listClass} .${songClass} .decomposition {
  font-size: 18px;
  line-height: 1.6;
  padding: 8px 0;
}
.${listClass} .${songClass} .patterns {
  list-style: none;
  margin: 0;
  padding: 0;
}
.${listClass} .${patternClass} {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.${listClass} .${patternClass} .label {
  font-size: 22px;
}
.${listClass} button.add,
.${listClass} button.add-all {
  margin-left: auto;
  font-size: 16px;
  padding: 10px 18px;
  border-radius: var(--radius-control);
  touch-action: manipulation;
}
`);

class PatternRowView implements View<PatternRow, Msg> {
  container: HTMLElement;
  private b: Binder<PatternRow>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: PatternRow,
  ) {
    const labelRef = ref("label");
    const addRef = ref("add");
    const addedRef = ref("added");

    this.container = container;
    container.className = patternClass;
    container.innerHTML = sanitize`
      <span class="label" data-ref="${labelRef}"></span>
      <span data-ref="${addedRef}">known</span>
      <button type="button" class="add" data-ref="${addRef}">add</button>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref(addRef)
      .addEventListener("click", () =>
        dispatch({ type: "ADD", id: initial.id }),
      );

    this.b.bindText(labelRef, (s) => s.label);
    this.b.bindVisible(addedRef, (s) => s.added);
    this.b.bindVisible(addRef, (s) => !s.added);
  }

  sync(state: PatternRow): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

class SongRowView implements View<SongRow, Msg> {
  container: HTMLElement;
  private b: Binder<SongRow>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: SongRow,
  ) {
    const headRef = ref("head");
    const titleRef = ref("title");
    const progressRef = ref("progress");
    const decompositionRef = ref("decomposition");
    const patternsRef = ref("patterns");
    const addAllRef = ref("add-all");

    this.container = container;
    container.className = songClass;
    container.innerHTML = sanitize`
      <button type="button" class="head" data-ref="${headRef}">
        <span data-ref="${titleRef}"></span>
        <span class="progress" data-ref="${progressRef}"></span>
      </button>
      <div class="decomposition" data-ref="${decompositionRef}"></div>
      <ul class="patterns" data-ref="${patternsRef}"></ul>
      <button type="button" class="add-all" data-ref="${addAllRef}">add the rest</button>
    `;
    this.b = new Binder(container, initial);

    this.b
      .ref(headRef)
      .addEventListener("click", () =>
        dispatch({ type: "SELECT", songId: initial.id }),
      );
    this.b
      .ref(addAllRef)
      .addEventListener("click", () =>
        dispatch({ type: "ADD_ALL", songId: initial.id }),
      );

    this.b.bindText(titleRef, (s) => s.title);
    this.b.bindText(progressRef, (s) => `${s.knownCount}/${s.total} known`);
    this.b.bindText(decompositionRef, (s) => s.decomposition);
    this.b.bindVisible(
      decompositionRef,
      (s) => s.selected && s.decomposition !== "",
    );
    this.b.bindVisible(addAllRef, (s) => s.selected && s.knownCount < s.total);
    this.b.bindList(patternsRef, "li", (s) =>
      s.selected
        ? s.patterns.map((p) =>
            showKeyed(p.id, PatternRowView, p, {}, dispatch),
          )
        : [],
    );
  }

  sync(state: SongRow): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

export class SongsView implements View<State, Msg> {
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
      s.songs.map((song) =>
        showKeyed(song.id, SongRowView, song, {}, dispatch),
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
