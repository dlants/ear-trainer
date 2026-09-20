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

export const frereJacques: CorpusMelody = melody(
  "frere-jacques",
  "Frère Jacques",
  104,
  "traditional",
  "Traditional French canon, documented in eighteenth-century sources.",
  [
    phrase(
      [
        // The tune climbs 1–2–3 and returns to 1, so it states I on its own; a
        // single held root is all the harmony needs to supply.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The repeat of the statement keeps the same lone root: nothing has
        // turned, so there is no reason to spend a second note.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Each statement begins and ends on 1, making the tonic explicit despite the short range.",
      "independent",
    ),
    phrase(
      [
        // The melody's held 5 is open between I and V, so the harmony turns
        // here: a bare root under the 3–4 rise, then the leading tone joins 5
        // to name the dominant.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The repeat states the same turn to V with the same leading tone, so
        // the arrival is heard twice rather than taken on trust.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
      ],
      "context-required",
      "The phrase centers its arrival on 5 and needs the opening tonic statement.",
      "independent",
    ),
    phrase(
      [
        // The melody's 6 over IV is the chordal sixth of the scale, not the
        // root, so the harmony supplies 4 with its third; the return to I needs
        // only the root, since the tune lands on 1.
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
        ),
        // The second descent is voiced the same way: the subdominant is where
        // the harmony moves, and the tonic half is carried by the melody.
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
        ),
      ],
      "independent",
      "Both descents arrive on 1 after a clear 5–4–3 motion.",
      "independent",
    ),
    phrase(
      [
        // The tune arpeggiates 1–lower 5–1 and so says little about the
        // dominant passing chord; the leading tone marks it, and the final
        // tonic gets root and fifth to close.
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
        ),
        // The closing repeat cadences the same way, so the last thing heard is
        // the leading tone resolving into a root-and-fifth tonic.
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
        ),
      ],
      "independent",
      "Repeated 1–lower-5–1 arpeggiations strongly establish home.",
      "independent",
    ),
  ],
);
