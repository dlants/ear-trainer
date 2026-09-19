import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  dq,
  e,
  ev,
  melody,
  phrase,
  polyBar6,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const rowYourBoat: CorpusMelody = melody(
  "row-your-boat",
  "Row, Row, Row Your Boat",
  104,
  "traditional",
  "Traditional English-language round, printed in nineteenth-century American song collections.",
  [
    phrase(
      [
        polyBar6(
          [
            voiceOf("melody", ev(dq, [1]), ev(dq, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [2]), ev(dq, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar6(
          [
            voiceOf("melody", ev(q, [3]), ev(e, [2]), ev(q, [3]), ev(e, [4])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1], [7, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        polyBar6(
          [
            voiceOf("melody", ev(dh, [5])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Three opening tonic attacks establish 1 before the line rises to 5.",
      "independent",
    ),
    phrase(
      [
        polyBar6(
          [
            voiceOf(
              "melody",
              ev(e, [1, 1]),
              ev(e, [1, 1]),
              ev(e, [1, 1]),
              ev(e, [5]),
              ev(e, [5]),
              ev(e, [5]),
            ),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar6(
          [
            voiceOf(
              "melody",
              ev(e, [3]),
              ev(e, [3]),
              ev(e, [3]),
              ev(e, [1]),
              ev(e, [1]),
              ev(e, [1]),
            ),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar6(
          [
            voiceOf("melody", ev(q, [5]), ev(e, [4]), ev(q, [3]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1], [7, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        polyBar6(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Repeated upper and home-register 1s lead to the closing 5–4–3–2–1 descent.",
      "independent",
    ),
  ],
);
