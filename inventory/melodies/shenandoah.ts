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

export const shenandoah: CorpusMelody = melody(
  "shenandoah",
  "Shenandoah",
  72,
  "traditional",
  "Traditional American folk song and river shanty, documented in the nineteenth century.",
  [
    phrase(
      [
        // The tune's pickup 5 rises to 1, so a single held root is all the
        // harmony needs to set the key.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 3 states I; the closing 2 is open, so the bass steps to
        // a bare 5 to name the turn.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The rising 1-2-3 outlines the tonic already, so one held root
        // underneath is enough.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // A long 5 over I: the held root keeps the chord under a note that is
        // open between I and V.
        polyBar3(
          [voiceOf("melody", ev(dh, [5])), voiceOf("harmony", ev(dh, [1, -1]))],
          [region(dh, 1)],
        ),
        // The tune first leans on IV here, so the bass widens to root and
        // third before stepping back to 1 for the return to I.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(q, [1, -1])),
          ],
          [region(h, 4), region(q, 1)],
        ),
        // The melody's held 2 leaves V open, so the leading tone sounds with
        // the root, and the resolution to I follows in the bass.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1, -1])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        // The tune's own lower 7 already pulls; the harmony doubles it with the
        // root so the whole bar reads as V before the close.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody arrives on a long 1, so a single root settles it.
        polyBar3(
          [voiceOf("melody", ev(dh, [1])), voiceOf("harmony", ev(dh, [1, -1]))],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The pickup resolves to 1, the later descent reaches it, and the final 2–lower-7–2–1 motion settles home.",
      "independent",
    ),
  ],
);
