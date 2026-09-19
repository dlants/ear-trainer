import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const kumbaya: CorpusMelody = melody(
  "kumbaya",
  "Kumbaya",
  76,
  "traditional",
  "Traditional African American spiritual and camp song, documented in early twentieth-century field recordings.",
  [
    phrase(
      [
        bar4([1, h], [3, h]),
        bar4([5, h], [5, h]),
        bar4([6, h], [5, h]),
        bar4([3, w]),
        bar4([1, h], [3, h]),
        bar4([5, q], [4, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The second statement begins on 1 and the final lower-7-to-1 motion gives a clear cadence.",
    ),
  ],
);
