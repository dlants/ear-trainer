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
        // The tune climbs 1-2-3 and spells the tonic itself; the harmony only
        // has to place the key, so a single sustained root does it, sitting an
        // octave down because the melody starts on 1.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // 5 over 3 is open between I and V, but the harmony is holding rather
        // than turning, so the same root simply stays put and keeps it tonic.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The first turn of the tune, and 2-1-6 says nothing about V, so the
        // leading tone sounds with the root where the change happens and the
        // bar thins to the bare dominant once it has been heard.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody holds the dominant root itself, down in the lower octave;
        // anything the harmony could add would either double that note or sink
        // into the mud, so V is left to the tune for a bar.
        polyBar3(
          [voiceOf("melody", ev(dh, [5, -1])), voiceOf("harmony", ev(dh))],
          [region(dh, 5)],
        ),
        // The second sentence restarts the climb from 1. This is where the
        // harmony turns back to I after a silent bar, so the chordal third
        // joins the root on the downbeat before the root holds alone.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(q, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // 5-6-5 hands IV its own third in the melody, so the subdominant needs
        // nothing but its root; the bass steps 1-4 rather than leaping.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [4, -1])),
          ],
          [region(dh, 4)],
        ),
        // The melody falls 3-2-7 and sings the leading tone itself, so the
        // cadential dominant takes a plain root; the earlier V has already
        // spelled out what this chord is.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The close: the tune holds 1, so the third under it says far more
        // than a fifth would, and the root stays in the lowest slot.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
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
