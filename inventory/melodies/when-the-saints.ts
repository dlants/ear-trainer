import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const whenTheSaints: CorpusMelody = melody(
  "when-the-saints",
  "When the Saints Go Marching In",
  104,
  "traditional",
  "Traditional American gospel hymn, developed from nineteenth-century spiritual material.",
  [
    phrase(
      [
        bar4([1, q], [3, q], [4, q], [5, q]),
        bar4([1, w, 1]),
        bar4([1, q], [3, q], [4, q], [5, q]),
        bar4([1, w, 1]),
        bar4([3, q], [1, q], [3, q], [2, q]),
        bar4([2, h], [1, h]),
        bar4([3, q], [5, q], [5, q], [4, q]),
        bar4([3, h], [1, h]),
      ],
      "independent",
      "Each opening ascent begins on 1 and reaches upper 1, while both later cadences return to home.",
    ),
  ],
);
