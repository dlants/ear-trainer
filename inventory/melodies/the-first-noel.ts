import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const theFirstNoel: CorpusMelody = melody(
  "the-first-noel",
  "The First Noel",
  80,
  "traditional",
  "Traditional English carol, published in the early nineteenth century.",
  [
    phrase(
      [
        // The melody's 3–2–1 descent states I by itself, so the waltz bass
        // holds a single root for the measure.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's held 2 leaves V open, so the leading tone joins the root
        // there; the beat-three turn back to I needs only its root.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1, -1])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The first turn to IV is thickened to root and third, since this is
        // where the harmony moves away from home for the first time.
        polyBar3(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        // The tune sits on a long 5, the chordal root of V, so a lone held bass
        // root is enough support.
        polyBar3(
          [voiceOf("melody", ev(dh, [5])), voiceOf("harmony", ev(dh, [5, -1]))],
          [region(dh, 5)],
        ),
        // The melody's 6 is the third of IV, so the bass takes a single root
        // here rather than repeating the earlier dyad.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [4, -1])),
          ],
          [region(dh, 4)],
        ),
        // The held 3 states I on its own; the late move to V takes a bare root,
        // since the leading tone has already been sounded earlier in the strain.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // Approaching the cadence the harmony widens again: the leading tone
        // under the melody's own lower 7 sharpens the pull home.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(q, 1), region(h, 5)],
        ),
        // The long 1 closes the strain; a root-fifth gives the arrival weight
        // without doubling the third the melody implies.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The opening descends to 1 and the complete strain ends with another tonic arrival.",
      "independent",
    ),
  ],
);
