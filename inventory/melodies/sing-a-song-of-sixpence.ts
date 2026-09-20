import type { CorpusMelody } from "../../music/melody.ts";
import {
  ev,
  h,
  melody,
  phrase,
  polyBar,
  q,
  region,
  voiceOf,
  w,
} from "../melody-builders.ts";

export const singASongOfSixpence: CorpusMelody = melody(
  "sing-a-song-of-sixpence",
  "Sing a Song of Sixpence",
  112,
  "traditional",
  "Traditional English nursery song documented in eighteenth-century print.",
  [
    phrase(
      [
        // The melody's 5s and 3s spell the tonic triad, so a single held low
        // root is all the harmony has to supply.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The tune's 4 and 2 leave V open, so the extra note goes where the
        // harmony turns: the leading tone arrives first, then the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The scalewise 1–2–3–4 says nothing about where the chord changes, so
        // the bass states I plainly and marks the turn to V with its third.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody rests on a long 5, which is open between I and V; the
        // root-fifth underneath fixes it as the tonic.
        polyBar(
          [
            voiceOf("melody", ev(w, [5])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // The tune outlines 5–3–1–3, stating I on its own, so the bass just
        // holds its root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's own lower 7 already leans home; the harmony matches that
        // pull at the turn and then holds the bare dominant root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [7, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody's 1 and 3 state the tonic, and the closing 2–7 needs the
        // dominant under it, so the third sounds where the harmony turns.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The long final 1 gets a root-fifth beneath it to give the close its
        // weight.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The answer phrase repeatedly uses 1 and closes with lower 7–1 resolution.",
      "independent",
    ),
  ],
);
