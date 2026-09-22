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

export const theFirstNoel: CorpusMelody = melody(
  "the-first-noel",
  "The First Noel",
  80,
  "traditional",
  "Traditional English carol, published in the early nineteenth century.",
  [
    phrase(
      [
        // The melody's 3–2–1 descent spells I by itself, so the waltz bass
        // only has to hold a single root under it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The held 2 says nothing about V on its own, and this is the tune's
        // first move away from home, so the leading tone joins the root there;
        // the beat-three return to I needs only its root.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1, -1])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The rising 4–5–6 sounds IV's own root and third, so a lone bass root
        // is support enough; it sits just under the melody's 4.
        polyBar3(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(dh, [4, -1])),
          ],
          [region(dh, 4)],
        ),
        // The tune sits on a long 5, the chordal root of V, so a lone held bass
        // root is enough support.
        polyBar3(
          [voiceOf("melody", ev(dh, [5])), voiceOf("harmony", ev(dh, [5, -1]))],
          [region(dh, 5)],
        ),
        // IV comes back with the descent 6–5–4. Rather than repeat the bare
        // root, the harmony takes root and third here, so the returning chord
        // is voiced by the music instead of by a pattern.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        // The held 3 states I on its own, so a bare root carries it, and the
        // late step to V takes a bare root too: the leading tone belongs to the
        // cadence, not to this passing turn.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The melody sings the leading tone itself on the last beat, leaning
        // home, so doubling it would add nothing; the bass simply steps 1 to 5
        // under the approach.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [5, -1])),
          ],
          [region(q, 1), region(h, 5)],
        ),
        // The long 1 closes the strain, and an ending wants more than a way
        // station: the chordal third joins the root, where a fifth would only
        // drone under the tonic the melody already holds.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The opening descends to 1 and the complete strain ends with another tonic arrival.",
      "independent",
    ),
  ],
);
