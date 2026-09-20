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

export const thisOldMan: CorpusMelody = melody(
  "this-old-man",
  "This Old Man",
  112,
  "traditional",
  "Traditional English-language nursery and counting song, collected in the nineteenth century.",
  [
    phrase(
      [
        // The melody's 5–3–5 outlines I, so the left hand holds a single bass
        // root for the measure.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The figure repeats, and so does the lone root: nothing in the harmony
        // has moved yet.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The first move to IV in the strain is where the harmony turns, so the
        // bass widens to root and third before settling back onto I.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody pauses on 4, the chordal root of IV, so single bass roots
        // carry both halves of the bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
      ],
      "context-required",
      "The opening strain avoids 1 and pauses on 4, so it does not independently establish tonic.",
      "context-required",
    ),
    phrase(
      [
        // Repeated 1s state the tonic outright; one held bass root supports them.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The strain's first turn to IV again takes the root-and-third dyad,
        // then returns to a lone tonic root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's own lower 7 sits over V; the harmony adds the leading
        // tone there to sharpen the approach to the cadence.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The long 1 closes the tune; a root-fifth under it gives the arrival
        // weight without adding a third.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated 1s and the final 2–lower-7–2–1 figure make the tonic arrival explicit.",
      "independent",
    ),
  ],
);
