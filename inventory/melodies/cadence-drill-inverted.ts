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

export const cadenceDrillInverted: CorpusMelody = melody(
  "cadence-drill-inverted",
  "Inverted Cadence Drill",
  84,
  "original",
  "Original exercise written for this corpus: a dominant with its third in the bass resolving to a root-position tonic.",
  [
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [2])),
            voiceOf(
              "harmony",
              ev(h, [1, -1], [3, -1], [5, -1]),
              ev(h, [7, -2], [2, -1], [5, -1]),
            ),
          ],
          [region(h, 1), region(h, 5)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [7, -2], [2, -1], [5, -1]),
              ev(h, [1, -1], [3, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "independent",
      "The melody frames the drill with 1, and the dominant sits on its third throughout.",
      "independent",
    ),
  ],
);
