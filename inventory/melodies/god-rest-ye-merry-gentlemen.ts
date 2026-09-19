import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const godRestYeMerryGentlemen: CorpusMelody = melody(
  "god-rest-ye-merry-gentlemen",
  "God Rest Ye Merry, Gentlemen",
  96,
  "traditional",
  "Traditional English carol melody in a minor mode, printed in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, q, -1], [1, q], [1, q], [7, q, -1]),
        bar4([1, q], [2, q], [3, h]),
        bar4([4, q], [3, q], [2, q], [1, q]),
        bar4([7, h, -1], [5, h, -1]),
        bar4([1, q], [3, q], [5, q], [4, q]),
        bar4([3, q], [2, q], [1, h]),
        bar4([7, q, -1], [6, q, -1], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "context-required",
      "Natural 1 frames the minor-mode phrase, but lower 7 and the modal contour warrant contextual practice.",
    ),
  ],
  "minor-cadence",
);
