import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const downInTheValley: CorpusMelody = melody(
  "down-in-the-valley",
  "Down in the Valley",
  76,
  "traditional",
  "Traditional American folk song and Appalachian standard.",
  [
    phrase(
      [
        bar3([5, q, -1], [1, h]),
        bar3([3, h], [2, q]),
        bar3([1, q], [2, q], [3, q]),
        bar3([2, dh]),
        bar3([5, q, -1], [1, h]),
        bar3([3, q], [5, q], [3, q]),
        bar3([2, q], [7, q, -1], [2, q]),
        bar3([1, dh]),
      ],
      "independent",
      "Both lower-5 pickups resolve to 1 and the closing neighbor figure settles on a long tonic.",
    ),
  ],
);
