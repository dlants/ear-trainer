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

export const ringAroundTheRosie: CorpusMelody = melody(
  "ring-around-the-rosie",
  "Ring Around the Rosie",
  108,
  "traditional",
  "Traditional English-language singing game in a common American melodic form.",
  [
    phrase(
      [
        // The repeated 1s and 3s spell I outright, so a single held bass root
        // is all the support the opening needs.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 and 5 leave V open, so the leading tone sounds at the
        // turn and then drops away to a bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The first half states I in the tune, so the bass holds its root; the
        // move to IV is the turn, and the melody's 4 is only the chordal root,
        // so the third joins it there.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // Melody 2 leaves the dominant open, so the leading tone carries the
        // pull; the resolution to 1 is stated by the tune and needs one root.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The tune's 5 and 3 outline I, so the second strain opens on a single
        // held root, matching the first strain's opening.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // Both halves turn away from tonic and the melody's 4 and 2 are bare
        // chordal roots, so each gets root and third underneath.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf(
              "harmony",
              ev(h, [4, -1], [6, -1]),
              ev(h, [5, -1], [7, -1]),
            ),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The melody spells I in the first half, so a lone root serves; the
        // dominant that follows takes root and third to drive the cadence.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The long 1 closes the game; root and fifth beneath make the arrival
        // final.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the final lower-7-to-1 cadence clearly identify home.",
      "independent",
    ),
  ],
);
