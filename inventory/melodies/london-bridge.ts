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
        // The descent 5–6–5–4–3 spells the top of the tonic triad itself, so
        // the harmony only names the root on the downbeat and then leaves the
        // line to finish the chord. The melody stays at 3 or above here, so the
        // root sits in the melody's own octave rather than the muddy one below.
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
            voiceOf("harmony", ev(h, [1]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // The melody's 4 and 2 leave V open, but this dominant is interior and
        // the tune turns straight back to I, so a bare root names it. The
        // leading tone is saved for the half close that ends the phrase.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [2])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody's 3 states the chordal third of I, so a lone root is
        // enough to place the chord.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(h, [4]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The half close ends on 5 with no tonic event anywhere in the phrase,
        // so the leading tone joins the root as the melody settles, making the
        // dominant unmistakable at the one place the phrase has to be heard.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [5])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [5, -1], [7, -1])),
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
        // The same descent returning, voiced thinner than the first time: the
        // key is established by now and the line names I on its own, so the
        // harmony stays out of it altogether.
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
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // This dominant leads to the final cadence rather than back to I, so
        // here the leading tone sounds first and the root holds the rest of the
        // bar — the reverse of the half close, and a pull into the ending.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune arpeggiates 5–3–1 into the cadence and supplies the whole
        // triad, so a single root is all that is wanted. The melody reaching 1
        // forces the bass into the octave below.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
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
