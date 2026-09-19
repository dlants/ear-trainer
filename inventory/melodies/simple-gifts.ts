import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const simpleGifts: CorpusMelody = melody(
  "simple-gifts",
  "Simple Gifts",
  104,
  "public-domain",
  "Joseph Brackett's Shaker dance song, composed in 1848.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [4, q], [4, q]),
        bar4([4, q], [5, q], [6, h]),
        bar4([6, q], [5, q], [4, q], [3, q]),
        bar4([2, h], [1, h]),
        bar4([1, q], [3, q], [4, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all establish home.",
    ),
  ],
);
