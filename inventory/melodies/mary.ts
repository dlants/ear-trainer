import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const mary: CorpusMelody = melody(
  "mary",
  "Mary Had a Little Lamb",
  108,
  "public-domain",
  "American nursery song associated with Sarah Josepha Hale's 1830 poem and Lowell Mason's nineteenth-century tune.",
  [
    phrase(
      [
        bar4([3, q], [2, q], [1, q], [2, q]),
        bar4([3, q], [3, q], [3, h]),
        bar4([2, q], [2, q], [2, h]),
        bar4([3, q], [5, q], [5, h]),
      ],
      "context-required",
      "The opening touches 1 only in passing and closes on 5, so the local tonic evidence is weak.",
    ),
    phrase(
      [
        bar4([3, q], [2, q], [1, q], [2, q]),
        bar4([3, q], [3, q], [3, q], [3, q]),
        bar4([2, q], [2, q], [3, q], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "The descent 3–2–1 is restated and the phrase resolves to a full-measure 1.",
    ),
  ],
);
