import type { CorpusMelody } from "../../music/melody.ts";
import {
  e,
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

export const ohSusanna: CorpusMelody = melody(
  "oh-susanna",
  "Oh! Susanna",
  108,
  "public-domain",
  "Stephen Foster song, first published in 1848.",
  [
    phrase(
      [
        // The tune opens by spelling the tonic triad and reaching to 6, so the
        // key needs no help; the melody touches its own 1, which forces the
        // supporting root into the octave below, and one held note is plenty.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [1]),
              ev(e, [2]),
              ev(q, [3]),
              ev(q, [5]),
              ev(q, [6]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // 5 falling to 3 is the tonic triad again, stated by the melody alone,
        // so the harmony stays silent rather than restating a root the ear is
        // already holding from the opening bar.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The opening figure returns but bends down to 2, which is not a tonic
        // tone; the root comes back for the bar and the chordal third joins it
        // at that bend so 2 is heard leaning over a held I.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [1]),
              ev(e, [2]),
              ev(q, [3]),
              ev(q, [3]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody rests on 2, which belongs to both chords and decides
        // nothing, so the harmony spends its extra note at the turn: the
        // leading tone with the dominant root makes the half cadence audible.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The refrain climbs 3–5–6 and sits on 6, the one note that will not
        // say whether we are still on I. The melody has left the bottom of its
        // octave, so I takes a root up in the melody's own register, and the
        // turn to IV gets root and third beneath the repeated 6.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [6]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The line falls 5–3–1 and spells I on the way down, so the return home
        // needs only a root, back below the melody's own 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody sings the leading tone itself on the last beat, and the
        // half cadence already spelled this dominant out, so a bare sustained
        // root carries the bar; a thicker V here would only teach that thick
        // means dominant.
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
        // The tune holds 1 alone. This is the ending, so the chordal third
        // joins the root to close the song in colour; the fifth would only
        // thicken what the melody's 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The opening starts on 1, the refrain lands on 1, and the final leading-tone motion resolves home.",
      "independent",
    ),
  ],
);
