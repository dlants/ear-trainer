import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, melody, phrase, q } from "../melody-builders.ts";

export const weWishYouAMerryChristmas: CorpusMelody = melody(
  "we-wish-you-a-merry-christmas",
  "We Wish You a Merry Christmas",
  104,
  "traditional",
  "Traditional English carol from the West Country.",
  [
    phrase(
      [
        bar3([5, q, -1], [1, q], [1, q]),
        bar3([2, q], [1, q], [7, q, -1]),
        bar3([6, q, -1], [6, q, -1], [2, q]),
        bar3([2, q], [3, q], [2, q]),
        bar3([1, q], [7, q, -1], [5, q, -1]),
        bar3([3, q], [4, q], [3, q]),
        bar3([2, q], [7, q, -1], [2, q]),
        bar3([1, dh]),
      ],
      "independent",
      "The pickup reaches repeated 1s, and the final lower-7 neighbor figure resolves to sustained tonic.",
    ),
  ],
);
