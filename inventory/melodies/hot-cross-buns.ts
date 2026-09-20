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
  96,
  "traditional",
  "Traditional English street cry and nursery tune, documented by the eighteenth century.",
  [
    phrase(
      [
        // The tune's 3-2 leaves both chords open, so a bare low root on each
        // half spells out the I-V motion without crowding the descent.
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
        // The arrival on a sustained 1 takes root and fifth so the ending
        // sounds settled rather than like another passing tonic bar.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Each descending 3–2–1 statement ends on a sustained tonic.",
      "independent",
    ),
    phrase(
      [
        // Four repeated 1s state the tonic outright, so one held low root is
        // all the support the bar needs.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // Repeated 2s say nothing about the chord on their own, so the bass
        // supplies the dominant root and its leading tone.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(w, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
        // The closing descent again gets the leading tone over the dominant
        // root to sharpen the approach to the cadence.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // Root and fifth under the final held 1 give the tune its ending.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Four repeated 1s precede the final 3–2–1 cadence.",
      "independent",
    ),
  ],
);
