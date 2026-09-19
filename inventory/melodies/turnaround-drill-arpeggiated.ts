import type { CorpusMelody } from "../../music/melody.ts";
import {
  bar4,
  h,
  melody,
  phrase,
  q,
  region,
  w,
  withHarmony,
} from "../melody-builders.ts";

export const turnaroundDrillArpeggiated: CorpusMelody = melody(
  "turnaround-drill-arpeggiated",
  "Turnaround Drill: ii–V–I Arpeggiated",
  84,
  "original",
  "Original exercise written for this corpus: the same turnaround spelled one note at a time.",
  [
    phrase(
      [
        withHarmony(bar4([2, q], [4, q], [5, q, -1], [7, q, -1]), [
          region(h, 2, "minor"),
          region(h, 5),
        ]),
        withHarmony(bar4([1, q], [3, q], [5, q], [1, q, 1]), [region(w, 1)]),
      ],
      "independent",
      "The same turnaround as the block drill, stated one note at a time and landing on an arpeggiated tonic triad.",
      "independent",
    ),
  ],
);
