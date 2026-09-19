import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, e, h, melody, phrase, q, w } from "../melody-builders.ts";

export const itsyBitsySpider: CorpusMelody = melody(
  "itsy-bitsy-spider",
  "Itsy Bitsy Spider",
  108,
  "traditional",
  "Traditional English-language nursery song, published in early twentieth-century folk collections.",
  [
    phrase(
      [
        bar4([5, e, -1], [1, e], [1, q], [1, e], [2, e], [3, q]),
        bar4([3, q], [2, q], [1, h]),
        bar4([2, q], [3, q], [4, q], [4, q]),
        bar4([3, h], [2, h]),
        bar4([1, q], [1, q], [3, q], [5, q]),
        bar4([5, q], [4, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The tune begins around 1, returns through it, and ends with lower 7 resolving to 1.",
    ),
  ],
);
