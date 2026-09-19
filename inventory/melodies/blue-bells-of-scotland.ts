import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const blueBellsOfScotland: CorpusMelody = melody(
  "blue-bells-of-scotland",
  "The Blue Bells of Scotland",
  92,
  "traditional",
  "Traditional Scottish song tune popularized in late eighteenth-century print.",
  [
    phrase(
      [
        bar4([5, q, -1], [1, q], [3, q], [5, q]),
        bar4([6, h], [5, h]),
        bar4([3, q], [1, q], [2, q], [3, q]),
        bar4([1, w]),
        bar4([5, q], [5, q], [6, q], [5, q]),
        bar4([3, h], [2, h]),
        bar4([1, q], [2, q], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "The pickup reaches 1, the first half cadences there, and the complete strain closes again on tonic.",
    ),
  ],
);
