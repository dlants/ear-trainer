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
        // The melody arpeggiates 1-3-6, so I needs only a held bass root; the
        // dyad arrives at the turn to IV, where the harmony actually moves.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(q, 4)],
        ),
        // The tune holds 5 then 3 over an unchanging I, so a single sustained
        // bass root is all the support the bar needs.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 4 and 2 leave V open, so the leading tone sounds with
        // the root before the bass settles back to a bare 5.
        polyBar3(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune arrives on a long 1; a root-and-fifth dyad gives the
        // cadence its weight without adding a new pitch class.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
        // The second half restates the rising arpeggio, voiced as before so the
        // turn to IV stays the place where the harmony thickens.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(q, 4)],
        ),
        // Again the melody holds over a static I, so one sustained bass root
        // carries the bar.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // This time the melody sounds lower 7 itself, but the harmony keeps the
        // same root-plus-leading-tone voicing so the dominant is not marked out
        // by a change of texture.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The closing 1 is answered by the same root-and-fifth dyad, ending the
        // lullaby on its fullest sound.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
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
