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

export const hotCrossBuns: CorpusMelody = melody(
  "hot-cross-buns",
  "Hot Cross Buns",
  112,
  "traditional",
  "Traditional English street cry and nursery tune, documented by the eighteenth century.",
  [
    phrase(
      [
        // The tune's 3–2 leaves both chords open, so a bare root on each half
        // spells out the I–V motion without crowding the descent. The melody
        // lives at the bottom of its octave throughout this tune, so the
        // harmony has no choice but the octave below it.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds 1, stating I itself; the root underneath simply
        // keeps the bass present rather than letting silence mark the tonic.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // Same descent, but this one leads to the close, so the leading tone
        // joins the dominant root where the pull home matters.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The same arrival again, and the bass again just holds its root; the
        // melody restating 1 is all the tonic anyone needs.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Each descending 3–2–1 statement ends on a sustained tonic.",
      "independent",
    ),
    phrase(
      [
        // Four repeated 1s state the tonic outright, and three tonic bars have
        // just gone by on a held root, so the harmony sits this one out rather
        // than sounding the same note a fourth time.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // Repeated 2s say nothing about the chord, and nothing moves within the
        // bar to be heard either, so the leading tone names the dominant on the
        // downbeat and the root holds the rest.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The closing descent takes bare roots on both halves: the bar before
        // has just spelled the dominant out, so the turn is audible without
        // the leading tone, and the tune's last V is not obliged to be its
        // thickest.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The final 1. The melody arrives on its own root after a bare V, which
        // is plenty to hear I, and the third would have to sound down in the
        // octave below to stay under the tune — muddy, for a chord nobody is
        // going to mistake.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Four repeated 1s precede the final 3–2–1 cadence.",
      "independent",
    ),
  ],
);
