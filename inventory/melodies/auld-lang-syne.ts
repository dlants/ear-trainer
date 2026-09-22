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

export const auldLangSyne: CorpusMelody = melody(
  "auld-lang-syne",
  "Auld Lang Syne",
  88,
  "traditional",
  "Traditional Scots tune associated with Robert Burns's 1788 text.",
  [
    phrase(
      [
        // Repeated 1s tell the ear the tonic note but not yet the key, so the
        // opening bar sounds root and chordal third. The pickup dips to the
        // lower 5, so the harmony sits in the octave below the tune.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The 3-2-1 descent spells I by itself and nothing is turning, so the
        // bass thins out to a plain held root.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // A third tonic bar in a row: the melody circles 2-3-2-1 and holds the
        // key on its own, so the harmony drops out entirely and lets the turn
        // to V in the next bar be the first thing it says.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 and 5 are open between I and V, so the half cadence
        // sounds the leading tone before resting on the bare dominant root.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The descent 5-3-1 outlines the tonic triad itself; the bass root is
        // enough underneath.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The answering 3-2-1 states I again, voiced differently from its first
        // pass: the harmony waits and slides the root in under the held 1, so
        // the bass is already moving when the bar turns to IV.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody dips below the tonic and its lower 6 is the only hint of
        // IV, so the bass supplies the subdominant root under it; the harmony
        // then spends its extra note where the phrase actually turns, adding
        // the leading tone to V for the cadence.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [6, -1]),
              ev(q, [5, -1]),
              ev(q, [6, -1]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The long final 1. The melody states the root itself, so the harmony
        // closes with root and chordal third; the fifth would only thicken what
        // is already there.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The tune repeatedly returns to 1, and the closing lower-neighbor ascent settles on a long tonic.",
      "independent",
    ),
  ],
);
