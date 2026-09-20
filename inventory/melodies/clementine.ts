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
        // The pickup repeats lower 5, which is open between I and V, so the
        // waltz bass states the tonic root and lets the key settle.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(q, [5, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune's 1 and 3 spell I on their own, so a single held root under
        // them is enough.
        polyBar3(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // Still I, closing on 1 in the melody; the bass simply holds its root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody holds lower 5 alone, which does not pin V down, so the
        // harmony adds the leading tone at the turn.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -2], [7, -2])),
          ],
          [region(dh, 5)],
        ),
        // V is now established, so the repeated lower 5s sit over a bare
        // dominant root while the harmony holds.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(q, [5, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -2])),
          ],
          [region(dh, 5)],
        ),
        // The return to I over the same single root as the opening bars.
        polyBar3(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The cadence turns inside the bar: the leading tone sounds over V,
        // then the bass steps up to the tonic root on the last beat.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -2], [7, -2]), ev(q, [1, -1])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The long 1 closes the tune, and the bass widens to a root-fifth dyad
        // to give the ending weight.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
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
