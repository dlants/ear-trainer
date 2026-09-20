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

export const homeOnTheRange: CorpusMelody = melody(
  "home-on-the-range",
  "Home on the Range",
  84,
  "public-domain",
  "Daniel E. Kelley tune with Brewster Higley lyrics, published in the late nineteenth century.",
  [
    phrase(
      [
        // The tune climbs 1-2-3 and states the tonic itself, so one sustained
        // low root per bar is all the harmony this waltz needs to start.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The held 5 over 3 is open between I and V; the bass root holding
        // still is what keeps it tonic, so it stays a single note.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The harmony turns here and the melody's 2-1-6 says nothing about V,
        // so the leading tone joins the root to make the turn audible.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody holds 5 itself, doubling the chordal root, so the bass
        // thins back to a lone 5 while the harmony simply sits.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The second sentence restarts from 1 with the same bare tonic root;
        // the climbing tune carries the chord on its own.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // 5-6-5 is shared between I and IV, so the move to IV needs its own
        // evidence: root plus the chordal third.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        // The melody falls 3-2-7 into the cadence; the leading tone over the
        // dominant root sharpens the pull home.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune lands on a sustained 1; root and fifth underneath give the
        // arrival the weight of an ending rather than another passing tonic.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The range opens from 1 and the second sentence closes lower 7 to a sustained tonic.",
      "independent",
    ),
  ],
);
