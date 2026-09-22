import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  e,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const amazingGrace: CorpusMelody = melody(
  "amazing-grace",
  "Amazing Grace",
  84,
  "public-domain",
  "Words by John Newton with the early nineteenth-century American tune New Britain.",
  [
    phrase(
      [
        // The pickup's lower 5 rising to a held 1 already outlines the tonic;
        // the harmony stays out of the pickup and answers the arrival with root
        // and third, which is what fixes the key's quality at the outset.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(q), ev(h, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 3-1-3 spells I by itself, so a single sustained root is
        // all the support the bar needs while the line turns above it.
        polyBar3(
          [
            voiceOf("melody", ev(e, [3]), ev(e, [1]), ev(h, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The harmony turns to IV here, and the melody's 1 and lower 6 give
        // that chord its fifth and third already; the one thing missing is the
        // root, so the bass simply steps 1-4 and holds it bare.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [4, -1])),
          ],
          [region(q, 1), region(h, 4)],
        ),
        // The tune sings the dominant's own root on the downbeat, so the bass
        // just doubles it rather than crowding above the low melody note; the
        // half-way arrival on 1 then takes root and third for weight.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(q, [5, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(q, 5), region(h, 1)],
        ),
        // The same 3-1-3 comes back, and by now the key is long established and
        // the melody states I on its own, so the harmony drops out instead of
        // restating the root it played the first time.
        polyBar3(
          [
            voiceOf("melody", ev(e, [3]), ev(e, [1]), ev(h, [3])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // The held 2 leaves V open, so this is where the extra note goes: root
        // with the leading tone, resolving to a bare tonic root as the melody
        // passes through 3.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1, -1])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The dominant returns, but the melody's held 5 is its root, so a bare
        // bass root suffices and the leading tone is not repeated; the harmony
        // then clears out for the melody's 3 leaning into the close.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1]), ev(q)),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The final sustained 1. With the previous bar left thin, the ending
        // takes root and third below the melody's own tonic to settle the
        // chord's quality rather than merely thickening it with the fifth.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The lower-5 pickup repeatedly resolves to 1, and the strain closes on a sustained tonic.",
      "independent",
    ),
  ],
);
