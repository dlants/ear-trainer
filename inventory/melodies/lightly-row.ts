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
        // The held 5 is open between I and V, so root and chordal third sound
        // under it to set the key; once the tune falls to 3 and spells I
        // itself, the harmony steps aside. The melody never goes below 2 here,
        // so the root sits in its own octave rather than the muddy one below.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [1], [3]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // The melody's 3 holds I on its own, so a bare root carries the first
        // half; the turn to V, which 4–2 leaves open, gets root and leading
        // tone, since the dominant is about to sit still for a bar and a half.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [4]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // V holds rather than turning, and the previous bar has already sounded
        // the leading tone, so a single sustained root is context enough under
        // the melody's 2–1–2.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody rises 3–4–5 over I, giving the chord its third itself, so
        // the bass simply holds the root, back up in the melody's octave.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The opening returns, and this time the harmony leaves it alone: the
        // key is established and 5–3 states I by itself, so repeating the first
        // bar's root and third would only teach the voicing rather than the
        // tune.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The same turn to V, voiced bare this time. The phrase has sounded the
        // leading tone once already, and saving it for the cadence keeps a
        // thicker dominant from becoming the signal that V has arrived.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [4]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The cadence bar: the melody's 2 hangs over V, so the leading tone
        // sounds with the root there, and the resolution takes a plain root as
        // the tune states 1 and 3 itself.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody holds 1 in its own octave, so the octave below it is
        // already a full sound; the ending needs no fifth stacked on top.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The second half repeats the descent and ends with 2–1–3–1 tonic confirmation.",
      "independent",
    ),
  ],
);
