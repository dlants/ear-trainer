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

export const oldMacdonald: CorpusMelody = melody(
  "old-macdonald",
  "Old MacDonald Had a Farm",
  108,
  "traditional",
  "Traditional American cumulative song, documented in early twentieth-century collections from older oral forms.",
  [
    phrase(
      [
        // The tune hammers 1 on its own, so the bass just holds a single root
        // under it for the whole bar.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [5, -1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The first turn away from tonic: the melody's 6 is the chordal third
        // of IV, but this is where the harmony moves, so the extra note goes
        // here. V then takes a bare root, the bass stepping 4-5.
        polyBar(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The melody's 3 states I and its 2 leaves V open, but the descent is
        // quick and the phrase has already sounded IV-V, so single roots carry
        // both halves.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The half cadence: the melody rises to 5, which V shares with I, so
        // the leading tone sounds here to mark the open ending.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the 2–1 motion establish tonic before the refrain pickup.",
      "independent",
    ),
    phrase(
      [
        // The repeated 1s state the key again; a lone root under them is all
        // the support the bar needs.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [5, -1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // Same refrain turn as before, voiced the same way: the dyad marks the
        // move to IV, and V follows on a bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The 3-2 descent again over stepping roots; the leading tone is saved
        // for the cadence bars rather than spent here.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds 1 for the whole close. The fifth joins the root so
        // the final bar sounds settled rather than thinner than what preceded.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The repeated tonic opening returns and the complete strain closes on a full-measure 1.",
      "independent",
    ),
  ],
);
