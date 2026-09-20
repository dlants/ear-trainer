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
        // The tune opens 1 to 3, stating I itself; this is a slow spiritual,
        // so a single held bass root is all the support it wants.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody sits on 5 over I, with 1 and 3 still in the ear from the
        // bar before, so the bass keeps to its root.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The harmony turns to IV, so the bass thickens to root and third
        // there and thins back to a lone root for the return to I.
        polyBar(
          [
            voiceOf("melody", ev(h, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody holds 3, the chordal third, so the held bass root
        // completes I without any extra voice.
        polyBar(
          [voiceOf("melody", ev(w, [3])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The second statement restates 1 to 3 over I, again needing only the
        // held bass root.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 5-4 is open, so IV takes root and third at the turn and
        // the arrival on 3 is supported by the bare tonic root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The whole bar is V and the melody leans on lower 7, so the leading
        // tone sounds first and the root alone carries the second half.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody holds 1 alone, so the closing chord fills out with root
        // and fifth under the cadence.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
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
