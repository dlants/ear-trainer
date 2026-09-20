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

export const twinkle: CorpusMelody = melody(
  "twinkle",
  "Twinkle, Twinkle, Little Star",
  96,
  "public-domain",
  "Traditional French melody published as ‘Ah! vous dirai-je, maman’ in the eighteenth century.",
  [
    phrase(
      [
        // The tune states 1 itself, so the first half needs no bass. The held 5
        // is open between I and V, so the chordal third joins the root to
        // settle the key at the outset.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(h), ev(h, [1], [3])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the chordal third of IV, so a lone 4 is enough to support.
        // The return to I lands on 1 in the same register, keeping the bass
        // stepping rather than leaping.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // Here the tune sits on 4, the chordal root, so strictly it needs no
        // support. We sound the 4 an octave down anyway: dropping to nothing
        // right after the fuller bars was awkward, and a silence that only ever
        // fell on a melody-root bar would itself be a clue. One note is enough,
        // since the octave with the melody is already a full sound. The same
        // reasoning applies wherever the melody holds 1 under I: support it
        // rather than letting silence become the marker for a chord.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone sounds here, where
        // the pull to the cadence matters most. The resolution needs no bass at
        // all; the tune arriving on 1 says it.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h)),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "independent",
      "The phrase begins and cadences on 1, with repeated 1s and no altered tones.",
      "independent",
    ),
    phrase(
      [
        // The same open 5 as the opening bar gets the same root-and-third
        // treatment, so a thicker voicing is not a tell for V. Then IV takes
        // its single low root under the melody's 4.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [4]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1], [3]), ev(h, [4, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The melody's 3 states I on its own. This interior V stands on a bare
        // root: the outer phrases have already sounded the leading tone, and
        // that is context enough here.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [4]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1], [3]), ev(h, [4, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
      ],
      "context-required",
      "The repeated dominant-led middle strain ends on 2 and relies on the surrounding tonic phrases.",
      "independent",
    ),
    // The closing phrase repeats the opening one note for note, voicing and all.
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(h), ev(h, [1], [3])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h)),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "independent",
      "The returning phrase states 1 at the opening and closes decisively on a long 1.",
      "independent",
    ),
  ],
);
