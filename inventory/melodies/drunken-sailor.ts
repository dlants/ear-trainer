import type { CorpusMelody } from "../../music/melody.ts";
import {
  e,
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

/**
 * The shanty rocks between i and VII, so the accompaniment is just a two-note
 * bass alternation: a single root under the tonic bars, thickened to a dyad
 * where the harmony turns to VII and at the closing cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1, "minor")],
  );
const subtonicTurnBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [7, -2], [2, -1]), ev(h, [7, -2])),
    ],
    [region(w, 7)],
  );
const callBar = () =>
  tonicBar(ev(q, [5]), ev(q, [5]), ev(e, [5]), ev(e, [6]), ev(q, [5]));
const answerBar = () => subtonicTurnBar(ev(q, [4]), ev(q, [2]), ev(h, [2]));

export const drunkenSailor: CorpusMelody = melody(
  "drunken-sailor",
  "What Shall We Do with a Drunken Sailor?",
  112,
  "traditional",
  "Traditional sea shanty documented in the nineteenth century.",
  [
    phrase(
      [
        callBar(),
        answerBar(),
        callBar(),
        answerBar(),
        tonicBar(ev(q, [1]), ev(q, [1]), ev(e, [1]), ev(e, [2]), ev(q, [3])),
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(h, [7, -1])),
            voiceOf("harmony", ev(h, [7, -2]), ev(h, [7, -2], [2, -1])),
          ],
          [region(w, 7)],
        ),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [6, -1]),
              ev(q, [5, -1]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [7, -2])),
          ],
          [region(w, 7)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1, "minor")],
        ),
      ],
      "context-required",
      "The modal minor-color strain emphasizes 5 and lower 7; its final 1 is clear only with the full context.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
