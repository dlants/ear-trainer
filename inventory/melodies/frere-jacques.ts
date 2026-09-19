import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, e, h, melody, phrase, q } from "../melody-builders.ts";

export const frereJacques: CorpusMelody = melody(
  "frere-jacques",
  "Frère Jacques",
  104,
  "traditional",
  "Traditional French canon, documented in eighteenth-century sources.",
  [
    phrase(
      [
        bar4([1, q], [2, q], [3, q], [1, q]),
        bar4([1, q], [2, q], [3, q], [1, q]),
      ],
      "independent",
      "Each statement begins and ends on 1, making the tonic explicit despite the short range.",
    ),
    phrase(
      [bar4([3, q], [4, q], [5, h]), bar4([3, q], [4, q], [5, h])],
      "context-required",
      "The phrase centers its arrival on 5 and needs the opening tonic statement.",
    ),
    phrase(
      [
        bar4([5, e], [6, e], [5, e], [4, e], [3, q], [1, q]),
        bar4([5, e], [6, e], [5, e], [4, e], [3, q], [1, q]),
      ],
      "independent",
      "Both descents arrive on 1 after a clear 5–4–3 motion.",
    ),
    phrase(
      [bar4([1, q], [5, q, -1], [1, h]), bar4([1, q], [5, q, -1], [1, h])],
      "independent",
      "Repeated 1–lower-5–1 arpeggiations strongly establish home.",
    ),
  ],
);
