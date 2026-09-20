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

/**
 * A plain I–V–I support: a single bass root under the tonic bars, thickened to
 * a dyad where the tune turns to V and at the final cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );

export const mary: CorpusMelody = melody(
  "mary",
  "Mary Had a Little Lamb",
  108,
  "public-domain",
  "American nursery song associated with Sarah Josepha Hale's 1830 poem and Lowell Mason's nineteenth-century tune.",
  [
    phrase(
      [
        tonicBar(ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
        tonicBar(ev(q, [3]), ev(q, [3]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [2]), ev(h, [2])),
        tonicBar(ev(q, [3]), ev(q, [5]), ev(h, [5])),
      ],
      "context-required",
      "The opening touches 1 only in passing and closes on 5, so the local tonic evidence is weak.",
      "context-required",
    ),
    phrase(
      [
        tonicBar(ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
        tonicBar(ev(q, [3]), ev(q, [3]), ev(q, [3]), ev(q, [3])),
        dominantBar(ev(q, [2]), ev(q, [2]), ev(q, [3]), ev(q, [2])),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The descent 3–2–1 is restated and the phrase resolves to a full-measure 1.",
      "independent",
    ),
  ],
);
