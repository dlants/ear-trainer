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
 * A slow, sustained accompaniment: mostly one held bass root per bar, widened
 * to a dyad where the tune first leans on IV and at the closing V–I, so the
 * long melody notes are never left to imply the chord alone.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1)],
  );
const tonicToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
    ],
    [region(h, 1), region(q, 5)],
  );
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(q, [1, -1])),
    ],
    [region(h, 4), region(q, 1)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1, -1])),
    ],
    [region(h, 5), region(q, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
    ],
    [region(dh, 5)],
  );

export const shenandoah: CorpusMelody = melody(
  "shenandoah",
  "Shenandoah",
  72,
  "traditional",
  "Traditional American folk song and river shanty, documented in the nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        tonicToDominantBar(ev(h, [3]), ev(q, [2])),
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3])),
        tonicBar(ev(dh, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(q, [3])),
        cadenceBar(ev(h, [2]), ev(q, [1])),
        dominantBar(ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        tonicBar(ev(dh, [1])),
      ],
      "independent",
      "The pickup resolves to 1, the later descent reaches it, and the final 2–lower-7–2–1 motion settles home.",
      "independent",
    ),
  ],
);
