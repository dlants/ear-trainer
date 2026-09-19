import type { CorpusMelody } from "../../music/melody.ts";
import { bar6, dh, dq, e, melody, phrase, q } from "../melody-builders.ts";

export const rowYourBoat: CorpusMelody = melody(
  "row-your-boat",
  "Row, Row, Row Your Boat",
  104,
  "traditional",
  "Traditional English-language round, printed in nineteenth-century American song collections.",
  [
    phrase(
      [
        bar6([1, dq], [1, dq]),
        bar6([1, q], [2, e], [3, dq]),
        bar6([3, q], [2, e], [3, q], [4, e]),
        bar6([5, dh]),
      ],
      "independent",
      "Three opening tonic attacks establish 1 before the line rises to 5.",
    ),
    phrase(
      [
        bar6([1, e, 1], [1, e, 1], [1, e, 1], [5, e], [5, e], [5, e]),
        bar6([3, e], [3, e], [3, e], [1, e], [1, e], [1, e]),
        bar6([5, q], [4, e], [3, q], [2, e]),
        bar6([1, dh]),
      ],
      "independent",
      "Repeated upper and home-register 1s lead to the closing 5–4–3–2–1 descent.",
    ),
  ],
);
