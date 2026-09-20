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
 * A single bass root holds the tonic bars; the accompaniment thickens to a
 * dyad only where the tune turns to V (the "see how they run" descents) and at
 * the closing cadence.
 */
const descentBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [3]), ev(h, [2])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const tonicBar = () =>
  polyBar(
    [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const runningBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const cadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
      voiceOf(
        "harmony",
        ev(q, [1, -1]),
        ev(q, [5, -1], [7, -1]),
        ev(h, [1, -1], [5, -1]),
      ),
    ],
    [region(q, 1), region(q, 5), region(h, 1)],
  );

export const threeBlindMice: CorpusMelody = melody(
  "three-blind-mice",
  "Three Blind Mice",
  108,
  "traditional",
  "Traditional English round, with the familiar melody documented by the seventeenth century.",
  [
    phrase(
      [
        descentBar(),
        tonicBar(),
        descentBar(),
        tonicBar(),
        runningBar(),
        runningBar(),
        cadenceBar(),
        tonicBar(),
      ],
      "independent",
      "Repeated 3–2–1 descents and a final sustained 1 provide unusually direct tonic evidence.",
      "independent",
    ),
  ],
);
