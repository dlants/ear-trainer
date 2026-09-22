import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const clementine: CorpusMelody = melody(
  "clementine",
  "Oh My Darling, Clementine",
  88,
  "public-domain",
  "Percy Montrose song, published in 1884, drawing on earlier American folk material.",
  [
    phrase(
      [
        // The three repeated lower 5s are open between I and V, so the waltz
        // bar plants root and chordal third to say major tonic before the tune
        // starts. The melody sits at lower 5, so the bass goes just below it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(q, [5, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune's 1 and 3 spell I on their own, so a bare root under them is
        // support enough, and it comes up into the melody's own octave now that
        // the line has left the bottom.
        polyBar3(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // Still I, and the melody's 3–3–1 states the chord outright, so the
        // harmony drops out rather than restating a root that is already heard.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // The harmony turns here and the melody's held lower 5 is common to I
        // and V, so this is where the extra note is spent: dominant root with
        // its leading tone, the only place the bass is forced this low.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -2], [7, -2])),
          ],
          [region(dh, 5)],
        ),
        // V is holding rather than turning, and the leading tone has just
        // sounded, so the repeated lower 5s need no more than a bare dominant
        // root underneath.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(q, [5, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -2])),
          ],
          [region(dh, 5)],
        ),
        // The return to I: the arrival gets root and third on the downbeat,
        // then thins to the root as the melody's own 1–3 takes the chord over.
        polyBar3(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [3])),
            voiceOf("harmony", ev(q, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The cadence turns inside the bar. The melody is up at 5 and 3 here,
        // so V can be voiced a fifth higher than before — root and leading tone
        // just under the tune — and the tonic root steps in on the last beat.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The long 1 ends the tune; the melody states the root itself, so the
        // close adds the chordal third under it rather than a fifth, which
        // would only thicken what is already sounding.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Repeated lower 5s resolve to 1 in both halves, and the final 5–3–1 outlines the tonic triad.",
      "independent",
    ),
  ],
);
