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

export const baaBaaBlackSheep: CorpusMelody = melody(
  "baa-baa-black-sheep",
  "Baa, Baa, Black Sheep",
  96,
  "traditional",
  "Traditional English nursery rhyme sung to the eighteenth-century French melody also used by Twinkle.",
  [
    phrase(
      [
        // The tune states 1 itself, so the opening needs no bass; the held 5 is
        // open between I and V, so root and chordal third join there to settle
        // the key at the outset.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(h), ev(h, [1], [3])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the chordal third of IV, so a lone 4 supports it;
        // the return to I takes its root in the same register, keeping the bass
        // stepping rather than leaping.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The tune sits on 4, the root of IV, so its octave below is support
        // enough; letting silence fall only where the melody states the root
        // would make silence the clue. The melody's 3 then spells I, which
        // needs no more than a root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone sounds at the turn.
        // The tune arrives on 1 in its own octave, so the octave below is a
        // full sound for this interior cadence; the tune goes on afterwards.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody's 5 sits over a holding I, so a bare root carries it; the
        // move away from home to IV is where the extra note is spent, and the
        // chordal third says more there than the fifth would.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [4]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The melody's 3 states I on its own, and this interior V stands on a
        // bare root: the leading tone has been sounded once already, and saving
        // it for the close keeps a thicker dominant from marking V.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The opening bar returns, voiced differently: the key is long since
        // established and 1 and 5 spell I by themselves, so a single sustained
        // root is enough rather than the root-and-third of the first time.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The final cadence: the leading tone sounds under the melody's 2 to
        // sharpen the pull home, and the ending takes root and third, which
        // closes the tune more than a fifth stacked under the melody's own 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [3, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "independent",
      "The shared tune opens with repeated 1s and returns to 1 in both the first and final cadences.",
      "independent",
    ),
  ],
);
