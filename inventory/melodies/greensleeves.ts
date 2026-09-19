import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const greensleeves: CorpusMelody = melody(
  "greensleeves",
  "Greensleeves",
  76,
  "public-domain",
  "English Renaissance ballad tune, registered in 1580.",
  [
    phrase(
      [
        bar3([5, q, -1], [1, h]),
        bar3([2, q], [3, q], [4, q]),
        bar3([3, h], [2, q]),
        bar3([7, h, -1], [5, q, -1]),
        bar3([5, q, -1], [1, h]),
        bar3([2, q], [3, q], [2, q]),
        bar3([7, q, -1], [6, q, -1], [7, q, -1]),
        bar3([1, dh]),
      ],
      "context-required",
      "The minor-mode tune frames 1 with lower 7 and 6; its tonic is clear in context but conservative practice should defer it.",
    ),
  ],
  "minor-cadence",
);
