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
        // The pickup climbs to repeated 1s, which state the tonic outright, so
        // a single held root is all the waltz bass needs here.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 2-1-7 leaves V open, so the harmony adds the leading
        // tone beside the root to fix the dominant at its first appearance.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // IV arrives under the melody's lower 6, which is the chord's third,
        // so the harmony sounds root and third to make the turn plain before
        // stepping down to a bare dominant root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(q, [5, -1])),
          ],
          [region(h, 4), region(q, 5)],
        ),
        // The tune's 2-3-2 hovers without naming the chord, so the dominant
        // again takes root and leading tone.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody states 1 on the downbeat, so I takes a lone root; the
        // dominant that follows needs only its root, the leading tone having
        // been sounded already.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [7, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [5, -1])),
          ],
          [region(q, 1), region(h, 5)],
        ),
        // The melody's 3 is the chordal third of I, so a lone root underneath
        // completes the chord without thickening.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The approach to the final cadence turns to V once more, and the
        // leading tone in the bass supplies the pull into the last bar.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The final sustained 1 is stated by the tune; the root-fifth beneath
        // it closes the carol without adding a note the melody already gives.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
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
