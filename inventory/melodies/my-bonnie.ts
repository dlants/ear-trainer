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

export const myBonnie: CorpusMelody = melody(
  "my-bonnie",
  "My Bonnie Lies over the Ocean",
  88,
  "traditional",
  "Traditional Scottish song, published in the nineteenth century.",
  [
    phrase(
      [
        // The pickup rises to 1, so one bass root per bar is all the waltz
        // accompaniment needs while the harmony holds.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune descends 3-2-1 through the tonic triad; a single bass root
        // supports it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The harmony turns to V on the last beat, so the bass leaves its root
        // and adds the leading tone to mark the turn.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The melody holds low 5, which is open between I and V, so the
        // leading tone sounds with the root to fix the dominant.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The pickup figure returns; the tonic root alone carries it again.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's rise to 6 turns the harmony to IV; the harmony moves
        // there after a beat of I and adds the third where the turn happens.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(q, 1), region(h, 4)],
        ),
        // The 5-3-2 descent leaves V open, so the leading tone joins the root
        // ahead of the cadence.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune lands on a held 1; a root-fifth dyad gives the close its
        // weight without adding a new pitch class.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The lower-5 pickup resolves to 1 twice and the strain ends with a complete 5–3–2–1 descent.",
      "independent",
    ),
  ],
);
