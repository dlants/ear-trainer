import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  dq,
  e,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const silentNight: CorpusMelody = melody(
  "silent-night",
  "Silent Night",
  72,
  "public-domain",
  "Franz Xaver Gruber carol melody, composed in 1818.",
  [
    phrase(
      [
        // The melody's 5-6-5 sits over I, so a single held root is all the
        // harmony supplies.
        polyBar3(
          [
            voiceOf("melody", ev(dq, [5]), ev(e, [6]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune rests on 3, the chordal third, so the root beneath it
        // completes I without thickening.
        polyBar3(
          [voiceOf("melody", ev(dh, [3])), voiceOf("harmony", ev(dh, [1, -1]))],
          [region(dh, 1)],
        ),
        // The opening figure returns over the same held tonic root.
        polyBar3(
          [
            voiceOf("melody", ev(dq, [5]), ev(e, [6]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The resting 3 again takes a bare root under it.
        polyBar3(
          [voiceOf("melody", ev(dh, [3])), voiceOf("harmony", ev(dh, [1, -1]))],
          [region(dh, 1)],
        ),
        // The melody's 2 leaves V open, and this is the first turn away from
        // I, so the leading tone joins the root to name the chord.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune sings the leading tone itself, so a bare 5 underneath is
        // enough to hold V.
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody states 1, so the harmony just doubles the root below it.
        polyBar3(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // A long lower 5 is open between I and V; the held tonic root fixes it
        // as I.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune holds 4, the chordal root, so the harmony adds the third to
        // make the move to IV audible.
        polyBar3(
          [
            voiceOf("melody", ev(h, [4]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        // The melody's high 1 falls to 7; root and leading tone underneath
        // point the cadence back home.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1, 1]), ev(h, [7])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The 6-5-3 descent spells I on its own, so one held root suffices.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The closing long 1 gets root and fifth so the final tonic sounds
        // settled.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The later phrase states 1 in two registers and descends 6–5–3–1 to a long tonic.",
      "independent",
    ),
  ],
);
