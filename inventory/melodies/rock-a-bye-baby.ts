import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const rockAByeBaby: CorpusMelody = melody(
  "rock-a-bye-baby",
  "Rock-a-bye Baby",
  80,
  "traditional",
  "Traditional English-language lullaby tune, published in the nineteenth century.",
  [
    phrase(
      [
        bar3([1, q], [3, q], [6, q]),
        bar3([5, h], [3, q]),
        bar3([4, q], [2, q], [7, q, -1]),
        bar3([1, dh]),
        bar3([1, q], [3, q], [6, q]),
        bar3([5, h], [3, q]),
        bar3([2, q], [7, q, -1], [2, q]),
        bar3([1, dh]),
      ],
      "independent",
      "Both halves begin on 1 and cadence through lower 7 to a sustained 1.",
    ),
  ],
);
