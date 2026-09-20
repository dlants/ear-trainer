import type { CorpusMelody } from "../../music/melody.ts";
import {
  e,
  ev,
  h,
  melody,
  phrase,
  polyBar,
  q,
  region,
  voiceOf,
  w,
} from "../melody-builders.ts";

/**
 * The tune sits almost entirely on the tonic, so the left hand holds a single
 * root under the opening statements and only thickens where the harmony turns:
 * the arrival on V, the move to IV under the descent, and the closing cadence.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const risingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const descentBar = () =>
  polyBar(
    [
      voiceOf(
        "melody",
        ev(e, [5]),
        ev(e, [6]),
        ev(e, [5]),
        ev(e, [4]),
        ev(q, [3]),
        ev(q, [1]),
      ),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const closingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [5, -1]), ev(h, [1])),
      voiceOf(
        "harmony",
        ev(q, [1, -1]),
        ev(q, [5, -1], [7, -1]),
        ev(h, [1, -1], [5, -1]),
      ),
    ],
    [region(q, 1), region(q, 5), region(h, 1)],
  );

export const frereJacques: CorpusMelody = melody(
  "frere-jacques",
  "Frère Jacques",
  104,
  "traditional",
  "Traditional French canon, documented in eighteenth-century sources.",
  [
    phrase(
      [openingBar(), openingBar()],
      "independent",
      "Each statement begins and ends on 1, making the tonic explicit despite the short range.",
      "independent",
    ),
    phrase(
      [risingBar(), risingBar()],
      "context-required",
      "The phrase centers its arrival on 5 and needs the opening tonic statement.",
      "independent",
    ),
    phrase(
      [descentBar(), descentBar()],
      "independent",
      "Both descents arrive on 1 after a clear 5–4–3 motion.",
      "independent",
    ),
    phrase(
      [closingBar(), closingBar()],
      "independent",
      "Repeated 1–lower-5–1 arpeggiations strongly establish home.",
      "independent",
    ),
  ],
);
