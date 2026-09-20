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
        // The melody holds upper 1; a single root under it is already an octave
        // and needs nothing more.
        polyBar(
          [
            voiceOf("melody", ev(w, [1, 1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The ascent repeats and still spells I on its own, so the bass holds
        // its single root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // Upper 1 again over a lone root: the octave is a full enough sound at
        // the arrival.
        polyBar(
          [
            voiceOf("melody", ev(w, [1, 1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
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
        // I is stated by the melody's 3 and 5, so a bare root serves; the move
        // to IV is the turn, and the melody's 4 is the root there, so the
        // chordal third is what names the chord.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [5]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The melody supplies 3 then 1, so the closing bar adds the fifth for a
        // settled, open final sound rather than a third the tune already gave.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
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
