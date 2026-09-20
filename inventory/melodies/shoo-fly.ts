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

/**
 * The left hand is a walking single bass root that only thickens to a dyad
 * where the harmony turns: the approach to the half cadence in bar 4 and the
 * final V–I.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const neighborBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [6]), ev(h, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const descentBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const halfCadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [2]), ev(h, [5, -1])),
      voiceOf("harmony", ev(w, [5, -1])),
    ],
    [region(w, 5)],
  );
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const shooFly: CorpusMelody = melody(
  "shoo-fly",
  "Shoo, Fly, Don't Bother Me",
  112,
  "public-domain",
  "American popular and folk song first published in the 1860s.",
  [
    phrase(
      [
        openingBar(),
        neighborBar(),
        descentBar(ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
        halfCadenceBar(),
        openingBar(),
        neighborBar(),
        descentBar(ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "The melody starts on 1, descends through 1, and ends with lower 7 resolving to tonic.",
      "independent",
    ),
  ],
);
