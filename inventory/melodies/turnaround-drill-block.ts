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

export const turnaroundDrillBlock: CorpusMelody = melody(
  "turnaround-drill-block",
  "Turnaround Drill: ii–V–I as Blocks",
  84,
  "original",
  "Original exercise written for this corpus: the ii–V–I turnaround struck as block triads.",
  [
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [4])),
            voiceOf(
              "harmony",
              ev(h, [1, -1], [3, -1], [5, -1]),
              ev(h, [2, -1], [4, -1], [6, -1]),
            ),
          ],
          [region(h, 1), region(h, 2, "minor")],
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
      "The turnaround begins and ends on 1, each chord sounded as one block.",
      "independent",
    ),
  ],
);
