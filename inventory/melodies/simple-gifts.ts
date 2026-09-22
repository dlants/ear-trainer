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

export const simpleGifts: CorpusMelody = melody(
  "simple-gifts",
  "Simple Gifts",
  104,
  "public-domain",
  "Joseph Brackett's Shaker dance song, composed in 1848.",
  [
    phrase(
      [
        // The tune opens by stating 1 itself, so a single held low root is all
        // the harmony needs; it also sets the step-wise bass this tune keeps.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [4]), ev(q, [4])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The first turn away from home: the melody climbs 4–5–6 without
        // fixing the chord, so the harmony spends its extra note here and
        // sounds the third of IV before settling back to the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(h, [6])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [4, -1])),
          ],
          [region(w, 4)],
        ),
        // The descent 6–5–4–3 passes through both chords, so single roots are
        // enough: IV is already established and the melody's 3 states I.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone sounds under it;
        // the arrival needs no more than the root, since the tune states 1
        // itself and the octave below it is already a full sound.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The rising 1–3–4–5 outlines the tonic on its own, so the bass simply
        // holds its root underneath.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // IV has been heard twice already, so a lone root carries it; the
        // return to I comes back up into the melody's own octave rather than
        // repeating the low root of the earlier descent, since the tune has
        // settled on 3 and no longer forces the bass down.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody sings the leading tone itself on the last beat, so
        // doubling it would add nothing; a bare dominant root holds the bar,
        // and the phrase has already spelled V out at the midpoint.
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
        // The tune lands on a long 1. This is the ending rather than a way
        // station, so the chordal third joins the root to close; the fifth
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
      "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all establish home.",
      "independent",
    ),
  ],
);
