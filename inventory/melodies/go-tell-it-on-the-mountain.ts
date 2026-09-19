import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const goTellItOnTheMountain: CorpusMelody = melody(
  "go-tell-it-on-the-mountain",
  "Go Tell It on the Mountain",
  100,
  "traditional",
  "Traditional African American spiritual, collected and published in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, q], [5, q], [3, q], [1, q]),
        bar4([2, q], [3, q], [1, h]),
        bar4([5, q], [5, q], [6, q], [5, q]),
        bar4([3, h], [2, h]),
        bar4([1, q], [3, q], [5, q], [6, q]),
        bar4([5, q], [3, q], [1, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "A 5–3–1 opening descent, repeated 1s, and the final lower-7 resolution identify tonic.",
    ),
  ],
);
