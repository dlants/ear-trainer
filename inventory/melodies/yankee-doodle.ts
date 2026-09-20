import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
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

export const yankeeDoodle: CorpusMelody = melody(
  "yankee-doodle",
  "Yankee Doodle",
  116,
  "traditional",
  "Traditional Anglo-American tune widely printed during the eighteenth century.",
  [
    phrase(
      [
        // The melody climbs 1-1-2-3, spelling I well enough that the bass only
        // plants the root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // I is plain from the melody's 1 and 3, so a lone root holds it; the
        // half cadence on the melody's 2 leaves V open, so the leading tone
        // sounds where the harmony turns.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The same ascent returns; the bass again supplies only the root the
        // melody does not state below itself.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's lower 7 is the leading tone itself, so V is named in the
        // tune; the harmony doubles it and closes with root and fifth under the
        // arrival on 1.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [7, -1]), ev(q, [1])),
            voiceOf(
              "harmony",
              ev(h, [1, -1]),
              ev(q, [5, -1], [7, -1]),
              ev(q, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 1), region(q, 5), region(q, 1)],
        ),
      ],
      "independent",
      "Both sentences begin on 1 and the second resolves lower 7 back to 1.",
      "independent",
    ),
    phrase(
      [
        // The ascent opens the second phrase the same way, over its single
        // tonic root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 4 is the root of IV, so the chordal third is what names
        // the chord at the turn; the descent to 1 then only needs the tonic
        // root held under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(q, [4, -1], [6, -1]), ev(dh, [1, -1])),
          ],
          [region(q, 4), region(dh, 1)],
        ),
        // The melody sits on lower 7-5-6-7, all chord tones and the leading
        // tone of V, so a bare dominant root is support enough.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [7, -1]),
              ev(q, [5, -1]),
              ev(q, [6, -1]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune holds 1 alone, so the close adds the fifth for a full,
        // settled final sound.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The descending line reaches 1 and the lower leading-tone ascent closes on a long tonic.",
      "independent",
    ),
  ],
);
