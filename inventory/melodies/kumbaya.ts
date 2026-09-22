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

export const kumbaya: CorpusMelody = melody(
  "kumbaya",
  "Kumbaya",
  76,
  "traditional",
  "Traditional African American spiritual and camp song, documented in early twentieth-century field recordings.",
  [
    phrase(
      [
        // The tune opens 1 to 3, spelling I itself; this is a slow spiritual,
        // so a single bass root, an octave under the melody's own 1, is all
        // the support it wants.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody parks on 5, which belongs to I and V alike, so the
        // harmony names the chord for it: root plus the chordal third, still
        // well under the held 5.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The harmony turns to IV while the melody's 6-5 stays common to both
        // chords, so root and third make the turn audible; the return to I
        // needs only its root.
        polyBar(
          [
            voiceOf("melody", ev(h, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody holds 3, the chordal third, and never drops below it, so
        // a lone root up in the melody's own octave completes I and keeps the
        // bass out of the mud.
        polyBar(
          [voiceOf("melody", ev(w, [3])), voiceOf("harmony", ev(w, [1]))],
          [region(w, 1)],
        ),
        // The second statement restates 1 to 3 over I. The key is long since
        // established and the tune spells the chord itself, so the harmony
        // steps aside rather than repeating the opening bar.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV, bare this time: the melody sings 4 as the root
        // and the earlier IV has already been spelled out, so a single root
        // suffices, and the arrival on 3 takes the plain tonic root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The whole bar is V and the melody leans onto the leading tone
        // itself, so doubling it would add nothing: a sustained dominant root
        // carries the bar.
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
        // The melody holds 1 alone at the ending, so the chordal third joins
        // the root to close the chord rather than a fifth that would only
        // thicken what the tune already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The second statement begins on 1 and the final lower-7-to-1 motion gives a clear cadence.",
      "independent",
    ),
  ],
);
