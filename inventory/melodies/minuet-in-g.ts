import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, melody, phrase, q } from "../melody-builders.ts";

export const minuetInG: CorpusMelody = melody(
  "minuet-in-g",
  "Minuet in G",
  100,
  "public-domain",
  "Christian Petzold, Minuet in G major from the 1725 Notebook for Anna Magdalena Bach.",
  [
    phrase(
      [
        bar3([5, q], [1, q, 1], [2, q, 1]),
        bar3([3, q, 1], [4, q, 1], [5, q, 1]),
        bar3([1, q], [2, q], [3, q]),
        bar3([4, q], [5, q], [6, q]),
        bar3([5, q], [3, q], [1, q]),
        bar3([2, q], [3, q], [4, q]),
        bar3([3, q], [2, q], [7, q, -1]),
        bar3([1, dh]),
      ],
      "independent",
      "The closing half descends through the tonic triad and resolves lower 7 to a sustained 1.",
    ),
  ],
);
