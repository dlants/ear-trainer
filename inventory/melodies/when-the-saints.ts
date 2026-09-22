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

export const whenTheSaints: CorpusMelody = melody(
  "when-the-saints",
  "When the Saints Go Marching In",
  104,
  "traditional",
  "Traditional American gospel hymn, developed from nineteenth-century spiritual material.",
  [
    phrase(
      [
        // The ascent 1-3-4-5 spells the tonic triad itself, so the harmony only
        // has to plant the root underneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody holds upper 1 alone, which says nothing about quality, so
        // the harmony comes up into the melody's own octave with root and
        // third — high under the tune rather than down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(w, [1, 1])),
            voiceOf("harmony", ev(w, [1], [3])),
          ],
          [region(w, 1)],
        ),
        // The ascent comes back and still arpeggiates I by itself, and the
        // first bar has already planted the root, so the harmony stays silent
        // rather than restating it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // Upper 1 again, but the third has been sounded under it once already,
        // so a lone root in the melody's octave carries this arrival.
        polyBar(
          [voiceOf("melody", ev(w, [1, 1])), voiceOf("harmony", ev(w, [1]))],
          [region(w, 1)],
        ),
        // The tune circles 3 and 1 before leaving on 2, so I is plain in the
        // melody and one root sustains it.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's held 2 leaves V open, so the leading tone joins the root
        // where the harmony turns; the resolution to 1 needs only its root.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody's 3 and 5 spell I, so a bare root serves while the harmony
        // is holding; the turn to IV is where the second note is spent, and
        // since the tune's 4 only gives that chord its root, the third names
        // it. The line stays at 3 and above, so I sits in the melody's octave
        // and the bass steps down a fifth to IV rather than leaping.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [5]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The tune falls 3 to 1 and is sitting on the bare root at the moment
        // of arrival, so the third sounds underneath to close with the chord's
        // quality rather than a hollow fifth.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Each opening ascent begins on 1 and reaches upper 1, while both later cadences return to home.",
      "independent",
    ),
  ],
);
