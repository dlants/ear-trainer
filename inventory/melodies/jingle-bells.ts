import type { CorpusMelody } from "../../music/melody.ts";
import {
  dq,
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

export const jingleBells: CorpusMelody = melody(
  "jingle-bells",
  "Jingle Bells",
  116,
  "public-domain",
  "James Lord Pierpont, ‘One Horse Open Sleigh’, 1857.",
  [
    phrase(
      [
        // The repeated 3 gives the listener only the chordal third, so the
        // harmony supplies the root it is a third above. The melody sits in its
        // own octave, so the root sounds there too rather than down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The bar repeats note for note and nothing has turned, so the harmony
        // steps aside: the previous bar has already placed the root under this
        // 3, and restating it would only teach the pattern.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The melody climbs 3–5 and leaps to upper 1, arpeggiating I outright;
        // a single held root is all the support the climb wants.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [3]),
              ev(q, [5]),
              ev(dq, [1, 1]),
              ev(e, [2, 1]),
            ),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The half-phrase lands on upper 3 rather than on 1, so the melody's
        // arrival is the third of a chord it never names. Root and fifth sound
        // well beneath the high melody, filling the tonic out where the line
        // comes to rest.
        polyBar(
          [
            voiceOf("melody", ev(w, [3, 1])),
            voiceOf("harmony", ev(w, [1], [5])),
          ],
          [region(w, 1)],
        ),
      ],
      "context-required",
      "The refrain's first half leaps through upper 1 but ends on 3, so its cadence is not tonic.",
      "independent",
    ),
    phrase(
      [
        // The first move away from home, and the melody hammers a bare 4 that
        // on its own could belong to several chords. This is where the harmony
        // turns, so the third joins the root to name IV.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(dq, [4]), ev(e, [4])),
            voiceOf("harmony", ev(w, [4, -1], [6, -1])),
          ],
          [region(w, 4)],
        ),
        // The line falls back to a repeated 3, stating the tonic third itself,
        // so a lone root returns underneath — back up in the melody's octave
        // now that the subdominant has been heard.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [4]),
              ev(q, [3]),
              ev(q, [3]),
              ev(e, [3]),
              ev(e, [3]),
            ),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 3–2–2–3 hovers between I and V and never sings the
        // leading tone, so the harmony spends its extra note here: 7 over the
        // dominant root is what tells the ear the chord has changed.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
        // The cadence. The dominant has just been spelled out, so its root
        // alone carries the held 2; the tune then ends on 5 instead of 1, and
        // root and third underneath supply the tonic it declines to state.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1], [3])),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "context-required",
      "This answer emphasizes 4, 3, 2, and 5 without a natural tonic arrival.",
      "independent",
    ),
  ],
);
