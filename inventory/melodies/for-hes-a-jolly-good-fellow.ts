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

export const forHesAJollyGoodFellow: CorpusMelody = melody(
  "for-hes-a-jolly-good-fellow",
  "For He's a Jolly Good Fellow",
  108,
  "traditional",
  "Traditional celebratory song using the eighteenth-century French tune ‘Malbrouck s'en va-t-en guerre’.",
  [
    phrase(
      [
        // The upbeat 5 and repeated 1s give the listener the root and nothing
        // else, so the harmony supplies the chordal third to name the key as
        // major; the melody dips to lower 5, so the root sits in the octave
        // below it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's lower 7 leans back to 1 by itself, and the harmony is
        // holding rather than turning, so the bare root is support enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [7, -1]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The climb 2-3-3-4 has nothing that pins down V, and this is where the
        // harmony turns, so the leading tone joins the dominant root before the
        // bar thins back out.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody's 3 states I on its own; the half cadence stalls on 2,
        // which is open between I and V, but the leading tone has just sounded,
        // so a plain dominant root marks the arrival.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The answering strain descends 5-5-3-1 through the tonic triad, so the
        // lone root under it says everything that is missing.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same I held over again. The melody's 3 falling to 1 spells it
        // outright, so the root sounds only into the downbeat and then leaves
        // the tune alone rather than restating the previous bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // The melody sings the leading tone itself on the last beat, so
        // doubling it would add nothing: a bare dominant root carries the bar
        // into the cadence.
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
        // A bare long 1 closes the tune, so the ending is where the chordal
        // third belongs; the fifth would only thicken what the melody's own 1
        // already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The opening repeatedly returns to 1 and the final lower-7-to-1 motion closes decisively.",
      "independent",
    ),
  ],
);
