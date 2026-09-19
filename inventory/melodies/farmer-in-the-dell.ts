import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const farmerInTheDell: CorpusMelody = melody(
  "farmer-in-the-dell",
  "The Farmer in the Dell",
  108,
  "traditional",
  "Traditional German-American singing-game tune, widespread in the nineteenth century.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [1, q], [1, q]),
        bar4([1, q], [1, q], [2, q], [3, q]),
        bar4([3, q], [2, q], [1, q], [2, q]),
        bar4([3, w]),
        bar4([3, q], [4, q], [5, h]),
        bar4([5, q], [4, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Six opening tonic attacks and a final lower-7-to-1 cadence give strong evidence for home.",
    ),
  ],
);
