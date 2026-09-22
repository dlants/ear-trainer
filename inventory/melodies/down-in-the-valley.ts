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

export const downInTheValley: CorpusMelody = melody(
  "down-in-the-valley",
  "Down in the Valley",
  76,
  "traditional",
  "Traditional American folk song and Appalachian standard.",
  [
    phrase(
      [
        // The melody's pickup 5 and held 1 give the outer frame of I but not
        // its quality, so the opening sounds root and third to fix the key.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 3 is the chordal third of I, so the harmony thins back
        // to a held root while the tune steps down to 2.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The rise 1-2-3 arpeggiates I outright, straight out of a tonic bar,
        // so the harmony drops out rather than restating the root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // The melody only holds 2, which belongs to V but does not spell it,
        // so the leading tone sounds at the turn before the bar thins to the
        // bare dominant root.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The opening returns; the key is established by now, so the same
        // pickup to 1 takes a bare root instead of repeating the first bar's
        // third.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune arpeggiates 3-5-3 through I, so one root is support enough,
        // and since the melody stays at 3 and above it sits in the melody's
        // own octave rather than down in the mud.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1])),
          ],
          [region(dh, 1)],
        ),
        // The melody sings the leading tone itself in the 2-7-2 neighbor
        // figure, so doubling it would add nothing: a bare dominant root
        // carries the bar, the earlier V having already been spelled out.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The long 1 is the ending rather than a way station, so the chordal
        // third joins the root to close; the fifth would only thicken what the
        // melody's own 1 already states.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Both lower-5 pickups resolve to 1 and the closing neighbor figure settles on a long tonic.",
      "independent",
    ),
  ],
);
