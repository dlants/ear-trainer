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
        // The tune outlines the tonic triad itself, but nothing has set the key
        // yet, so the opening pairs root and chordal third before thinning to a
        // bare root as the melody falls back to 1 and forces the lower octave.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2-3 keeps holding I, so a lone root carries the first
        // half; the turn to IV is where the harmony spends its extra note, and
        // the sixth spells the new chord that the melody's arrival on 4 alone
        // would leave ambiguous.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The tune arpeggiates I outright, down through its own 1, so the
        // harmony holds nothing but the root beneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's bare 2 leaves V open, so the leading tone sounds where
        // the chord turns; the resolution then needs only the root, since 1 in
        // the tune states the tonic itself.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // 5 and 3 together already sound I, and the melody never drops below 3
        // here, so the root comes up into its own octave and holds alone rather
        // than muddying the restart from below.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // A whole bar of V with the melody sitting on 2: the leading tone
        // enters at the turn away from tonic, then the root alone carries the
        // hold, since V is standing still rather than moving.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody spells I with 1-3 and then sings the leading tone itself
        // on the way down, so doubling it would add nothing: the dominant takes
        // a plain root, already spelled out in the bar before.
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
        // The melody holds 1 for the close. This is the ending rather than a
        // way station, so the chordal third joins the root; the fifth would only
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
      "The opening and midpoint use 1, while the final lower-7-to-1 cadence confirms the tonic.",
      "independent",
    ),
  ],
);
