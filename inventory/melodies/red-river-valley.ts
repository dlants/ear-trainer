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

export const redRiverValley: CorpusMelody = melody(
  "red-river-valley",
  "Red River Valley",
  84,
  "traditional",
  "Traditional North American cowboy song, documented in nineteenth-century manuscripts.",
  [
    phrase(
      [
        // The pickup climbs lower 5 to 3 through the tonic triad, so the tune
        // states I by itself; the melody dips to lower 5, so the single root
        // that plants the key has to sound in the octave below it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody falls 3-2-1, spelling the tonic triad outright over a
        // chord that is not turning, so the harmony stays out of the way
        // rather than restating the root it just sounded.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The scalar rise 2-3-4-5 says nothing about the chord on its own, and
        // this is the phrase's first turn away from I, so the extra note goes
        // here: the leading tone sounds with the dominant root.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
        // The return to I: a bare root carries the melody's 3, and the chordal
        // third joins it as the tune settles on 1, so the arrival is heard as
        // a cadence rather than a passing tonic.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The second strain turns to IV, and the melody's 5-5-6-5 fits I as
        // easily as IV, so the subdominant third sounds with the root to name
        // the new chord, then thins once it is established.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [4, -1])),
          ],
          [region(w, 4)],
        ),
        // The melody's 3 states I on its own, so the root comes back up into
        // the tune's octave under it; the following 2 leaves V open, and a
        // bare dominant root is enough now that the earlier V has been spelled
        // with its leading tone.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // V holds rather than turning, and the tune sings the leading tone
        // itself on the third beat, so doubling it would add nothing over the
        // sustained dominant root.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The whole-note 1 ends the tune. The melody holds its own root, so
        // the third below it closes the chord; a fifth would only thicken what
        // the melody already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The lower-5 pickup reaches 1, the first cadence returns there, and the full strain ends on tonic.",
      "independent",
    ),
  ],
);
