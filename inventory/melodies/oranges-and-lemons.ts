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

export const orangesAndLemons: CorpusMelody = melody(
  "oranges-and-lemons",
  "Oranges and Lemons",
  104,
  "traditional",
  "Traditional English singing-game tune associated with London church bells.",
  [
    phrase(
      [
        // The tune outlines the tonic triad itself, so a single bell-like root
        // under the whole bar is all the harmony it needs.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The first turn to IV: the melody arrives on 4, the chordal root, so
        // the sixth joins the bass to spell out the change of chord.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // Another bar of pure tonic arpeggio in the tune; the lone root holds
        // under it without adding anything the melody already says.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone sounds at the
        // cadence; the resolution then needs only the root.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // 5 and 3 together already sound I, so the bass simply holds its root
        // for the measure.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // A whole bar of V with the melody sitting on 2: the leading tone
        // enters where the chord turns, then the root alone carries the hold.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody states I on its own, then falls to lower 7; the harmony's
        // leading tone doubles that pull into the final cadence.
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
        // The melody holds 1 for the close; the fifth joins the root so the
        // last bell stroke rings full.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The opening and midpoint use 1, while the final lower-7-to-1 cadence confirms the tonic.",
      "independent",
    ),
  ],
);
