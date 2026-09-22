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

export const oldMacdonald: CorpusMelody = melody(
  "old-macdonald",
  "Old MacDonald Had a Farm",
  108,
  "traditional",
  "Traditional American cumulative song, documented in early twentieth-century collections from older oral forms.",
  [
    phrase(
      [
        // The tune hammers 1 and never touches 3, so nothing has told the
        // listener the mode yet; root and third open the strain, and the bass
        // thins to the bare root once the melody drops to 5 below.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [5, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's own 6 is already IV's chordal third, so doubling it
        // would add nothing; bare roots stepping 4-5 are what the tune cannot
        // supply for itself here.
        polyBar(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The melody has climbed back into its own octave, so the tonic root
        // comes up with it rather than staying in the mud. Its 3 states I
        // outright and the turn to V is only a passing one, so bare roots do.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The half cadence: the melody rises to 5, which V shares with I, so
        // the leading tone sounds here to mark the ending as open.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the 2–1 motion establish tonic before the refrain pickup.",
      "independent",
    ),
    phrase(
      [
        // The same hammered 1s, but the key is settled now and the melody is
        // stating it unaccompanied; the bass waits and enters only under the
        // fall to 5, where it sets up the step to IV.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [5, -1]),
            ),
            voiceOf("harmony", ev(h), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same 6-6-5 turn. IV is the one thing the melody cannot spell, so
        // its root sounds; V is left to the melody's own 5, the strain having
        // put a sounded dominant under this spot already.
        polyBar(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h)),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The 3-2 descent again, tonic root up in the melody's octave; this
        // time the dominant takes the leading tone, since the strain is about
        // to close and the pull home is the point.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds 1 alone for the close. The chordal third joins the
        // root to end in the major the opening bar promised; the fifth would
        // only thicken what the melody's 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The repeated tonic opening returns and the complete strain closes on a full-measure 1.",
      "independent",
    ),
  ],
);
