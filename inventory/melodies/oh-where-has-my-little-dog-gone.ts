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
 * A hand-voiced left hand rather than block chords: a single bass root while
 * the harmony holds, thickened to a dyad at the turns to IV and at every
 * V–I cadence. The 6 in the tune always gets a 4 beneath it so the IV reading
 * is unmistakable.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
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
const toSubdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(h, 4)],
  );
const subdominantToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 4), region(h, 5)],
  );
const tonicToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );

export const ohWhereHasMyLittleDogGone: CorpusMelody = melody(
  "oh-where-has-my-little-dog-gone",
  "Oh Where, Oh Where Has My Little Dog Gone?",
  104,
  "public-domain",
  "Septimus Winner song, published in 1864, based on an older German folk melody.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        subdominantToDominantBar(
          ev(q, [4]),
          ev(q, [4]),
          ev(q, [2]),
          ev(q, [2]),
        ),
        cadenceBar(ev(w, [1])),
        toSubdominantBar(ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
        tonicToDominantBar(ev(q, [3]), ev(q, [1]), ev(h, [2])),
        tonicToDominantBar(ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        cadenceBar(ev(w, [1])),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final leading-tone resolution identify home.",
      "independent",
    ),
  ],
);
