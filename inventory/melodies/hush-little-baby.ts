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

export const hushLittleBaby: CorpusMelody = melody(
  "hush-little-baby",
  "Hush, Little Baby",
  92,
  "traditional",
  "Traditional American lullaby in a widely sung folk form.",
  [
    phrase(
      [
        // The tune arpeggiates 1-3-5 and states I outright, so the lullaby
        // left hand is a single held low root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 over IV is the chordal third, but the bar turns away
        // from home, so root and third widen it before the bass steps back to
        // 1 under the returning 3.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The descent 5-3-2-1 sits over I, then turns to V where the melody
        // gives no evidence; the leading tone supplies it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // A half-note 2 to 1 cadence: the leading tone pulls, and root with
        // fifth marks the arrival.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The second verse restarts on the same arpeggio, again needing only
        // the held tonic root beneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV and step home, voiced as before so the widening
        // stays a marker of the harmony moving rather than of the bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The closing 2-3-2-1 hovers around the dominant without stating it;
        // leading tone then root and fifth carry the cadence.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The final held 1 is already the chord; root and fifth beneath it end
        // the lullaby rather than leaving it open.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The melody starts on 1, repeatedly descends to it, and finishes with two tonic events.",
      "independent",
    ),
  ],
);
