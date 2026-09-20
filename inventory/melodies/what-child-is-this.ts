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
 * The Greensleeves tune is supported by a single sustained bass root while the
 * harmony holds on i, thickening to a dyad only where it turns away (III, VII,
 * VI) and at the v–i cadences.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1, "minor")],
  );
const mediantToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [3, -1], [5, -1]), ev(q, [5, -1], [2])),
    ],
    [region(h, 3), region(q, 5, "minor")],
  );
const subtonicToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [7, -1], [2]), ev(q, [5, -1])),
    ],
    [region(h, 7), region(q, 5, "minor")],
  );
const submediantCadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(q, [6, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(q, 6), region(h, 5, "minor")],
  );
const finalBar = () =>
  polyBar3(
    [
      voiceOf("melody", ev(dh, [1])),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1, "minor")],
  );

export const whatChildIsThis: CorpusMelody = melody(
  "what-child-is-this",
  "What Child Is This?",
  76,
  "public-domain",
  "William Chatterton Dix's carol sung to the sixteenth-century English tune Greensleeves.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        tonicBar(ev(q, [2]), ev(q, [3]), ev(q, [4])),
        mediantToDominantBar(ev(h, [3]), ev(q, [2])),
        subtonicToDominantBar(ev(h, [7, -1]), ev(q, [5, -1])),
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3])),
        tonicBar(ev(q, [2]), ev(q, [1]), ev(q, [7, -1])),
        submediantCadenceBar(ev(q, [6, -1]), ev(q, [7, -1]), ev(q, [2])),
        finalBar(),
      ],
      "context-required",
      "The minor-mode cadence reaches 1, but its lower-7 and lower-6 emphasis makes it a contextual example.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
