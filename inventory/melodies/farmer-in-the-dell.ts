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

export const farmerInTheDell: CorpusMelody = melody(
  "farmer-in-the-dell",
  "The Farmer in the Dell",
  108,
  "traditional",
  "Traditional German-American singing-game tune, widespread in the nineteenth century.",
  [
    phrase(
      [
        // The tune hammers 1 on its own, so the harmony adds nothing but a
        // single held root to place the register.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody rises 1-2-3 and spells I itself; the lone root keeps the
        // texture light where nothing is in doubt.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The line turns around 3-2-1-2 over unchanged harmony, so the bass
        // simply holds its root through the turn.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // A long 3 is the chordal third of I, so the root alone completes the
        // sound.
        polyBar(
          [voiceOf("melody", ev(w, [3])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // Here the harmony turns: the melody's 5 is open between I and V, so
        // the leading tone joins the dominant root to make the move audible.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // Coming back the other way, the melody's 3 states I on its own, so
        // both halves stand on bare roots.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody falls to lower 7, already the leading tone; the bass
        // doubles it against the dominant root on the downbeat and then thins
        // out to leave the pull to the cadence clear.
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
        // The tune lands on a bare long 1; root and fifth underneath give the
        // close its weight.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Six opening tonic attacks and a final lower-7-to-1 cadence give strong evidence for home.",
      "context-required",
    ),
  ],
);
