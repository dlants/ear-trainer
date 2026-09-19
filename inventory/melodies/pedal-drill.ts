import type { CorpusMelody } from "../../music/melody.ts";
import {
  ev,
  melody,
  phrase,
  polyBar,
  q,
  region,
  voiceOf,
  w,
} from "../melody-builders.ts";

export const pedalDrill: CorpusMelody = melody(
  "pedal-drill",
  "Pedal Tone Drill",
  84,
  "original",
  "Original exercise written for this corpus: a held lower tonic under a moving line.",
  [
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The lower 1 is sustained through every bar while the upper line arpeggiates over it.",
      "independent",
    ),
  ],
);
