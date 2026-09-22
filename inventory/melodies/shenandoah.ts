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

export const shenandoah: CorpusMelody = melody(
  "shenandoah",
  "Shenandoah",
  72,
  "traditional",
  "Traditional American folk song and river shanty, documented in the nineteenth century.",
  [
    phrase(
      [
        // The opening 5 rising to 1 could belong to I or to V, so this is where
        // the key has to be stated: root and chordal third under the low 5,
        // which forces the harmony into the octave below.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's held 3 spells I by itself, so a bare root carries it;
        // the closing 2 leaves V open, and a plain dominant root names the turn
        // without spending the leading tone this early.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The rising 1-2-3 arpeggiates the tonic outright, and the key is
        // already set, so the harmony stays silent for a bar.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // A long 5 is open between I and V, so root and third pin the tonic
        // down; the melody sits high enough here that both fit directly under
        // it instead of down in the octave below.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5])),
            voiceOf("harmony", ev(dh, [1], [3])),
          ],
          [region(dh, 1)],
        ),
        // The tune's 6 is the third of IV, so the chord is already coloured and
        // a bare root names it; the step back to I keeps the bass moving by a
        // small interval, still up under the melody.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4]), ev(q, [1])),
          ],
          [region(h, 4), region(q, 1)],
        ),
        // The held 2 leaves the dominant open, and this is the phrase's real
        // turn home, so the leading tone sounds with the root before the bass
        // resolves to 1.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1, -1])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The melody sings the leading tone itself between its two 2s, so
        // doubling it would add nothing; a bare dominant root held across the
        // bar leaves the pull audible.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune holds 1 alone at the close, so the chordal third joins the
        // root to settle it; the fifth would only thicken what the melody
        // already states.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The pickup resolves to 1, the later descent reaches it, and the final 2–lower-7–2–1 motion settles home.",
      "independent",
    ),
  ],
);
