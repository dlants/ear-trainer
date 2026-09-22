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

export const rockAByeBaby: CorpusMelody = melody(
  "rock-a-bye-baby",
  "Rock-a-bye Baby",
  80,
  "traditional",
  "Traditional English-language lullaby tune, published in the nineteenth century.",
  [
    phrase(
      [
        // The melody arpeggiates 1-3-6 and states I for itself. It starts on 1
        // in its own octave, so the root sits below it; at the turn to IV the
        // melody's own 6 supplies the chordal third, and the bass only has to
        // step up a fourth to name the new root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [4, -1])),
          ],
          [region(h, 1), region(q, 4)],
        ),
        // The tune holds 5 then 3, spelling I on its own over a bar where the
        // harmony is not moving. One root is support enough, and because the
        // melody stays at 3 and above it can sound up in the melody's octave
        // instead of down in the mud.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 4 and 2 leave V open, so the harmony spends its extra
        // note there on the leading tone; when the tune sings lower 7 itself on
        // the last beat the harmony falls back to a bare root rather than
        // doubling it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune arrives on a long 1 in its own octave, so the octave below
        // is already a full sound. This is a way station rather than the
        // ending, so a plain root closes the half.
        polyBar3(
          [voiceOf("melody", ev(dh, [1])), voiceOf("harmony", ev(dh, [1, -1]))],
          [region(dh, 1)],
        ),
        // The rising arpeggio returns. The key is settled by now, so instead of
        // repeating the opening the tonic takes its chordal third under the
        // climb, and the move to IV stays a bare root the melody's 6 completes.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(q, [4, -1])),
          ],
          [region(h, 1), region(q, 4)],
        ),
        // The same held 5 and 3 over a static I, and this time the harmony
        // stands aside: the melody spells the chord, and the bar before it has
        // just placed the tonic root and third.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // Here the melody sings lower 7 in the middle of the bar, leaning home
        // on its own, so the dominant needs no more than a sustained root —
        // and voicing it thinner than the earlier V keeps thickness from being
        // the cue that V has arrived.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The closing 1. This is the ending rather than a way station, so the
        // chordal third joins the root to settle the lullaby; a fifth would
        // only thicken what the melody's 1 already says.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Both halves begin on 1 and cadence through lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
