import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const hotCrossBuns: CorpusMelody = melody(
  "hot-cross-buns",
  "Hot Cross Buns",
  96,
  "traditional",
  "Traditional English street cry and nursery tune, documented by the eighteenth century.",
  [
    phrase(
      [bar4([3, h], [2, h]), bar4([1, w]), bar4([3, h], [2, h]), bar4([1, w])],
      "independent",
      "Each descending 3–2–1 statement ends on a sustained tonic.",
    ),
    phrase(
      [
        bar4([1, q], [1, q], [1, q], [1, q]),
        bar4([2, q], [2, q], [2, q], [2, q]),
        bar4([3, h], [2, h]),
        bar4([1, w]),
      ],
      "independent",
      "Four repeated 1s precede the final 3–2–1 cadence.",
    ),
  ],
);
