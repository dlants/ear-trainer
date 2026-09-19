import type { CorpusMelody } from "../../music/melody.ts";
import {
  ev,
  h,
  melody,
  phrase,
  polyBar,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const cadenceDrillBlock: CorpusMelody = melody(
  "cadence-drill-block",
  "Block Triad Drill: I–IV–V–I",
  84,
  "original",
  "Original exercise written for this corpus: four root-position triads struck as blocks.",
  [
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [1, -1], [3, -1], [5, -1]),
              ev(h, [4, -2], [6, -2], [1, -1]),
            ),
          ],
          [region(h, 1), region(h, 4)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -2], [7, -2], [2, -1]),
              ev(h, [1, -1], [3, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "independent",
      "Every chord holds 1 in the melody or resolves to it, and each triad is struck as one block.",
      "independent",
    ),
  ],
);
