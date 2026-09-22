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

export const singASongOfSixpence: CorpusMelody = melody(
  "sing-a-song-of-sixpence",
  "Sing a Song of Sixpence",
  112,
  "traditional",
  "Traditional English nursery song documented in eighteenth-century print.",
  [
    phrase(
      [
        // The melody's 5s and 3s spell the tonic triad, so the harmony only
        // has to plant the key: one held root, and since the tune never dips
        // below 3 it sits in the melody's own octave rather than the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The tune's 4 and 2 leave V open, so the extra note goes where the
        // harmony turns: the leading tone arrives with the root, then the root
        // holds alone once the dominant is established.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The scalewise 1–2–3–4 says nothing about where the chord changes,
        // and the melody's own 1 forces the bass down an octave; the turn to V
        // is the moving point, so it takes root and leading tone.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody rests on a long 5, open between I and V. The line is high
        // here, so root and chordal third fit under it in the melody's octave
        // and name the tonic outright — the fifth is already in the tune.
        polyBar(
          [voiceOf("melody", ev(w, [5])), voiceOf("harmony", ev(w, [1], [3]))],
          [region(w, 1)],
        ),
        // The tune outlines 5–3–1–3, stating I on its own; the bass only holds
        // its root, down an octave because the melody touches 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody sings the leading tone itself here, so doubling it would
        // add nothing; a bare dominant root under the whole bar is enough, and
        // it varies the earlier turn to V rather than restating it.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [7, -1])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody's 1 and 3 state the tonic, so I takes a plain root, and
        // the closing 2–lower-7 already leans home; a bare 5 marks the turn
        // and keeps the cadence from being announced by thickness.
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
        // The long final 1. This is the ending rather than a way station, so
        // the chordal third joins the root to close; the fifth would only
        // thicken what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The answer phrase repeatedly uses 1 and closes with lower 7–1 resolution.",
      "independent",
    ),
  ],
);
