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

export const cadenceDrillPop: CorpusMelody = melody(
  "cadence-drill-pop",
  "Block Triad Drill: I–V–vi–IV",
  84,
  "original",
  "Original exercise written for this corpus: the four-chord pop progression as block triads.",
  [
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [2])),
            voiceOf(
              "harmony",
              ev(h, [1, -1], [3, -1], [5, -1]),
              ev(h, [5, -2], [7, -2], [2, -1]),
            ),
          ],
          [region(h, 1), region(h, 5)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [6, -2], [1, -1], [3, -1]),
              ev(h, [4, -2], [6, -2], [1, -1]),
            ),
          ],
          [region(h, 6, "minor"), region(h, 4)],
        ),
      ],
      "independent",
      "The melody opens and closes on 1 while the harmony turns V to vi rather than home.",
      "independent",
    ),
  ],
);
