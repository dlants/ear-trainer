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
        // The repeated 1s and 3s spell I outright, so a single held root is
        // all the support the opening needs; the melody touching its own 1
        // forces that root into the octave below.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The tune's 2 and 5 belong to V but never say which chord it is, so
        // the harmony spends its extra note at the turn with the leading tone
        // and then holds the bare dominant root.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody's 3–1 states I by itself, so the first half takes a lone
        // root; the move to IV is the turn, and the tune's 4 is only that
        // chord's root, so the third joins it there.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The leading tone has already sounded over V once, so the dominant
        // takes a plain root here; the half-close on 1 gets the chordal third
        // instead, which keeps the thicker sound from marking V alone.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The second strain opens high on 5–5–3, which outlines I on its own,
        // and the melody has left the bottom of its octave, so the root comes
        // up beside it rather than staying in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // Both halves leave tonic, and the melody's 4 is only IV's root, so
        // the third sounds where the harmony turns away from home; V follows a
        // step below with its bare root, the dominant already being familiar.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The melody spells I with 1–3 and then sings the leading tone itself
        // on the last beat, so both halves need nothing beyond their roots.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The long 1 closes the game. This is the ending rather than a way
        // station, so the chordal third joins the root; the fifth would only
        // thicken what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
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
