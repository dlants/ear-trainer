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

export const mary: CorpusMelody = melody(
  "mary",
  "Mary Had a Little Lamb",
  108,
  "public-domain",
  "American nursery song associated with Sarah Josepha Hale's 1830 poem and Lowell Mason's nineteenth-century tune.",
  [
    phrase(
      [
        // The 3–2–1 descent spells the tonic out by itself, so the tune opens
        // unaccompanied.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // A repeated 3 sits equally well in I, iii, and vi, so the bass has to
        // name the chord. The root alone does it, since the melody is already
        // sounding the chordal third.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 is the chordal fifth of V and says nothing about
        // quality. This V is interior, though, and the phrase returns to I
        // straight away, so a bare root carries it.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // Rising 3 to a held 5 outlines the top of I but leaves it open against
        // V, so root and chordal third close the phrase.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1], [3])),
          ],
          [region(w, 1)],
        ),
      ],
      "context-required",
      "The opening touches 1 only in passing and closes on 5, so the local tonic evidence is weak.",
      "context-required",
    ),
    phrase(
      [
        // The same descent as the opening, voiced differently on its return: a
        // root under the first half, then out of the way once the tune reaches
        // 1 on its own.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h)),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The dominant before the final cadence is where the leading tone earns
        // its place; it sounds on the downbeat and then leaves the root to hold
        // the bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune lands on 1 for a full bar. The bass takes the octave below
        // rather than dropping out, so that silence does not become the marker
        // for a melody sitting on its own root.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The descent 3–2–1 is restated and the phrase resolves to a full-measure 1.",
      "independent",
    ),
  ],
);
