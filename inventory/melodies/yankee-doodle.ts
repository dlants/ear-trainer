import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const yankeeDoodle: CorpusMelody = melody(
  "yankee-doodle",
  "Yankee Doodle",
  116,
  "traditional",
  "Traditional Anglo-American tune widely printed during the eighteenth century.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [2, q], [3, q]),
        bar4([1, q], [3, q], [2, h]),
        bar4([1, q], [1, q], [2, q], [3, q]),
        bar4([1, h], [7, q, -1], [1, q]),
      ],
      "independent",
      "Both sentences begin on 1 and the second resolves lower 7 back to 1.",
    ),
    phrase(
      [
        bar4([1, q], [1, q], [2, q], [3, q]),
        bar4([4, q], [3, q], [2, q], [1, q]),
        bar4([7, q, -1], [5, q, -1], [6, q, -1], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The descending line reaches 1 and the lower leading-tone ascent closes on a long tonic.",
    ),
  ],
);
