import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const awayInAManger: CorpusMelody = melody(
  "away-in-a-manger",
  "Away in a Manger",
  80,
  "public-domain",
  "Nineteenth-century American carol melody commonly called Mueller.",
  [
    phrase(
      [
        bar3([1, q], [1, q], [4, q]),
        bar3([3, h], [2, q]),
        bar3([1, q], [1, q], [5, q]),
        bar3([4, dh]),
        bar3([3, q], [3, q], [6, q]),
        bar3([5, h], [4, q]),
        bar3([3, q], [2, q], [7, q, -1]),
        bar3([1, dh]),
      ],
      "independent",
      "Repeated opening 1s and the final 3–2–lower-7–1 descent provide clear tonic evidence.",
    ),
  ],
);
