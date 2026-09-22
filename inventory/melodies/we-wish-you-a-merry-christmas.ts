import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const weWishYouAMerryChristmas: CorpusMelody = melody(
  "we-wish-you-a-merry-christmas",
  "We Wish You a Merry Christmas",
  104,
  "traditional",
  "Traditional English carol from the West Country.",
  [
    phrase(
      [
        // The pickup and the repeated 1s give the listener the root but never
        // the third, so the opening bar supplies it beside the root to fix the
        // mode before anything else happens.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune's 2-1-7 already sings the fifth and third of V, so the
        // harmony only has to put the dominant root underneath them.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody's repeated lower 6 is IV's own third, so the new chord
        // needs just its root; the extra note goes to the turn back to V on
        // beat three, where the leading tone marks where the harmony moves.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [4, -1]), ev(q, [5, -1], [7, -1])),
          ],
          [region(h, 4), region(q, 5)],
        ),
        // V is holding rather than turning here, and the previous bar has just
        // sounded its leading tone, so the sustained root is context enough
        // under the melody's hovering 2-3-2.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // I takes a plain root on the downbeat, and then the melody's own
        // 7-lower-5 spells the dominant outright down where a bass note would
        // only crowd it, so the harmony steps aside for the rest of the bar.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [7, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h)),
          ],
          [region(q, 1), region(h, 5)],
        ),
        // The melody circles its 3, giving I the chordal third with the 4 as a
        // neighbor, so a single held root completes the chord.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The last dominant: the tune sings the leading tone itself between its
        // 2s, so doubling it would add nothing and the bare root carries the
        // approach to the cadence.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The carol ends on a sustained 1 in the melody's own octave, so the
        // third joins the root below to close on the chord's quality; the fifth
        // would only thicken what the tune already states.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The pickup reaches repeated 1s, and the final lower-7 neighbor figure resolves to sustained tonic.",
      "independent",
    ),
  ],
);
