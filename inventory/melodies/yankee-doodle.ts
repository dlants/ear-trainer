import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
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

export const yankeeDoodle: CorpusMelody = melody(
  "yankee-doodle",
  "Yankee Doodle",
  116,
  "traditional",
  "Traditional Anglo-American tune widely printed during the eighteenth century.",
  [
    phrase(
      [
        // The tune opens unaccompanied on a bare 1-1-2-3 climb, so the key is
        // still being asserted: root and chordal third sound under it to fix I
        // before the phrase moves. The melody touches its own 1, so the root
        // has to sit in the octave below.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // I is plain from the melody's 1 and 3, so a lone root holds it; the
        // half cadence on the melody's 2 leaves V open, so the leading tone
        // sounds where the harmony turns.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The same ascent returns, and this time it needs nothing added: the
        // key is set and 1-2-3 states I by itself, so the harmony thins to the
        // bare root rather than restating the opening's third.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody sings the leading tone itself, naming V without help, and
        // it drops below the harmony's octave to do so, so the accompaniment
        // steps out of the way there rather than digging lower. The arrival
        // gets root and third; the fifth would only thicken the melody's 1.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [7, -1]), ev(q, [1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q), ev(q, [1, -1], [3, -1])),
          ],
          [region(h, 1), region(q, 5), region(q, 1)],
        ),
      ],
      "independent",
      "Both sentences begin on 1 and the second resolves lower 7 back to 1.",
      "independent",
    ),
    phrase(
      [
        // The ascent opens the second phrase over a plain tonic root, which
        // drops away once the melody reaches 3 and spells the chord on its
        // own; the harmony saves its weight for the turn to IV next bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // The melody's 4 is the root of IV, so the chordal third is what names
        // the chord at the turn; the descent to 1 then only needs the tonic
        // root held under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(q, [4, -1], [6, -1]), ev(dh, [1, -1])),
          ],
          [region(q, 4), region(dh, 1)],
        ),
        // The melody drops to lower 7-5-6-7, spelling the dominant's own tones
        // and leaning on its leading tone, so a single held root underneath is
        // support enough - anything lower would only muddy a line that is
        // already at the bottom of its range.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [7, -1]),
              ev(q, [5, -1]),
              ev(q, [6, -1]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune holds 1 alone after a full bar of V, so the close spells
        // the resolution with root and third; the fifth would only sound like
        // a drone under the melody's own 1.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The descending line reaches 1 and the lower leading-tone ascent closes on a long tonic.",
      "independent",
    ),
  ],
);
