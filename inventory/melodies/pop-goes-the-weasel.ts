import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  dq,
  e,
  ev,
  melody,
  phrase,
  polyBar6,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const popGoesTheWeasel: CorpusMelody = melody(
  "pop-goes-the-weasel",
  "Pop Goes the Weasel",
  116,
  "traditional",
  "Traditional English dance and nursery tune, published in the 1850s.",
  [
    phrase(
      [
        // The tune runs 1-1-2-2, stating I and then leaving 2 open, so the
        // dance bass walks a single root per dotted-quarter beat: 1 then 5.
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [1]), ev(q, [2]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // The melody outlines 3-5-3, the upper reaches of I, so one held bass
        // root is all the support the bar needs.
        polyBar6(
          [
            voiceOf("melody", ev(q, [3]), ev(e, [5]), ev(dq, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The run-up returns unchanged; the walking roots keep the dance pulse.
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [1]), ev(q, [2]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // Melody 3 then 1 spells the tonic triad on its own, so the bass simply
        // holds its root underneath.
        polyBar6(
          [
            voiceOf("melody", ev(dq, [3]), ev(dq, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // Third statement of the run-up, voiced the same way before the strain
        // turns.
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [1]), ev(q, [2]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // The lift to 6 is where the harmony turns, and the melody's 6 is only
        // the chordal third of IV, so the bass thickens to root and third there
        // while I keeps its lone root.
        polyBar6(
          [
            voiceOf("melody", ev(q, [3]), ev(e, [5]), ev(dq, [6])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [4, -1], [6, -1])),
          ],
          [region(dq, 1), region(dq, 4)],
        ),
        // The melody's own lower 7 sets up the snap; the harmony doubles that
        // leading tone on the first beat, then falls back to a bare V root.
        polyBar6(
          [
            voiceOf(
              "melody",
              ev(q, [5]),
              ev(e, [3]),
              ev(q, [2]),
              ev(e, [7, -1]),
            ),
            voiceOf("harmony", ev(dq, [5, -1], [7, -1]), ev(dq, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune lands on a long 1; root and fifth underneath make the
        // arrival feel like the end of the dance.
        polyBar6(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Each strain starts on 1, and the final lower-7-to-1 snap is a strong tonic resolution.",
      "independent",
    ),
  ],
);
