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

export const auraLee: CorpusMelody = melody(
  "aura-lee",
  "Aura Lee",
  88,
  "public-domain",
  "George R. Poulton melody with W. W. Fosdick lyrics, published in 1861.",
  [
    phrase(
      [
        // The opening 1-3-5 arpeggiates the tonic triad itself, so a single
        // held bass root is all the support it needs.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the chordal third of IV but this is the first turn
        // away from home, so IV takes root and third before the bare tonic root
        // returns under 3.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody circles 2-3-4-2 without stating V, so the leading tone
        // sounds first and the dominant root holds the rest of the bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The long 1 arrives; a root-fifth dyad gives the midpoint cadence a
        // full tonic sound.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // The rise 3-5-1 again spells the tonic, so the harmony goes back to a
        // single held root.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(h, [1, 1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 7 leans toward the dominant; the harmony doubles that
        // leading tone over the V root, then steps to the tonic root under 5.
        polyBar(
          [
            voiceOf("melody", ev(q, [7]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The line dips to 7 below and settles on 2, leaving V open, so the
        // leading tone and root carry the bar as before.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The final long 1 takes the same root-fifth support as the midpoint
        // cadence, closing on a full tonic.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The melody begins on 1, cadences there at midpoint, and closes again on a sustained tonic.",
      "independent",
    ),
  ],
);
