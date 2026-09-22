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

export const itsyBitsySpider: CorpusMelody = melody(
  "itsy-bitsy-spider",
  "Itsy Bitsy Spider",
  108,
  "traditional",
  "Traditional English-language nursery song, published in early twentieth-century folk collections.",
  [
    phrase(
      [
        // The climb 1–2–3 arpeggiates I on its own, but the key still has to
        // be planted, so a single held root does it. The melody sits on 1, so
        // the root has to sound in the octave below it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [5, -1]),
              ev(e, [1]),
              ev(q, [1]),
              ev(e, [1]),
              ev(e, [2]),
              ev(q, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The answering 3–2–1 spells the same tonic and settles on its root,
        // so the harmony stands aside rather than restating what the previous
        // bar already placed.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The rise 2–3 keeps I going on a bare root; the turn to IV is where
        // the harmony spends its extra note, since the melody's repeated 4
        // gives only the chord's root and the third is what names it.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The melody's 3 states I by itself, and with the line up there the
        // root comes back into its own octave; the hanging 2 leaves V open, so
        // the leading tone joins the dominant root to make the half cadence
        // audible.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune arpeggiates 1–3–5 outright, so after the dominant all the
        // harmony owes the listener is the tonic root underneath, low because
        // the melody starts the bar on its own 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // IV has been spelled once already and the melody's 5–4 outlines it,
        // so a bare subdominant root carries the turn; the return home takes
        // root and third, so the tonic gets a full sound somewhere other than
        // the cadence.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // V holds for the whole bar and the melody sings the leading tone
        // itself on the last beat, so doubling it would add nothing; the
        // sustained dominant root is support enough.
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
        // The ending: the melody holds 1, so the chordal third closes with the
        // root, the fifth would only thicken the degree the tune is already
        // singing.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The tune begins around 1, returns through it, and ends with lower 7 resolving to 1.",
      "independent",
    ),
  ],
);
