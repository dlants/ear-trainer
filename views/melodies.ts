import type { PlayController } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import type { Melody, Phrase } from "../music/melody.ts";
import { routeToPath } from "../router.ts";
import {
  Binder,
  cls,
  mountStyle,
  onPress,
  ref,
  sanitize,
  show,
  showKeyed,
  type View,
} from "../vamp.ts";
import { type PlayButtonState, PlayButtonView } from "./play-button.ts";

export type MelodiesCtx = {
  play: PlayController;
  profile: Profile;
  melodies: Melody[];
};

export type State = { expandedId: string | undefined };

export type Msg =
  | { type: "TOGGLE"; melodyId: string }
  | { type: "PLAY_MELODY"; melodyId: string }
  | { type: "PLAY_PHRASE"; melodyId: string; phraseId: string };

export function initialState(): State {
  return { expandedId: undefined };
}

export function melodiesMsgNeedsAudio(msg: Msg): boolean {
  return msg.type !== "TOGGLE";
}

function melodyButtonId(melodyId: string): `melodies:${string}` {
  return `melodies:${melodyId}`;
}

export function update(state: State, msg: Msg, ctx: MelodiesCtx): void {
  const melody = ctx.melodies.find(({ id }) => id === msg.melodyId);
  switch (msg.type) {
    case "TOGGLE":
      state.expandedId =
        state.expandedId === msg.melodyId ? undefined : msg.melodyId;
      break;
    case "PLAY_MELODY":
      if (!melody) break;
      ctx.play.toggle(melodyButtonId(melody.id), {
        buttonId: melodyButtonId(melody.id),
        type: "score",
        score: melody,
        tonic: ctx.profile.tonic,
      });
      break;
    case "PLAY_PHRASE": {
      const phrase = melody?.phrases.find(({ id }) => id === msg.phraseId);
      if (!phrase) break;
      ctx.play.toggle(melodyButtonId(phrase.id), {
        buttonId: melodyButtonId(phrase.id),
        type: "score",
        score: phrase,
        tonic: ctx.profile.tonic,
      });
      break;
    }
  }
}

const SOURCE_LABELS: Record<Melody["source"]["status"], string> = {
  "public-domain": "public domain",
  traditional: "traditional",
  original: "written for this corpus",
};

const SUITABILITY_LABELS: Record<Phrase["noteIdentification"], string> = {
  independent: "stands alone",
  "context-required": "needs context",
  exclude: "not used for practice",
};

/** Live playback state for one row's button, read fresh on every sync. */
function playButton(
  ctx: MelodiesCtx,
  id: string,
  label: string,
  ariaLabel: string,
): PlayButtonState {
  const buttonId = melodyButtonId(id);
  const playback = ctx.play.getState();
  const playing =
    playback.status === "playing" && playback.buttonId === buttonId;
  return {
    id: buttonId,
    label,
    ariaLabel,
    icon: playing ? "pause" : "play",
    variant: "compact",
    visible: true,
    playing,
    durationMs: playing ? playback.durationMs : undefined,
    animated: true,
  };
}

const pageClass = cls("melodies-page");
const listClass = cls("melodies-list");
const entryClass = cls("melodies-entry");
const headClass = cls("melodies-head");
const titleClass = cls("melodies-title");
const toggleClass = cls("melodies-toggle");
const detailClass = cls("melodies-detail");
const phraseListClass = cls("melodies-phrases");
const phraseClass = cls("melodies-phrase");

mountStyle(`
.${pageClass} {
  max-width: 640px;
  margin: 0 auto;
  padding: max(32px, env(safe-area-inset-top)) 16px
    max(32px, env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.${pageClass} h1 {
  margin: 0 0 4px;
  font-size: 28px;
}
.${pageClass} .intro {
  margin: 0 0 24px;
  color: var(--color-text-muted);
}
.${listClass} {
  list-style: none;
  margin: 0;
  padding: 0;
}
.${entryClass} {
  border-bottom: 1px solid var(--color-border);
}
.${headClass} {
  display: flex;
  align-items: baseline;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  font-size: 17px;
  color: var(--color-text);
}
.${titleClass} {
  color: var(--color-text);
  text-decoration: none;
}
.${titleClass}:hover {
  text-decoration: underline;
}
.${headClass} .meta {
  margin-left: auto;
  font-size: 13px;
  color: var(--color-text-muted);
}
.${toggleClass} {
  border: 0;
  background: none;
  padding: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}
.${detailClass} {
  padding: 0 0 16px;
}
.${detailClass} .source {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-muted);
}
.${phraseListClass} {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}
.${phraseClass} {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  font-size: 15px;
}
.${phraseClass} .suitability {
  margin-left: auto;
  font-size: 13px;
  color: var(--color-text-muted);
}
`);

type PhraseRowState = { phrase: Phrase; play: PlayButtonState };
type PhraseRowMsg = { type: "PLAY" };

class PhraseRowView implements View<PhraseRowState, PhraseRowMsg> {
  container: HTMLElement;
  private readonly b: Binder<PhraseRowState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: PhraseRowMsg) => void,
    initial: PhraseRowState,
  ) {
    const playRef = ref("phrasePlay");
    const labelRef = ref("phraseLabel");
    const suitabilityRef = ref("phraseSuitability");

    this.container = container;
    container.className = phraseClass;
    container.innerHTML = sanitize`
      <span data-ref="${playRef}"></span>
      <span data-ref="${labelRef}"></span>
      <span class="suitability" data-ref="${suitabilityRef}"></span>
    `;
    this.b = new Binder(container, initial);

    this.b.bindSlot(playRef, (s) =>
      show(PlayButtonView, s.play, {}, () => dispatch({ type: "PLAY" })),
    );
    this.b.bindText(labelRef, (s) => `phrase ${s.phrase.phraseIndex + 1}`);
    this.b.bindText(
      suitabilityRef,
      (s) => SUITABILITY_LABELS[s.phrase.noteIdentification],
    );
  }

  sync(state: PhraseRowState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

type EntryState = {
  melody: Melody;
  expanded: boolean;
  play: PlayButtonState;
  phrases: PhraseRowState[];
};
type EntryMsg =
  | { type: "TOGGLE" }
  | { type: "PLAY" }
  | { type: "PLAY_PHRASE"; phraseId: string };

class MelodyEntryView implements View<EntryState, EntryMsg> {
  container: HTMLElement;
  private readonly b: Binder<EntryState>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: EntryMsg) => void,
    initial: EntryState,
  ) {
    const headRef = ref("melodyToggle");
    const titleRef = ref("melodyTitle");
    const metaRef = ref("melodyMeta");
    const detailRef = ref("melodyDetail");
    const sourceRef = ref("melodySource");
    const playRef = ref("melodyPlay");
    const phrasesRef = ref("melodyPhrases");

    this.container = container;
    container.className = entryClass;
    container.innerHTML = sanitize`
      <div class="${headClass}">
        <a class="${titleClass}" data-ref="${titleRef}"></a>
        <span class="meta" data-ref="${metaRef}"></span>
        <button type="button" class="${toggleClass}" data-ref="${headRef}">
          phrases
        </button>
      </div>
      <div class="${detailClass}" data-ref="${detailRef}">
        <p class="source" data-ref="${sourceRef}"></p>
        <span data-ref="${playRef}"></span>
        <ul class="${phraseListClass}" data-ref="${phrasesRef}"></ul>
      </div>
    `;
    this.b = new Binder(container, initial);

    onPress(this.b.ref(headRef), () => dispatch({ type: "TOGGLE" }));

    this.b.bindAttr(titleRef, "href", (s) =>
      routeToPath({ page: "melody", melodyId: s.melody.id }),
    );
    this.b.bindText(titleRef, (s) => s.melody.title);
    this.b.bindText(
      metaRef,
      (s) =>
        `${s.melody.phrases.length} phrases · ${SOURCE_LABELS[s.melody.source.status]}`,
    );
    this.b.bindAttr(headRef, "aria-expanded", (s) =>
      s.expanded ? "true" : "false",
    );
    this.b.bindVisible(detailRef, (s) => s.expanded);
    this.b.bindText(sourceRef, (s) => s.melody.source.description);
    this.b.bindSlot(playRef, (s) =>
      show(PlayButtonView, s.play, {}, () => dispatch({ type: "PLAY" })),
    );
    this.b.bindList(phrasesRef, "li", (s) =>
      s.phrases.map((row) =>
        showKeyed(row.phrase.id, PhraseRowView, row, {}, () =>
          dispatch({ type: "PLAY_PHRASE", phraseId: row.phrase.id }),
        ),
      ),
    );
  }

  sync(state: EntryState): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

export class MelodiesView implements View<State, Msg, MelodiesCtx> {
  container: HTMLElement;
  private readonly b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
    ctx: MelodiesCtx,
  ) {
    const listRef = ref("melodies");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${pageClass}">
        <h1>melodies</h1>
        <p class="intro">every tune in the corpus, played in your key.</p>
        <ul class="${listClass}" data-ref="${listRef}"></ul>
      </section>
    `;
    this.b = new Binder(container, initial);

    this.b.bindList(listRef, "li", (s) =>
      ctx.melodies.map((melody) => {
        const expanded = melody.id === s.expandedId;
        return showKeyed(
          melody.id,
          MelodyEntryView,
          {
            melody,
            expanded,
            play: playButton(ctx, melody.id, "play", `play ${melody.title}`),
            phrases: expanded
              ? melody.phrases.map((phrase) => ({
                  phrase,
                  play: playButton(
                    ctx,
                    phrase.id,
                    "",
                    `play phrase ${phrase.phraseIndex + 1} of ${melody.title}`,
                  ),
                }))
              : [],
          },
          {},
          (msg: EntryMsg) => {
            switch (msg.type) {
              case "TOGGLE":
                dispatch({ type: "TOGGLE", melodyId: melody.id });
                break;
              case "PLAY":
                dispatch({ type: "PLAY_MELODY", melodyId: melody.id });
                break;
              case "PLAY_PHRASE":
                dispatch({
                  type: "PLAY_PHRASE",
                  melodyId: melody.id,
                  phraseId: msg.phraseId,
                });
                break;
            }
          },
        );
      }),
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
