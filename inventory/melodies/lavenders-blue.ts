import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const lavendersBlue: CorpusMelody = melody(
  "lavenders-blue",
  "Lavender's Blue",
  96,
  "traditional",
  "Traditional English folk song documented in seventeenth-century broadside form.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [3, q], [3, q]),
        bar4([5, q], [5, q], [3, h]),
        bar4([4, q], [4, q], [2, q], [2, q]),
        bar4([1, w]),
        bar4([3, q], [3, q], [5, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all point home.",
    ),
  ],
);
