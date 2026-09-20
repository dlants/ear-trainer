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
        // The upbeat 5 into repeated 1s states the tonic plainly, so one held
        // root is all the support the opening needs.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's lower 7 leans back to 1 by itself; the bass keeps its
        // single root rather than colouring the passing tone.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [7, -1]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The tune climbs 2-3-3-4 with nothing that pins down V, so the bass
        // sounds the leading tone with the dominant root before thinning.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The half cadence stalls on 2, which is open between I and V, so the
        // dominant half takes the leading tone to mark the arrival.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The answering strain descends 5-5-3-1 through the tonic triad, so a
        // lone root under it is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The line settles back on 1 over unchanged harmony; the held root
        // stays as it was.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody falls to lower 7, already the leading tone; the bass
        // doubles it on the downbeat where the dominant turns, then leaves the
        // root alone into the cadence.
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
        // A bare long 1 closes the tune, and root with fifth underneath gives
        // the final chord its weight.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
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
