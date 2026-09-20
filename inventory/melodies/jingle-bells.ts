import type { CorpusMelody } from "../../music/melody.ts";
import {
  dq,
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

/**
 * The left hand holds a single root through the all-tonic refrain and thickens
 * only where the harmony turns: the move to IV, the dominant bar, and the
 * closing V-I.
 */
export const jingleBells: CorpusMelody = melody(
  "jingle-bells",
  "Jingle Bells",
  116,
  "public-domain",
  "James Lord Pierpont, ‘One Horse Open Sleigh’, 1857.",
  [
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [3]),
              ev(q, [5]),
              ev(dq, [1, 1]),
              ev(e, [2, 1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(w, [3, 1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "context-required",
      "The refrain's first half leaps through upper 1 but ends on 3, so its cadence is not tonic.",
      "context-required",
    ),
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(dq, [4]), ev(e, [4])),
            voiceOf("harmony", ev(w, [4, -1], [6, -1])),
          ],
          [region(w, 4)],
        ),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [4]),
              ev(q, [3]),
              ev(q, [3]),
              ev(e, [3]),
              ev(e, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "context-required",
      "This answer emphasizes 4, 3, 2, and 5 without a natural tonic arrival.",
      "independent",
    ),
  ],
);
