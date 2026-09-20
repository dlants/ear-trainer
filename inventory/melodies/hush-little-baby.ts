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
 * A lullaby-thin left hand: a single held root under the tonic bars, widened to
 * a dyad only where the harmony turns to IV and at the V–I cadences.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const dominantTurnBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1], [5, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );

export const hushLittleBaby: CorpusMelody = melody(
  "hush-little-baby",
  "Hush, Little Baby",
  92,
  "traditional",
  "Traditional American lullaby in a widely sung folk form.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        dominantTurnBar(ev(q, [5]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
        cadenceBar(ev(h, [2]), ev(h, [1])),
        tonicBar(ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        cadenceBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The melody starts on 1, repeatedly descends to it, and finishes with two tonic events.",
      "independent",
    ),
  ],
);
