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

export const auldLangSyne: CorpusMelody = melody(
  "auld-lang-syne",
  "Auld Lang Syne",
  88,
  "traditional",
  "Traditional Scots tune associated with Robert Burns's 1788 text.",
  [
    phrase(
      [
        // The pickup 5 rising to repeated 1s states the tonic outright, so a
        // single held bass root is all the harmony owes it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The 3-2-1 descent lands on 1 again; the bass root simply holds under
        // a melody that is already spelling I.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The line turns around 2 and 3 but closes the bar on 1, so the held
        // root keeps the bar inside the tonic without crowding it.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 and 5 are open between I and V, so the half cadence
        // sounds the leading tone before resting on the bare dominant root.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The descent 5-3-1 outlines the tonic triad itself; the bass root is
        // enough underneath.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The answering 3-2-1 again states I, so the held root repeats rather
        // than thickening where nothing is turning.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody dips below the tonic to 6 and 5, leaving the chord open,
        // so IV takes root and third before the dominant root pushes to the
        // close.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [6, -1]),
              ev(q, [5, -1]),
              ev(q, [6, -1]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The long final 1 gets a root-fifth dyad so the close sounds full
        // rather than trailing away.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The tune repeatedly returns to 1, and the closing lower-neighbor ascent settles on a long tonic.",
      "independent",
    ),
  ],
);
