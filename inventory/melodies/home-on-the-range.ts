import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const homeOnTheRange: CorpusMelody = melody(
  "home-on-the-range",
  "Home on the Range",
  84,
  "public-domain",
  "Daniel E. Kelley tune with Brewster Higley lyrics, published in the late nineteenth century.",
  [
    phrase(
      [
        bar3([1, q], [2, q], [3, q]),
        bar3([5, h], [3, q]),
        bar3([2, q], [1, q], [6, q, -1]),
        bar3([5, dh, -1]),
        bar3([1, q], [2, q], [3, q]),
        bar3([5, q], [6, q], [5, q]),
        bar3([3, q], [2, q], [7, q, -1]),
        bar3([1, dh]),
      ],
      "independent",
      "The range opens from 1 and the second sentence closes lower 7 to a sustained tonic.",
    ),
  ],
);
