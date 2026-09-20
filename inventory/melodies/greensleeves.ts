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

/**
 * A modal minor support: a single bass root while the harmony just holds on i,
 * thickened to a dyad where the tune turns to III, VII and the v–i cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1, "minor")],
  );

export const greensleeves: CorpusMelody = melody(
  "greensleeves",
  "Greensleeves",
  76,
  "public-domain",
  "English Renaissance ballad tune, registered in 1580.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        tonicBar(ev(q, [2]), ev(q, [3]), ev(q, [4])),
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [3, -1], [5, -1]), ev(q, [5, -1], [2])),
          ],
          [region(h, 3), region(q, 5, "minor")],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(h, [7, -1], [2]), ev(q, [5, -1])),
          ],
          [region(h, 7), region(q, 5, "minor")],
        ),
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        tonicBar(ev(q, [2]), ev(q, [3]), ev(q, [2])),
        polyBar3(
          [
            voiceOf("melody", ev(q, [7, -1]), ev(q, [6, -1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(h, [7, -1]), ev(q, [5, -1], [2])),
          ],
          [region(h, 7), region(q, 5, "minor")],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
      ],
      "context-required",
      "The minor-mode tune frames 1 with lower 7 and 6; its tonic is clear in context but conservative practice should defer it.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
