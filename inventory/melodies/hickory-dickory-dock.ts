import type { CorpusMelody } from "../../music/melody.ts";
import {
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

export const hickoryDickoryDock: CorpusMelody = melody(
  "hickory-dickory-dock",
  "Hickory Dickory Dock",
  108,
  "traditional",
  "Traditional English nursery rhyme tune in a common modern folk form.",
  [
    phrase(
      [
        // The scale ascent from 1 states the tonic on its own, so a single
        // held bass root supports it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody parks on 5, which is open between I and V, so the first
        // move away from home sounds its leading tone before settling on a
        // bare root.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The descent passes through 6 and 4, shared between IV and I, so IV
        // takes its third and the return to I needs only its root.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone sounds at the half
        // cadence and I answers with root and fifth.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The tune outlines 5 and 3 of I, so one held bass root is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // IV turns away from home and gets its third; V follows on a bare
        // root, the leading tone having already been heard at the cadence.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The melody supplies the leading tone itself on the last beat, so
        // plain roots carry the approach to the close.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The close lands on 1; a root-fifth below gives it weight.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The scale ascent starts on 1, the first half cadences there, and the ending resolves lower 7 to 1.",
      "independent",
    ),
  ],
);
