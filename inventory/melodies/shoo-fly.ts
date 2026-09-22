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

export const shooFly: CorpusMelody = melody(
  "shoo-fly",
  "Shoo, Fly, Don't Bother Me",
  112,
  "public-domain",
  "American popular and folk song first published in the 1860s.",
  [
    phrase(
      [
        // The tune arpeggiates I on its own, but nothing has set the key yet,
        // so the opening bar names it: root and chordal third below the
        // melody's own 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The 6 is a neighbor rather than a turn to IV, and the melody sits at
        // 5 and above, so a lone root up in its own octave holds I without
        // muddying the bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The descent 4-3-2-1 keeps spelling I, so the first half takes a bare
        // root; the turn to V is what the melody leaves open, and the leading
        // tone joins the dominant root there.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody's 2 hangs over V and then drops to the dominant root
        // itself, so the harmony sounds the leading tone under the 2 and then
        // steps aside rather than doubling the tune.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h)),
          ],
          [region(w, 5)],
        ),
        // The opening returns with the key already established and the tune
        // arpeggiating I outright, so nothing needs to sound beneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The neighbor bar again, voiced fuller this time: root and third in
        // the melody's own octave keep the 6 from sounding like a move to IV
        // as the phrase heads for its close.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1], [3])),
          ],
          [region(w, 1)],
        ),
        // The same descent, but the melody sings the leading tone itself on the
        // last beat, so the dominant needs no more than its root under it; the
        // earlier cadence has already spelled V out.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [4]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds a long 1 in its own octave. This is the ending, so
        // the chordal third joins the root below to close; the octave alone
        // would sound like another way station.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The melody starts on 1, descends through 1, and ends with lower 7 resolving to tonic.",
      "independent",
    ),
  ],
);
