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

export const skipToMyLou: CorpusMelody = melody(
  "skip-to-my-lou",
  "Skip to My Lou",
  112,
  "traditional",
  "Traditional American partner-stealing dance song, documented in the nineteenth century.",
  [
    phrase(
      [
        // The tune's 5 and held 3 spell the tonic triad, so a single held low
        // root is support enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same bar again: the melody still states I, so the bass keeps
        // holding its root rather than thickening on a repeat.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The descent 5–4–3–2 leaves V open, so the harmony spends its extra
        // note at the turn with the leading tone, then holds the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The long 1 arrives; a root-fifth underneath gives the cadence weight
        // without adding a tone the melody has not sung.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // The rising 1–3–5 outlines the tonic on its own, so the bass just
        // holds its root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The passing 4 resolves straight back to the held 3, so I still needs
        // nothing more than its held root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's own lower 7 leans home; the harmony doubles that pull at
        // the turn and then holds the bare dominant root.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The final long 1, again with the root-fifth beneath it to close.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The first half cadences on 1 and the ending repeats a lower-7-to-1 tonic resolution.",
      "independent",
    ),
  ],
);
