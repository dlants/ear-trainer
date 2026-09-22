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

export const auClairDeLaLune: CorpusMelody = melody(
  "au-clair-de-la-lune",
  "Au clair de la lune",
  100,
  "traditional",
  "Traditional French song, printed in the eighteenth century.",
  [
    phrase(
      [
        // The tune hammers 1 and steps to 2, spelling the tonic outright, so a
        // single held root is support enough; the melody touches its own 1, so
        // that root sits in the octave below.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 3 states I on its own; the held 2 is open between I and
        // V, so the extra note is spent at the turn, where the leading tone
        // joins the dominant root.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The answering figure walks 1-3 and lands on 2 again. The tune spells
        // I by itself, so the harmony drops out there, and the dominant takes a
        // bare root: the leading tone sounded a bar ago and holding it back
        // keeps a thick V from becoming the cue.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The long 1 arrives, but the song goes on afterwards. The melody's own
        // 1 with the octave below it is already a full sound, so this interior
        // cadence wants nothing stacked on top.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // A whole bar of 2 tells the listener nothing about the chord, so the
        // harmony spells the dominant with its leading tone on the downbeat and
        // then holds the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody sits on 5, the fifth of I, which leaves the quality open
        // coming off V, so the return to tonic takes root and third before
        // thinning to the root once the chord is only holding.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The answering figure returns, this time heading for the close, so the
        // dominant gets its leading tone here where the first pass left it
        // bare; the melody's 1-3 still states I without help.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The final long 1. This is the ending rather than a way station, so
        // the chordal third joins the root to settle the quality; the fifth
        // would only thicken what the melody's 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s and two long tonic cadences make home unmistakable.",
      "independent",
    ),
  ],
);
