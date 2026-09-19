import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, e, h, melody, phrase, q, w } from "../melody-builders.ts";

export const shellBeComingRoundTheMountain: CorpusMelody = melody(
  "shell-be-coming-round-the-mountain",
  "She'll Be Coming 'Round the Mountain",
  116,
  "traditional",
  "Traditional American folk song derived from the spiritual ‘When the Chariot Comes’.",
  [
    phrase(
      [
        bar4([5, e, -1], [6, e, -1], [1, q], [1, q], [1, q]),
        bar4([3, q], [3, q], [3, h]),
        bar4([2, q], [1, q], [2, q], [3, q]),
        bar4([1, h], [5, h, -1]),
        bar4([1, q], [1, q], [3, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated 1s establish home immediately and the ending resolves lower 7 to 1.",
    ),
  ],
);
