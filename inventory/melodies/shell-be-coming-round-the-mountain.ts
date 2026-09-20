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

export const shellBeComingRoundTheMountain: CorpusMelody = melody(
  "shell-be-coming-round-the-mountain",
  "She'll Be Coming 'Round the Mountain",
  116,
  "traditional",
  "Traditional American folk song derived from the spiritual ‘When the Chariot Comes’.",
  [
    phrase(
      [
        // The pickup and the repeated 1s state the tonic outright, so a single
        // held bass root under the whole bar is all the harmony owes it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [5, -1]),
              ev(e, [6, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody sits on 3, the chordal third, so the bass keeps holding 1
        // rather than adding anything the tune already supplies.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone joins the bass root
        // there; the return to I needs only the bare root beneath the tune.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The tune holds 1 then drops to lower 5, which is ambiguous on its
        // own, so the half cadence gets root plus leading tone to name V.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody arpeggiates I as 1-1-3-5, so again one sustained bass root
        // is enough; thickening here would only pad a bar that is already clear.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 and 5 do not settle IV, so the turn away from tonic
        // takes root and third before the bass steps back to 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The line pushes through 2 to lower 7, so V sounds with its leading
        // tone at the turn and thins to the root as the cadence approaches.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The whole-note 1 lands home; a root-and-fifth dyad gives the ending
        // body without doubling the third the melody already holds.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated 1s establish home immediately and the ending resolves lower 7 to 1.",
      "independent",
    ),
  ],
);
