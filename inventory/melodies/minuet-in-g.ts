import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const minuetInG: CorpusMelody = melody(
  "minuet-in-g",
  "Minuet in G",
  100,
  "public-domain",
  "Christian Petzold, Minuet in G major from the 1725 Notebook for Anna Magdalena Bach.",
  [
    phrase(
      [
        // The melody opens from 5 up to 1, stating the tonic itself, so the
        // left hand only holds a single root for the measure.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [1, 1]), ev(q, [2, 1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The scalar run still belongs to I; one held root keeps the texture
        // out of the melody's way.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3, 1]), ev(q, [4, 1]), ev(q, [5, 1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune rises 1–2–3 through the tonic triad, so the bare root is
        // enough support.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The first turn away from home: the melody's 4–5–6 leaves IV open, so
        // root and third together mark the change.
        polyBar3(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        // The melody descends the tonic triad 5–3–1, stating I on its own; a
        // lone root sits beneath it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // An interior dominant on a bare root; the cadence that follows is
        // where the leading tone will matter.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody falls to the lower 7, and the harmony doubles that leading
        // tone above its root to sharpen the pull into the close.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The sustained 1 arrives; the root–fifth dyad under it settles the
        // cadence without doubling the melody's tonic as a third.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The closing half descends through the tonic triad and resolves lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
