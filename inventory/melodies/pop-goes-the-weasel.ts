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

/**
 * A dance-like left hand: one bass root per dotted-quarter beat, thickened to a
 * dyad only where the harmony turns (the lift to IV and the closing V–I snap).
 */
const runUpBar = () =>
  polyBar6(
    [
      voiceOf("melody", ev(q, [1]), ev(e, [1]), ev(q, [2]), ev(e, [2])),
      voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1])),
    ],
    [region(dq, 1), region(dq, 5)],
  );
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar6(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1)],
  );
const liftBar = () =>
  polyBar6(
    [
      voiceOf("melody", ev(q, [3]), ev(e, [5]), ev(dq, [6])),
      voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [4, -1], [6, -1])),
    ],
    [region(dq, 1), region(dq, 4)],
  );
const popBar = () =>
  polyBar6(
    [
      voiceOf("melody", ev(q, [5]), ev(e, [3]), ev(q, [2]), ev(e, [7, -1])),
      voiceOf("harmony", ev(dq, [5, -1], [7, -1]), ev(dq, [5, -1])),
    ],
    [region(dh, 5)],
  );
const closeBar = () =>
  polyBar6(
    [
      voiceOf("melody", ev(dh, [1])),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const popGoesTheWeasel: CorpusMelody = melody(
  "pop-goes-the-weasel",
  "Pop Goes the Weasel",
  116,
  "traditional",
  "Traditional English dance and nursery tune, published in the 1850s.",
  [
    phrase(
      [
        runUpBar(),
        tonicBar(ev(q, [3]), ev(e, [5]), ev(dq, [3])),
        runUpBar(),
        tonicBar(ev(dq, [3]), ev(dq, [1])),
        runUpBar(),
        liftBar(),
        popBar(),
        closeBar(),
      ],
      "independent",
      "Each strain starts on 1, and the final lower-7-to-1 snap is a strong tonic resolution.",
      "independent",
    ),
  ],
);
