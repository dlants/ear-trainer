import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const lochLomond: CorpusMelody = melody(
  "loch-lomond",
  "The Bonnie Banks o' Loch Lomond",
  80,
  "traditional",
  "Traditional Scottish song, first published in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, q, -1], [1, q], [1, q], [2, q]),
        bar4([3, h], [2, h]),
        bar4([1, q], [3, q], [5, q], [6, q]),
        bar4([5, w]),
        bar4([5, q], [3, q], [1, q], [2, q]),
        bar4([3, q], [2, q], [1, h]),
        bar4([6, q, -1], [5, q, -1], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "The lower-5 pickup reaches 1, the later descent lands there, and the final phrase sustains tonic.",
    ),
  ],
);
