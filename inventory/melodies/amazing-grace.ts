import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, e, h, melody, phrase, q } from "../melody-builders.ts";

export const amazingGrace: CorpusMelody = melody(
  "amazing-grace",
  "Amazing Grace",
  84,
  "public-domain",
  "Words by John Newton with the early nineteenth-century American tune New Britain.",
  [
    phrase(
      [
        bar3([5, q, -1], [1, h]),
        bar3([3, e], [1, e], [3, h]),
        bar3([2, q], [1, q], [6, q, -1]),
        bar3([5, q, -1], [1, h]),
        bar3([3, e], [1, e], [3, h]),
        bar3([2, h], [3, q]),
        bar3([5, h], [3, q]),
        bar3([1, dh]),
      ],
      "independent",
      "The lower-5 pickup repeatedly resolves to 1, and the strain closes on a sustained tonic.",
    ),
  ],
);
