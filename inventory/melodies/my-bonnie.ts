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
        // The pickup climbs lower 5 to 1 and spells the key itself; the
        // harmony plants one bass root under it, and the melody's own lower 5
        // is what forces that root into the octave below.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune descends 3-2-1 through the tonic triad, stating I on its
        // own, so the harmony steps aside rather than restating the root the
        // downbeat bar has already placed.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // The melody's 2-1 holds I, so a bare tonic root carries two beats; the
        // turn to V on the last beat takes only the dominant root, saving the
        // leading tone for the bar where the melody needs company.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The melody sits on lower 5 for the whole bar, which names the
        // dominant root but nothing else, so the harmony adds the leading tone
        // above it to give V its third.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The pickup figure returns after a bar of V, and the return to I is
        // the turn here, so this time the chordal third joins the root instead
        // of repeating the opening bar's lone bass note.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody rises 3-5-6, which leaves IV open; a beat of the tonic
        // root sets up the move, then root and third sound where the harmony
        // turns.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(q, 1), region(h, 4)],
        ),
        // The 5-3-2 descent stays inside V's upper reaches and never sounds the
        // leading tone, so the harmony supplies it with the dominant root to
        // lean into the cadence, then thins as the line settles onto 2.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The tune lands on a held 1. This is the ending, so the chordal third
        // closes it with the root; a fifth would only thicken what the melody's
        // own 1 already states.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
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
