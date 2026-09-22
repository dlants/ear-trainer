import type { CorpusMelody } from "../../music/melody.ts";
import {
  e,
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

export const frereJacques: CorpusMelody = melody(
  "frere-jacques",
  "Frère Jacques",
  104,
  "traditional",
  "Traditional French canon, documented in eighteenth-century sources.",
  [
    phrase(
      [
        // The opening bar has to set the key: the tune climbs 1–2–3 and back
        // to 1, so it spells the triad itself, but nothing has been heard yet.
        // Root and third sound on the downbeat and then step aside, leaving the
        // second half to the melody.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // The statement repeats note for note and nothing has turned, so the
        // harmony thins to a held root rather than restating the same pair.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Each statement begins and ends on 1, making the tonic explicit despite the short range.",
      "independent",
    ),
    phrase(
      [
        // The 3–4 rise gives I its third, so the tonic half takes a bare root,
        // up in the melody's own octave since the line never drops below 3. The
        // held 5 is open between I and V, so the turn is where the extra note
        // goes: the leading tone names the dominant.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The same turn repeated. The leading tone has already been heard once
        // and the cadence still wants it, so the dominant is bare here and the
        // tonic half keeps its root.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
      ],
      "context-required",
      "The phrase centers its arrival on 5 and needs the opening tonic statement.",
      "independent",
    ),
    phrase(
      [
        // The melody's 5–6–5–4 circles above IV without naming it, so the
        // subdominant gets root and third; the descent then lands on 3 and 1
        // and spells I by itself, leaving the tonic half a bare root.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [5]),
              ev(e, [6]),
              ev(e, [5]),
              ev(e, [4]),
              ev(q, [3]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The descent repeats, and the weight shifts: IV is known from the
        // previous bar and takes a lone root, while the tonic return gets its
        // third, so a full sound is not something only IV and V do.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [5]),
              ev(e, [6]),
              ev(e, [5]),
              ev(e, [4]),
              ev(q, [3]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
      ],
      "independent",
      "Both descents arrive on 1 after a clear 5–4–3 motion.",
      "independent",
    ),
    phrase(
      [
        // The melody states 1 on the downbeat, so the harmony waits; on the
        // passing V the tune itself sings the dominant root down low, so a lone
        // leading tone above it is all that is needed. The arrival takes root
        // and third rather than a hollow fifth.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(q), ev(q, [7, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(q, 1), region(q, 5), region(h, 1)],
        ),
        // The closing repeat fills in: the root doubles the melody's opening 1,
        // and the dominant adds its fifth above the leading tone over the
        // melody's low root, so the last cadence is the fullest in the tune.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [5, -1]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(q, [1, -1]),
              ev(q, [7, -1], [2]),
              ev(h, [1, -1], [3, -1]),
            ),
          ],
          [region(q, 1), region(q, 5), region(h, 1)],
        ),
      ],
      "independent",
      "Repeated 1–lower-5–1 arpeggiations strongly establish home.",
      "independent",
    ),
  ],
);
