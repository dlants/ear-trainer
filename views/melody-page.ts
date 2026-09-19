import type { PlayController } from "../audio/play-controller.ts";
import type { Profile } from "../deck/profiles.ts";
import type { CellId, Melody } from "../music/melody.ts";
import {
  cells,
  cellsById,
  cellsSoundingAt,
  lanes,
  onsets,
} from "../music/melody.ts";
import type { Degree } from "../music/note.ts";
import { noteToMidi } from "../music/pitch.ts";
import { routeToPath } from "../router.ts";
import {
  Binder,
  cls,
  mountStyle,
  ref,
  sanitize,
  show,
  type View,
} from "../vamp.ts";
import { type PlayButtonState, PlayButtonView } from "./play-button.ts";
import { type ScoreGridMsg, ScoreGridView } from "./score-grid.ts";

export type MelodyPageCtx = {
  play: PlayController;
  profile: Profile;
  melodies: Melody[];
};

export type State = { melodyId: string };

export type Msg = { type: "PLAY_MELODY" } | { type: "GRID"; msg: ScoreGridMsg };

export function initialState(melodyId: string): State {
  return { melodyId };
}

/** Every message on this page starts playback, so all of them need audio. */
export function melodyPageMsgNeedsAudio(_msg: Msg): boolean {
  return true;
}

const ALL_DEGREES: Degree[] = [1, 2, 3, 4, 5, 6, 7];

function melodyButtonId(melodyId: string): `melodies:${string}` {
  return `melodies:${melodyId}`;
}

const NOTE_BUTTON_ID = "melodies:note" as const;

function playNotes(
  ctx: MelodyPageCtx,
  melody: Melody,
  cellIds: readonly CellId[],
): void {
  const byId = cellsById(cells(melody));
  const notes = cellIds.flatMap((cellId) => {
    const cell = byId.get(cellId);
    return cell ? [noteToMidi(cell.note, ctx.profile.tonic)] : [];
  });
  if (notes.length === 0) return;
  ctx.play.autoplay([{ buttonId: NOTE_BUTTON_ID, type: "notes", notes }]);
}

export function update(state: State, msg: Msg, ctx: MelodyPageCtx): void {
  const melody = ctx.melodies.find(({ id }) => id === state.melodyId);
  if (!melody) return;
  switch (msg.type) {
    case "PLAY_MELODY":
      ctx.play.toggle(melodyButtonId(melody.id), {
        buttonId: melodyButtonId(melody.id),
        type: "score",
        score: melody,
        tonic: ctx.profile.tonic,
      });
      break;
    case "GRID": {
      const grid = msg.msg;
      switch (grid.type) {
        case "CELL":
          playNotes(ctx, melody, [grid.cellId]);
          break;
        case "ONSET": {
          const melodyCells = cells(melody);
          const onset = onsets(melodyCells)[grid.onsetIndex];
          if (!onset) break;
          playNotes(
            ctx,
            melody,
            cellsSoundingAt(melodyCells, onset.onsetTicks),
          );
          break;
        }
        case "REGION": {
          const region = melody.harmony.find(
            (candidate) => candidate.id === grid.regionId,
          );
          if (!region) break;
          ctx.play.autoplay([
            {
              buttonId: NOTE_BUTTON_ID,
              type: "score",
              score: melody,
              tonic: ctx.profile.tonic,
              range: {
                startTicks: region.startTicks,
                endTicks: region.endTicks,
              },
            },
          ]);
          break;
        }
      }
      break;
    }
  }
}

const pageClass = cls("melody-page");

mountStyle(`
.${pageClass} {
  max-width: 960px;
  margin: 0 auto;
  padding: max(32px, env(safe-area-inset-top)) 16px
    max(32px, env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.${pageClass} .back {
  display: inline-block;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--color-text-muted);
}
.${pageClass} h1 {
  margin: 0 0 4px;
  font-size: 28px;
}
.${pageClass} .source {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-muted);
}
.${pageClass} .grid {
  margin-top: 20px;
}
`);

export class MelodyPageView implements View<State, Msg, MelodyPageCtx> {
  container: HTMLElement;
  private readonly b: Binder<State>;

  constructor(
    container: HTMLElement,
    dispatch: (msg: Msg) => void,
    initial: State,
    ctx: MelodyPageCtx,
  ) {
    const titleRef = ref("melodyPageTitle");
    const sourceRef = ref("melodyPageSource");
    const playRef = ref("melodyPagePlay");
    const gridRef = ref("melodyPageGrid");

    this.container = container;
    container.innerHTML = sanitize`
      <section class="${pageClass}">
        <a class="back" href="${routeToPath({ page: "melodies" })}">
          all melodies
        </a>
        <h1 data-ref="${titleRef}"></h1>
        <p class="source" data-ref="${sourceRef}"></p>
        <span data-ref="${playRef}"></span>
        <div class="grid" data-ref="${gridRef}"></div>
      </section>
    `;
    this.b = new Binder(container, initial);

    const melodyFor = (state: State): Melody | undefined =>
      ctx.melodies.find(({ id }) => id === state.melodyId);

    this.b.bindText(titleRef, (state) => melodyFor(state)?.title ?? "");
    this.b.bindText(
      sourceRef,
      (state) => melodyFor(state)?.source.description ?? "",
    );
    this.b.bindSlot(playRef, (state) => {
      const melody = melodyFor(state);
      if (!melody) return undefined;
      const buttonId = melodyButtonId(melody.id);
      const playback = ctx.play.getState();
      const playing =
        playback.status === "playing" && playback.buttonId === buttonId;
      const button: PlayButtonState = {
        id: buttonId,
        label: "play",
        ariaLabel: `play ${melody.title}`,
        icon: playing ? "pause" : "play",
        variant: "compact",
        visible: true,
        playing,
        durationMs: playing ? playback.durationMs : undefined,
        animated: true,
      };
      return show(PlayButtonView, button, {}, () =>
        dispatch({ type: "PLAY_MELODY" }),
      );
    });
    this.b.bindSlot(gridRef, (state) => {
      const melody = melodyFor(state);
      if (!melody) return undefined;
      const melodyCells = cells(melody);
      return show(
        ScoreGridView,
        {
          key: melody.id,
          score: melody,
          cells: melodyCells,
          onsets: onsets(melodyCells),
          laneCount: lanes(melody).length,
          firstMeasureIndex: 0,
          measureCount: melody.measures.length,
          promptDegrees: ALL_DEGREES,
          mode: { kind: "reveal" },
        },
        {},
        (msg: ScoreGridMsg) => dispatch({ type: "GRID", msg }),
      );
    });
  }

  sync(state: State): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
