import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const whatChildIsThis: CorpusMelody = melody(
  "what-child-is-this",
  "What Child Is This?",
  76,
  "public-domain",
  "William Chatterton Dix's carol sung to the sixteenth-century English tune Greensleeves.",
  [
    phrase(
      [
        bar3([5, q, -1], [1, h]),
        bar3([2, q], [3, q], [4, q]),
        bar3([3, h], [2, q]),
        bar3([7, h, -1], [5, q, -1]),
        bar3([1, q], [2, q], [3, q]),
        bar3([2, q], [1, q], [7, q, -1]),
        bar3([6, q, -1], [7, q, -1], [2, q]),
        bar3([1, dh]),
      ],
      "context-required",
      "The minor-mode cadence reaches 1, but its lower-7 and lower-6 emphasis makes it a contextual example.",
    ),
  ],
  "minor-cadence",
);
