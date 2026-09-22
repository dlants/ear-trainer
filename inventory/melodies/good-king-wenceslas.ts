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

export const goodKingWenceslas: CorpusMelody = melody(
  "good-king-wenceslas",
  "Good King Wenceslas",
  108,
  "public-domain",
  "Traditional spring carol melody ‘Tempus adest floridum’, printed in 1582.",
  [
    phrase(
      [
        // The tune hammers 1 but never touches its third, so the opening
        // supplies the quality: root and third at the downbeat, thinning to
        // the root once the key is placed.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The held 5 is shared between I and V, but the key has just been
        // spelled out, so a bass stepping 1 to 5 is enough to mark the turn.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody's 3 holds I by itself, so the first half takes a lone
        // root; IV is the first move away from home and the melody's 4 is only
        // its root, so the third sounds there to name the chord.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The melody's 2 and 1 hang over V without naming it, so the half
        // cadence gets the leading tone as the chord arrives and settles to a
        // bare root while the dominant holds.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune spells I outright with 5 and 3, so one root is all it
        // needs, and with the line up at 3 the bass comes back into the
        // melody's own octave rather than staying in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // Both chords turn in this bar. The melody's repeated 4 is only IV's
        // root, so the third joins it there; V then takes a plain root, since
        // the leading tone has already been heard at the half cadence and is
        // being saved for the close.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The melody arpeggiates I and then sings the leading tone itself on
        // the last beat, leaning home, so plain roots carry the approach to
        // the cadence.
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
        // The tune holds 1 alone, so the ending adds the third rather than the
        // fifth: it closes the quality of the key the opening bar announced,
        // where a root-fifth would only drone.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the final lower-7-to-1 cadence strongly establish home.",
      "independent",
    ),
  ],
);
