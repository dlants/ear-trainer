import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const skipToMyLou: CorpusMelody = melody(
  "skip-to-my-lou",
  "Skip to My Lou",
  112,
  "traditional",
  "Traditional American partner-stealing dance song, documented in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, q], [3, q], [3, h]),
        bar4([5, q], [3, q], [3, h]),
        bar4([5, q], [4, q], [3, q], [2, q]),
        bar4([1, w]),
        bar4([1, q], [3, q], [5, h]),
        bar4([5, q], [4, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The first half cadences on 1 and the ending repeats a lower-7-to-1 tonic resolution.",
    ),
  ],
);
