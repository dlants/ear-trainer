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

export const lightlyRow: CorpusMelody = melody(
  "lightly-row",
  "Lightly Row",
  104,
  "traditional",
  "Traditional German children's tune ‘Hänschen klein’ in its common teaching-song form.",
  [
    phrase(
      [
        // The tune opens on 5 falling to 3, which spells I between them, so a
        // single held bass root is all the harmony needs to supply.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The bar turns to V on 4–2, which the melody leaves open, so the
        // harmony holds a lone root through I and widens to root plus leading
        // tone where the turn happens.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [4]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // V holds here rather than turning, and the previous bar has already
        // sounded the leading tone, so a single sustained root is context
        // enough under the melody's 2–1–2.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody rises 3–4–5 over I, giving the chord its third itself, so
        // the bass simply holds the root.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The opening returns unchanged: 5 down to 3 states I, and the held
        // root supports it.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same turn to V as before, voiced the same way: bare root under I,
        // root and leading tone where the harmony moves.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [4]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The cadence bar: the melody's 2 hangs over V, so the leading tone
        // sounds with the root there, and the resolution to I takes a plain
        // root as the tune states 1 and 3 itself.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The held 1 closes the tune; the root-fifth dyad gives the ending its
        // weight without stacking a third on top.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The second half repeats the descent and ends with 2–1–3–1 tonic confirmation.",
      "independent",
    ),
  ],
);
