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

export const auraLee: CorpusMelody = melody(
  "aura-lee",
  "Aura Lee",
  88,
  "public-domain",
  "George R. Poulton melody with W. W. Fosdick lyrics, published in 1861.",
  [
    phrase(
      [
        // The opening 1-3-5 arpeggiates the tonic triad itself, so a single
        // held root is support enough; the melody touches its own 1, so that
        // root has to sound in the octave below.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the chordal third of IV, but this is the first turn
        // away from home, so the extra note goes there: root and third under
        // the turn, then a bare tonic root, which can come back up into the
        // melody's own octave now that the line sits on 3.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody circles 2-3-4-2 and never states V, so the leading tone
        // sounds where the harmony turns and the dominant root holds the rest.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The long 1 arrives. The tune states the tonic itself and the octave
        // below it is already a full sound; the song goes on afterwards, so
        // this interior arrival wants nothing stacked on top.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The rise 3-5-1 spells the tonic again. The line stays at 3 and above,
        // so the same bare root sits up in the melody's octave this time rather
        // than repeating the opening bar's low one.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(h, [1, 1])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody sings the leading tone itself over V, so doubling it would
        // add nothing; the extra note waits for the turn back to I, where the
        // chordal third joins the root under the held 5.
        polyBar(
          [
            voiceOf("melody", ev(q, [7]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1], [3])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The same dominant bar comes back, and the tune dips to the lower 7 on
        // its own, leaning home; a single sustained dominant root is context
        // enough after the leading tone has already been sounded once.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The final long 1. This is the ending rather than a way station, so
        // the chordal third joins the root to close, which also keeps the last
        // bar from repeating the midpoint cadence note for note.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The melody begins on 1, cadences there at midpoint, and closes again on a sustained tonic.",
      "independent",
    ),
  ],
);
