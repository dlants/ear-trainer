import type { CorpusMelody } from "../../music/melody.ts";
import {
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

export const pollyPutTheKettleOn: CorpusMelody = melody(
  "polly-put-the-kettle-on",
  "Polly Put the Kettle On",
  112,
  "traditional",
  "Traditional English nursery tune, printed in the late eighteenth century.",
  [
    phrase(
      [
        // The tune drops 5 to a repeated 3, which spells I on its own, so the
        // bass just holds a single root beneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The first turn to V, with the melody resting on 2: the leading tone
        // sounds where the chord changes, then the root alone holds it.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody climbs 1-2-3-4 through both chords, so I takes a bare
        // root and the leading tone marks the arrival on V.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune holds 5, which I and V share, but the phrase has just
        // cadenced on V; the sustained root underneath names the chord as I.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The opening returns with the same repeated 3 stating I, and the same
        // single root under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The answering V again, voiced as before so the thicker bass reads as
        // the turn of harmony rather than as a marker of the phrase end.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody falls to lower 7 over V; the harmony adds 2 above the
        // root instead of doubling that leading tone, leaving the tune's own
        // pull to 1 exposed.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [2, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds 1 for the close; the fifth joins the root so the
        // final bar sounds settled.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The latter half reaches 1 and closes with lower 7 resolving to a full-measure tonic.",
      "independent",
    ),
  ],
);
