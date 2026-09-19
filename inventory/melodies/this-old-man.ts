import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const thisOldMan: CorpusMelody = melody(
  "this-old-man",
  "This Old Man",
  112,
  "traditional",
  "Traditional English-language nursery and counting song, collected in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, q], [3, q], [5, h]),
        bar4([5, q], [3, q], [5, h]),
        bar4([6, q], [5, q], [4, q], [3, q]),
        bar4([2, q], [3, q], [4, h]),
      ],
      "context-required",
      "The opening strain avoids 1 and pauses on 4, so it does not independently establish tonic.",
    ),
    phrase(
      [
        bar4([1, q], [1, q], [2, q], [3, q]),
        bar4([4, q], [5, q], [3, h]),
        bar4([1, q], [2, q], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated 1s and the final 2–lower-7–2–1 figure make the tonic arrival explicit.",
    ),
  ],
);
