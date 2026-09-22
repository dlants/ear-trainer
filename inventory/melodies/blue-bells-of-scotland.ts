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

export const blueBellsOfScotland: CorpusMelody = melody(
  "blue-bells-of-scotland",
  "The Blue Bells of Scotland",
  92,
  "traditional",
  "Traditional Scottish song tune popularized in late eighteenth-century print.",
  [
    phrase(
      [
        // The rising 5–1–3–5 figure spells I on its own, so a single bass root
        // holds under it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [5]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody holds 6 for half the bar, and a bare 4 beneath it already
        // spells IV root and third between the two parts; the bass then steps
        // down to the tonic root under the 5.
        polyBar(
          [
            voiceOf("melody", ev(h, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The tune turns around 3–1–2–3 within I; the lone root is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody rests on 1 in its own octave, so the octave below is a
        // full sound on its own. This is a half-way arrival rather than the
        // ending, so the third is saved for the last bar.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The upper neighbour 6 goes by in a single quarter, too fast for a
        // lone root to land, so this IV — unlike the held one earlier — gets
        // its third with the root before the tonic resumes.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf(
              "harmony",
              ev(h, [1, -1]),
              ev(q, [4, -1], [6, -1]),
              ev(q, [1, -1]),
            ),
          ],
          [region(h, 1), region(q, 4), region(q, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone joins the root on
        // the second half after a bare tonic root.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune sings the leading tone itself on the way into the close, so
        // the dominant needs no more than its root here; the previous bar has
        // already spelled V out.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The strain closes on a long 1. This is the ending, so the chordal
        // third joins the root; the fifth would only thicken what the melody's
        // own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The pickup reaches 1, the first half cadences there, and the complete strain closes again on tonic.",
      "independent",
    ),
  ],
);
