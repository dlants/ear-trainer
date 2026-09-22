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

export const lavendersBlue: CorpusMelody = melody(
  "lavenders-blue",
  "Lavender's Blue",
  96,
  "traditional",
  "Traditional English folk song documented in seventeenth-century broadside form.",
  [
    phrase(
      [
        // The tune opens by arpeggiating 1 and 3, so I is already stated; the
        // harmony only holds a single bass root underneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // Still I: the melody's 5 and 3 spell the chord themselves, so one held
        // root serves, and with the tune up at 3 and above the root can sound
        // in its own octave instead of down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 4 and 2 leave V open, so the harmony supplies the
        // leading tone on the first half and then thins to the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The held 1 in the tune resolves the midpoint cadence, and the melody
        // reaching its own root forces the bass into the octave below. That
        // octave is a full sound already, and the song continues, so this
        // interior arrival takes nothing more.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The second strain climbs through 3 and 5, spelling I on its own, so
        // the bass again just holds the root, back up in the melody's octave
        // now that the line has left the bottom of it.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6–5 sits above IV without naming it, so the harmony
        // thickens to root and third at the turn, then drops to a lone root as
        // the phrase returns to I.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The tune sings the leading tone itself on the last beat, leaning
        // home, so doubling it would say nothing the melody has not: a bare
        // dominant root holds the bar, and the earlier V has already spelled
        // the leading tone out.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The closing 1 is held in the tune. This is the ending rather than a
        // way station, so the chordal third joins the root to close; a fifth
        // would only thicken what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all point home.",
      "independent",
    ),
  ],
);
