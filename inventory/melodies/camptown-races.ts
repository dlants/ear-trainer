import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const camptownRaces: CorpusMelody = melody(
  "camptown-races",
  "Camptown Races",
  116,
  "public-domain",
  "Stephen Foster minstrel-era song, published in 1850.",
  [
    phrase(
      [
        bar4([5, q], [5, q], [3, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([3, q], [2, q], [1, q], [2, q]),
        bar4([3, h], [1, h]),
        bar4([5, q], [5, q], [3, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The first cadence reaches 1 and the last phrase resolves lower 7 to a long tonic.",
    ),
  ],
);
