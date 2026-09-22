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

export const battleHymn: CorpusMelody = melody(
  "battle-hymn",
  "Battle Hymn of the Republic",
  108,
  "public-domain",
  "Traditional American camp-meeting tune used for ‘John Brown's Body’ and Julia Ward Howe's 1862 hymn.",
  [
    phrase(
      [
        // Three tonic attacks state I outright and the bar leans home through
        // the lower leading tone, so one bass root is all the harmony owes it.
        // The melody drops below its own 1 here, which puts that root in the
        // octave underneath.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The climb 1–2–3 walks the tonic triad itself, and the previous bar
        // has already placed the root, so the harmony stays out rather than
        // restating it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(h, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The descent 3–2–1 closes the opening sentence, so the root comes
        // back under it to ground the arrival without thickening a chord the
        // melody is already spelling.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 says little about the chord, so the turn to V gets
        // root and leading tone; then the tune falls to 5 itself and the
        // harmony steps aside rather than doubling it in unison.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h)),
          ],
          [region(w, 5)],
        ),
        // The arpeggio 1–3–5 spells I by itself, but it is the return home
        // after the dominant, so a held root marks the arrival and nothing
        // more.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the one note here that no tonic reading explains,
        // so the extra note is spent on the turn: IV takes root and third, and
        // I takes a bare root as the tune settles on 3.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody sings the leading tone itself on the last beat, and the
        // earlier V was already spelled out, so a plain dominant root carries
        // the cadence bar.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody lands on a long 1 and states the root itself, so the
        // chordal third joins the bass to close; the fifth would only thicken
        // what is already plain.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Three initial tonic attacks and a final lower-7-to-1 cadence provide strong tonic evidence.",
      "independent",
    ),
  ],
);
