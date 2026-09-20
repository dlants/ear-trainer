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

export const londonBridge: CorpusMelody = melody(
  "london-bridge",
  "London Bridge Is Falling Down",
  112,
  "traditional",
  "Traditional English singing-game tune in a common nineteenth-century form.",
  [
    phrase(
      [
        // The tune descends 5–4–3 through the tonic triad, so it carries I on
        // its own; the harmony only holds a single root underneath.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5]),
              ev(e, [6]),
              ev(e, [5]),
              ev(q, [4]),
              ev(q, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 4 and 2 leave V open, so the harmony thickens to root
        // and leading tone here, where the harmony turns.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [2])),
            voiceOf("harmony", ev(w, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody's 3 states the chordal third of I, so a lone root is
        // enough to place the chord.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(h, [4]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The half close ends on 5 with no tonic event, so the leading tone
        // joins the root to make the dominant unmistakable.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
      ],
      "context-required",
      "The first half circles 5 and ends there, with no tonic event.",
      "context-required",
    ),
    phrase(
      [
        // As before: the melody spells the tonic triad, so one held root is all
        // the support it needs.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5]),
              ev(e, [6]),
              ev(e, [5]),
              ev(q, [4]),
              ev(q, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The dominant again takes root and leading tone, the phrase's turning
        // point.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [2])),
            voiceOf("harmony", ev(w, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune arpeggiates 5–3–1 into the cadence; the root–fifth dyad
        // under it lands the arrival without doubling the third the melody
        // already sang.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody rests, so the harmony alone sustains the tonic root to
        // carry the silence.
        polyBar(
          [voiceOf("melody", ev(w)), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The final 5–3–1 arpeggiation supplies a clear tonic cadence followed by silence.",
      "independent",
    ),
  ],
);
