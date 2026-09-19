import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const scarboroughFair: CorpusMelody = melody(
  "scarborough-fair",
  "Scarborough Fair",
  80,
  "traditional",
  "Traditional English ballad tune in a common Dorian-inflected form.",
  [
    phrase(
      [
        bar3([1, q], [1, q], [5, q]),
        bar3([2, h], [1, q]),
        bar3([3, q], [4, q], [3, q]),
        bar3([2, dh]),
        bar3([1, q], [5, q, -1], [1, q]),
        bar3([2, q], [3, q], [2, q]),
        bar3([7, q, -1], [2, q], [7, q, -1]),
        bar3([1, dh]),
      ],
      "context-required",
      "The modal line begins and ends on 1, but its persistent 2 and lower 7 make beginner tonic evidence less direct.",
    ),
  ],
  "minor-cadence",
);
