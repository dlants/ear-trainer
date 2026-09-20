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

export const oComeAllYeFaithful: CorpusMelody = melody(
  "o-come-all-ye-faithful",
  "O Come, All Ye Faithful",
  96,
  "public-domain",
  "Eighteenth-century Latin carol melody traditionally attributed to John Francis Wade.",
  [
    phrase(
      [
        // The tune states 1 and 5 itself, so the harmony stays out of the way
        // with a single bass root.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The tonic octave repeats the same evidence, so the bass root again
        // suffices.
        polyBar(
          [
            voiceOf("melody", ev(h, [1, 1]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The stepwise 3-2-3-4 stays within I; one held root supports it.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 leaves V open, so the harmony turns mid-bar and adds
        // the leading tone to the dominant root.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The descent 1-7-6-5 passes through I, IV and V within the bar, so
        // the bass follows the turns and adds the leading tone at the last.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [7, -1]),
              ev(q, [6, -1]),
              ev(q, [5, -1]),
            ),
            voiceOf(
              "harmony",
              ev(h, [1, -1]),
              ev(q, [4, -1]),
              ev(q, [5, -1], [7, -1]),
            ),
          ],
          [region(h, 1), region(q, 4), region(q, 5)],
        ),
        // The melody's 2 again leaves V open, so the leading tone sounds
        // before the bass steps back to the tonic root under 3.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody's 4 is the root of IV, so a lone bass 4 supports it; the
        // melody's own leading tone then meets a 5-7 dyad into the cadence.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [4]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The tune resolves to a sustained 1; a root-fifth dyad gives the
        // close its weight without adding a new pitch class.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The tune opens with tonic octaves and eventually resolves lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
