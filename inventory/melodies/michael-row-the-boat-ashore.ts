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

export const michaelRowTheBoatAshore: CorpusMelody = melody(
  "michael-row-the-boat-ashore",
  "Michael, Row the Boat Ashore",
  88,
  "traditional",
  "Traditional African American spiritual first documented in the nineteenth-century Sea Islands.",
  [
    phrase(
      [
        // The tune climbs the tonic triad 1–3–5, so it states I itself and a
        // single held bass root is all the support it needs.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the chordal third of IV, but this is the first turn
        // away from home, so root and third together mark the change before the
        // bass steps back to 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody descends 5–3–2–1 over I; with the tonic already sung, one
        // root underneath is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's held 2 leaves V open, so the leading tone joins the
        // dominant root at the turn; the resolution is a way station rather
        // than the ending, so the sung 1 gets a plain root under it.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The opening returns note for note. The key is set and the melody
        // arpeggiates I by itself, so the harmony stands aside rather than
        // restating a root the tune is already spelling.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV and back, bare this time: the first half already
        // sounded IV with its third, and the melody's 6 supplies that third
        // here, so a root stepping 4–1 is context enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody circles 2–3–2 and sings the leading tone itself on the
        // last beat, so V is already leaning home; the harmony just holds its
        // root, which also has to stay below that low 7.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune arrives on a long 1. This is the ending, so the chordal
        // third joins the root to close it; a fifth would only thicken what the
        // melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Both halves start on 1 and descend to it, with a final lower-leading-tone resolution.",
      "independent",
    ),
  ],
);
