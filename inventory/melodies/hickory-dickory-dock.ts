import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const hickoryDickoryDock: CorpusMelody = melody(
  "hickory-dickory-dock",
  "Hickory Dickory Dock",
  108,
  "traditional",
  "Traditional English nursery rhyme tune in a common modern folk form.",
  [
    phrase(
      [
        bar4([1, q], [2, q], [3, q], [4, q]),
        bar4([5, h], [5, h]),
        bar4([6, q], [5, q], [4, q], [3, q]),
        bar4([2, h], [1, h]),
        bar4([5, q], [5, q], [3, q], [3, q]),
        bar4([4, q], [4, q], [2, h]),
        bar4([1, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The scale ascent starts on 1, the first half cadences there, and the ending resolves lower 7 to 1.",
    ),
  ],
);
