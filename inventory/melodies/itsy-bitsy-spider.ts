import type { CorpusMelody } from "../../music/melody.ts";
import {
  e,
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

export const itsyBitsySpider: CorpusMelody = melody(
  "itsy-bitsy-spider",
  "Itsy Bitsy Spider",
  108,
  "traditional",
  "Traditional English-language nursery song, published in early twentieth-century folk collections.",
  [
    phrase(
      [
        // The tune climbs 1-2-3 through the chord itself, so the left hand
        // only holds a single bass root under it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [5, -1]),
              ev(e, [1]),
              ev(q, [1]),
              ev(e, [1]),
              ev(e, [2]),
              ev(q, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody falls back 3-2-1, stating I on its own; the held bass
        // root is all the support it needs.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The harmony turns here, so the bass thickens: a lone root under I,
        // then root and third as the melody arrives on 4.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The melody's 2 leaves V open, so the leading tone joins the bass
        // root to make the half cadence audible.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune arpeggiates 1-3-5, spelling I outright, so the bass holds
        // its single root again.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // IV is the turn, so it takes root and third; the return to I needs
        // only a root under the melody's 3.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The whole bar is V and the melody leans on 7, so the leading tone
        // sounds in the bass first and then gives way to the bare root.
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
        // The melody holds 1 alone, so the closing chord fills out with root
        // and fifth to settle the cadence.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The tune begins around 1, returns through it, and ends with lower 7 resolving to 1.",
      "independent",
    ),
  ],
);
