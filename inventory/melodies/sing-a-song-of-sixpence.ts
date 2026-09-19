import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const singASongOfSixpence: CorpusMelody = melody(
  "sing-a-song-of-sixpence",
  "Sing a Song of Sixpence",
  112,
  "traditional",
  "Traditional English nursery song documented in eighteenth-century print.",
  [
    phrase(
      [
        bar4([5, q], [5, q], [3, q], [3, q]),
        bar4([4, q], [4, q], [2, h]),
        bar4([1, q], [2, q], [3, q], [4, q]),
        bar4([5, w]),
        bar4([5, q], [3, q], [1, q], [3, q]),
        bar4([4, q], [2, q], [7, h, -1]),
        bar4([1, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The answer phrase repeatedly uses 1 and closes with lower 7–1 resolution.",
    ),
  ],
);
