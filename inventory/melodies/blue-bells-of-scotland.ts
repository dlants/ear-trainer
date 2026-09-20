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

export const blueBellsOfScotland: CorpusMelody = melody(
  "blue-bells-of-scotland",
  "The Blue Bells of Scotland",
  92,
  "traditional",
  "Traditional Scottish song tune popularized in late eighteenth-century print.",
  [
    phrase(
      [
        // The rising 5–1–3–5 figure spells I on its own, so a single bass root
        // holds under it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [5]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The held 6 will not read as IV by itself, so the 4 sounds under it
        // with its third before the bass steps back to the tonic root.
        polyBar(
          [
            voiceOf("melody", ev(h, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The tune turns around 3–1–2–3 within I; the lone root is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody rests on 1 at the half close; root and fifth mark the
        // arrival.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // The upper neighbour 6 is the only turn in this bar, so IV takes the
        // one quarter it needs and the tonic root resumes immediately.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf(
              "harmony",
              ev(h, [1, -1]),
              ev(q, [4, -1], [6, -1]),
              ev(q, [1, -1]),
            ),
          ],
          [region(h, 1), region(q, 4), region(q, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone joins the root on
        // the second half after a bare tonic root.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The same shape returns with a lower-7 in the tune; the dominant dyad
        // again supplies the pull into the close.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The strain closes on a long 1; root and fifth settle it.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The pickup reaches 1, the first half cadences there, and the complete strain closes again on tonic.",
      "independent",
    ),
  ],
);
