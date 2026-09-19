import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const pollyPutTheKettleOn: CorpusMelody = melody(
  "polly-put-the-kettle-on",
  "Polly Put the Kettle On",
  112,
  "traditional",
  "Traditional English nursery tune, printed in the late eighteenth century.",
  [
    phrase(
      [
        bar4([5, q], [3, q], [3, q], [3, q]),
        bar4([4, q], [2, q], [2, h]),
        bar4([1, q], [2, q], [3, q], [4, q]),
        bar4([5, h], [5, h]),
        bar4([5, q], [3, q], [3, q], [3, q]),
        bar4([4, q], [2, q], [2, h]),
        bar4([1, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The latter half reaches 1 and closes with lower 7 resolving to a full-measure tonic.",
    ),
  ],
);
