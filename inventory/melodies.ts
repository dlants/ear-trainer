import {
  type ChordQuality,
  type CorpusEvent,
  type CorpusHarmony,
  type CorpusMeasure,
  type CorpusMeasureVoice,
  type CorpusMelody,
  type Melody,
  normalizeMelody,
} from "../music/melody.ts";
import type { Degree } from "../music/note.ts";

const e = 12;
const q = 24;
const dq = 36;
const h = 48;
const dh = 72;
const w = 96;

type Pitch = Degree | "rest";
type EventSpec = readonly [
  pitch: Pitch,
  durationTicks: number,
  octave?: number,
];
type PhraseSpec = {
  measures: CorpusMeasure[];
  noteIdentification: "independent" | "context-required" | "exclude";
  chordIdentification?: "independent" | "context-required" | "exclude";
  rationale: string;
};
type NoteSpec = readonly [degree: Degree, octave?: number];
/** One event of a hand-authored voice; several notes means a struck chord. */
function ev(durationTicks: number, ...notes: NoteSpec[]): CorpusEvent {
  return {
    notes: notes.map(([degree, octave = 0]) => ({
      degree,
      alteration: 0 as const,
      octave,
    })),
    durationTicks,
  };
}
function voiceOf(voiceId: string, ...events: CorpusEvent[]) {
  return { voiceId, events } satisfies CorpusMeasureVoice;
}
function region(
  durationTicks: number,
  root: Degree,
  quality: ChordQuality = "major",
): CorpusHarmony {
  return { durationTicks, chord: { root, alteration: 0, quality } };
}
/** A common-time measure with explicit voices and an authored chord track. */
function polyBar(
  voices: CorpusMeasureVoice[],
  harmony: CorpusHarmony[],
): CorpusMeasure {
  return {
    durationTicks: w,
    beatDurationsTicks: [q, q, q, q],
    voices,
    harmony,
  };
}
function withHarmony(
  authored: CorpusMeasure,
  harmony: CorpusHarmony[],
): CorpusMeasure {
  return { ...authored, harmony };
}

function measure(
  beatDurationsTicks: number[],
  ...specs: EventSpec[]
): CorpusMeasure {
  return {
    durationTicks: beatDurationsTicks.reduce(
      (sum, duration) => sum + duration,
      0,
    ),
    beatDurationsTicks,
    voices: [
      {
        voiceId: "melody",
        events: specs.map(([pitch, durationTicks, octave = 0]) => ({
          notes:
            pitch === "rest"
              ? []
              : [{ degree: pitch, alteration: 0 as const, octave }],
          durationTicks,
        })),
      },
    ],
  };
}

const bar4 = (...specs: EventSpec[]) => measure([q, q, q, q], ...specs);
const bar3 = (...specs: EventSpec[]) => measure([q, q, q], ...specs);
const bar6 = (...specs: EventSpec[]) => measure([dq, dq], ...specs);
const pickup = (...specs: EventSpec[]) => measure([q], ...specs);

function phrase(
  measures: CorpusMeasure[],
  noteIdentification: PhraseSpec["noteIdentification"],
  rationale: string,
  chordIdentification?: PhraseSpec["chordIdentification"],
): PhraseSpec {
  return { measures, noteIdentification, chordIdentification, rationale };
}

function splitPhrase(spec: PhraseSpec): PhraseSpec[] {
  const measureCounts =
    spec.measures.length % 2 === 0
      ? Array(spec.measures.length / 2).fill(2)
      : [3, ...Array((spec.measures.length - 3) / 2).fill(2)];
  let startMeasureIndex = 0;

  return measureCounts.map((measureCount) => {
    const measures = spec.measures.slice(
      startMeasureIndex,
      startMeasureIndex + measureCount,
    );
    startMeasureIndex += measureCount;
    const events = measures.flatMap(
      (authoredMeasure) =>
        authoredMeasure.voices
          .find(({ voiceId }) => voiceId === "melody")
          ?.events.filter(({ notes }) => notes.length > 0) ?? [],
    );
    const tonicIndexes = events.flatMap((event, eventIndex) =>
      event.notes.some(
        ({ degree, alteration }) => degree === 1 && alteration === 0,
      )
        ? [eventIndex]
        : [],
    );
    const hasStrongTonicEvidence =
      tonicIndexes.length >= 2 ||
      tonicIndexes.includes(0) ||
      tonicIndexes.includes(events.length - 1);
    const isPracticeLength = events.length >= 4 && events.length <= 8;
    const noteIdentification =
      spec.noteIdentification === "independent" &&
      (!isPracticeLength || !hasStrongTonicEvidence)
        ? "context-required"
        : spec.noteIdentification;

    return {
      measures,
      noteIdentification,
      chordIdentification: measures.some(
        (authoredMeasure) => authoredMeasure.harmony !== undefined,
      )
        ? spec.chordIdentification
        : undefined,
      rationale:
        noteIdentification === spec.noteIdentification
          ? spec.rationale
          : `This short excerpt is retained for context; it has ${events.length} sounded notes and does not meet the compact independent-phrase rubric.`,
    };
  });
}

function melody(
  id: string,
  title: string,
  tempoBpm: number,
  status: CorpusMelody["source"]["status"],
  provenance: string,
  phrases: PhraseSpec[],
  context: CorpusMelody["context"] = "major-cadence",
): CorpusMelody {
  return {
    id,
    title,
    context,
    tempoBpm,
    source: {
      description: `${provenance} Independent tonic-relative transcription for this corpus.`,
      status,
    },
    measures: phrases
      .flatMap(splitPhrase)
      .flatMap(
        ({ measures, noteIdentification, chordIdentification, rationale }) =>
          measures.map((authoredMeasure, index) =>
            index === measures.length - 1
              ? {
                  ...authoredMeasure,
                  phraseEnd: {
                    noteIdentification,
                    chordIdentification,
                    rationale,
                  },
                }
              : authoredMeasure,
          ),
      ),
  };
}

export const MELODY_CORPUS: CorpusMelody[] = [
  melody(
    "twinkle",
    "Twinkle, Twinkle, Little Star",
    96,
    "public-domain",
    "Traditional French melody published as ‘Ah! vous dirai-je, maman’ in the eighteenth century.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [5, q], [5, q]),
          bar4([6, q], [6, q], [5, h]),
          bar4([4, q], [4, q], [3, q], [3, q]),
          bar4([2, q], [2, q], [1, h]),
        ],
        "independent",
        "The phrase begins and cadences on 1, with repeated 1s and no altered tones.",
      ),
      phrase(
        [
          bar4([5, q], [5, q], [4, q], [4, q]),
          bar4([3, q], [3, q], [2, h]),
          bar4([5, q], [5, q], [4, q], [4, q]),
          bar4([3, q], [3, q], [2, h]),
        ],
        "context-required",
        "The repeated dominant-led middle strain ends on 2 and relies on the surrounding tonic phrases.",
      ),
      phrase(
        [
          bar4([1, q], [1, q], [5, q], [5, q]),
          bar4([6, q], [6, q], [5, h]),
          bar4([4, q], [4, q], [3, q], [3, q]),
          bar4([2, q], [2, q], [1, h]),
        ],
        "independent",
        "The returning phrase states 1 at the opening and closes decisively on a long 1.",
      ),
    ],
  ),
  melody(
    "mary",
    "Mary Had a Little Lamb",
    108,
    "public-domain",
    "American nursery song associated with Sarah Josepha Hale's 1830 poem and Lowell Mason's nineteenth-century tune.",
    [
      phrase(
        [
          bar4([3, q], [2, q], [1, q], [2, q]),
          bar4([3, q], [3, q], [3, h]),
          bar4([2, q], [2, q], [2, h]),
          bar4([3, q], [5, q], [5, h]),
        ],
        "context-required",
        "The opening touches 1 only in passing and closes on 5, so the local tonic evidence is weak.",
      ),
      phrase(
        [
          bar4([3, q], [2, q], [1, q], [2, q]),
          bar4([3, q], [3, q], [3, q], [3, q]),
          bar4([2, q], [2, q], [3, q], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "The descent 3–2–1 is restated and the phrase resolves to a full-measure 1.",
      ),
    ],
  ),
  melody(
    "happy-birthday",
    "Happy Birthday",
    92,
    "public-domain",
    "Patty and Mildred Hill melody first published in the 1890s; public-domain birthday-song form.",
    [
      phrase(
        [
          pickup([5, e, -1], [5, e, -1]),
          bar3([6, q, -1], [5, q, -1], [1, q]),
          bar3([7, h, -1], [5, e, -1], [5, e, -1]),
          bar3([6, q, -1], [5, q, -1], [2, q]),
          bar3([1, dh]),
        ],
        "independent",
        "Both opening sentences rise from lower 5 and the second lands on a sustained natural 1.",
      ),
      phrase(
        [
          pickup([5, e, -1], [5, e, -1]),
          bar3([5, q], [3, q], [1, q]),
          bar3([7, q, -1], [6, q, -1], [4, e], [4, e]),
          bar3([3, q], [1, q], [2, q]),
          bar3([1, dh]),
        ],
        "independent",
        "The climactic line includes 1 and the final 3–1–2–1 motion gives an unambiguous tonic arrival.",
      ),
    ],
  ),
  melody(
    "ode-to-joy",
    "Ode to Joy",
    112,
    "public-domain",
    "Ludwig van Beethoven, Symphony No. 9 finale theme, 1824.",
    [
      phrase(
        [
          bar4([3, q], [3, q], [4, q], [5, q]),
          bar4([5, q], [4, q], [3, q], [2, q]),
          bar4([1, q], [1, q], [2, q], [3, q]),
          bar4([3, dq], [2, e], [2, h]),
        ],
        "independent",
        "The balanced stepwise line clearly reaches 1 and returns through 2–3–2.",
      ),
      phrase(
        [
          bar4([3, q], [3, q], [4, q], [5, q]),
          bar4([5, q], [4, q], [3, q], [2, q]),
          bar4([1, q], [1, q], [2, q], [3, q]),
          bar4([2, dq], [1, e], [1, h]),
        ],
        "independent",
        "Repeated 1s prepare a final 2–1 cadence with a sustained tonic.",
      ),
    ],
  ),
  melody(
    "row-your-boat",
    "Row, Row, Row Your Boat",
    104,
    "traditional",
    "Traditional English-language round, printed in nineteenth-century American song collections.",
    [
      phrase(
        [
          bar6([1, dq], [1, dq]),
          bar6([1, q], [2, e], [3, dq]),
          bar6([3, q], [2, e], [3, q], [4, e]),
          bar6([5, dh]),
        ],
        "independent",
        "Three opening tonic attacks establish 1 before the line rises to 5.",
      ),
      phrase(
        [
          bar6([1, e, 1], [1, e, 1], [1, e, 1], [5, e], [5, e], [5, e]),
          bar6([3, e], [3, e], [3, e], [1, e], [1, e], [1, e]),
          bar6([5, q], [4, e], [3, q], [2, e]),
          bar6([1, dh]),
        ],
        "independent",
        "Repeated upper and home-register 1s lead to the closing 5–4–3–2–1 descent.",
      ),
    ],
  ),
  melody(
    "jingle-bells",
    "Jingle Bells",
    116,
    "public-domain",
    "James Lord Pierpont, ‘One Horse Open Sleigh’, 1857.",
    [
      phrase(
        [
          bar4([3, q], [3, q], [3, h]),
          bar4([3, q], [3, q], [3, h]),
          bar4([3, q], [5, q], [1, dq, 1], [2, e, 1]),
          bar4([3, w, 1]),
        ],
        "context-required",
        "The refrain's first half leaps through upper 1 but ends on 3, so its cadence is not tonic.",
      ),
      phrase(
        [
          bar4([4, q], [4, q], [4, dq], [4, e]),
          bar4([4, q], [3, q], [3, q], [3, e], [3, e]),
          bar4([3, q], [2, q], [2, q], [3, q]),
          bar4([2, h], [5, h]),
        ],
        "context-required",
        "This answer emphasizes 4, 3, 2, and 5 without a natural tonic arrival.",
      ),
    ],
  ),
  melody(
    "frere-jacques",
    "Frère Jacques",
    104,
    "traditional",
    "Traditional French canon, documented in eighteenth-century sources.",
    [
      phrase(
        [
          bar4([1, q], [2, q], [3, q], [1, q]),
          bar4([1, q], [2, q], [3, q], [1, q]),
        ],
        "independent",
        "Each statement begins and ends on 1, making the tonic explicit despite the short range.",
      ),
      phrase(
        [bar4([3, q], [4, q], [5, h]), bar4([3, q], [4, q], [5, h])],
        "context-required",
        "The phrase centers its arrival on 5 and needs the opening tonic statement.",
      ),
      phrase(
        [
          bar4([5, e], [6, e], [5, e], [4, e], [3, q], [1, q]),
          bar4([5, e], [6, e], [5, e], [4, e], [3, q], [1, q]),
        ],
        "independent",
        "Both descents arrive on 1 after a clear 5–4–3 motion.",
      ),
      phrase(
        [bar4([1, q], [5, q, -1], [1, h]), bar4([1, q], [5, q, -1], [1, h])],
        "independent",
        "Repeated 1–lower-5–1 arpeggiations strongly establish home.",
      ),
    ],
  ),
  melody(
    "london-bridge",
    "London Bridge Is Falling Down",
    112,
    "traditional",
    "Traditional English singing-game tune in a common nineteenth-century form.",
    [
      phrase(
        [
          bar4([5, q], [6, e], [5, e], [4, q], [3, q]),
          bar4([4, q], [5, h], [2, q]),
          bar4([3, q], [4, h], [3, q]),
          bar4([4, q], [5, h], [5, q]),
        ],
        "context-required",
        "The first half circles 5 and ends there, with no tonic event.",
      ),
      phrase(
        [
          bar4([5, q], [6, e], [5, e], [4, q], [3, q]),
          bar4([4, q], [5, h], [2, q]),
          bar4([5, q], [3, q], [1, h]),
          bar4(["rest", w]),
        ],
        "independent",
        "The final 5–3–1 arpeggiation supplies a clear tonic cadence followed by silence.",
      ),
    ],
  ),
  melody(
    "old-macdonald",
    "Old MacDonald Had a Farm",
    108,
    "traditional",
    "Traditional American cumulative song, documented in early twentieth-century collections from older oral forms.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [1, q], [5, q, -1]),
          bar4([6, q, -1], [6, q, -1], [5, h, -1]),
          bar4([3, q], [3, q], [2, q], [2, q]),
          bar4([1, h], [5, h]),
        ],
        "independent",
        "Repeated opening 1s and the 2–1 motion establish tonic before the refrain pickup.",
      ),
      phrase(
        [
          bar4([1, q], [1, q], [1, q], [5, q, -1]),
          bar4([6, q, -1], [6, q, -1], [5, h, -1]),
          bar4([3, q], [3, q], [2, q], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "The repeated tonic opening returns and the complete strain closes on a full-measure 1.",
      ),
    ],
  ),
  melody(
    "hot-cross-buns",
    "Hot Cross Buns",
    96,
    "traditional",
    "Traditional English street cry and nursery tune, documented by the eighteenth century.",
    [
      phrase(
        [
          bar4([3, h], [2, h]),
          bar4([1, w]),
          bar4([3, h], [2, h]),
          bar4([1, w]),
        ],
        "independent",
        "Each descending 3–2–1 statement ends on a sustained tonic.",
      ),
      phrase(
        [
          bar4([1, q], [1, q], [1, q], [1, q]),
          bar4([2, q], [2, q], [2, q], [2, q]),
          bar4([3, h], [2, h]),
          bar4([1, w]),
        ],
        "independent",
        "Four repeated 1s precede the final 3–2–1 cadence.",
      ),
    ],
  ),
  melody(
    "yankee-doodle",
    "Yankee Doodle",
    116,
    "traditional",
    "Traditional Anglo-American tune widely printed during the eighteenth century.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [2, q], [3, q]),
          bar4([1, q], [3, q], [2, h]),
          bar4([1, q], [1, q], [2, q], [3, q]),
          bar4([1, h], [7, q, -1], [1, q]),
        ],
        "independent",
        "Both sentences begin on 1 and the second resolves lower 7 back to 1.",
      ),
      phrase(
        [
          bar4([1, q], [1, q], [2, q], [3, q]),
          bar4([4, q], [3, q], [2, q], [1, q]),
          bar4([7, q, -1], [5, q, -1], [6, q, -1], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The descending line reaches 1 and the lower leading-tone ascent closes on a long tonic.",
      ),
    ],
  ),
  melody(
    "this-old-man",
    "This Old Man",
    112,
    "traditional",
    "Traditional English-language nursery and counting song, collected in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, q], [3, q], [5, h]),
          bar4([5, q], [3, q], [5, h]),
          bar4([6, q], [5, q], [4, q], [3, q]),
          bar4([2, q], [3, q], [4, h]),
        ],
        "context-required",
        "The opening strain avoids 1 and pauses on 4, so it does not independently establish tonic.",
      ),
      phrase(
        [
          bar4([1, q], [1, q], [2, q], [3, q]),
          bar4([4, q], [5, q], [3, h]),
          bar4([1, q], [2, q], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated 1s and the final 2–lower-7–2–1 figure make the tonic arrival explicit.",
      ),
    ],
  ),
  melody(
    "amazing-grace",
    "Amazing Grace",
    84,
    "public-domain",
    "Words by John Newton with the early nineteenth-century American tune New Britain.",
    [
      phrase(
        [
          bar3([5, q, -1], [1, h]),
          bar3([3, e], [1, e], [3, h]),
          bar3([2, q], [1, q], [6, q, -1]),
          bar3([5, q, -1], [1, h]),
          bar3([3, e], [1, e], [3, h]),
          bar3([2, h], [3, q]),
          bar3([5, h], [3, q]),
          bar3([1, dh]),
        ],
        "independent",
        "The lower-5 pickup repeatedly resolves to 1, and the strain closes on a sustained tonic.",
      ),
    ],
  ),
  melody(
    "au-clair-de-la-lune",
    "Au clair de la lune",
    100,
    "traditional",
    "Traditional French song, printed in the eighteenth century.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [1, q], [2, q]),
          bar4([3, h], [2, h]),
          bar4([1, q], [3, q], [2, q], [2, q]),
          bar4([1, w]),
          bar4([2, q], [2, q], [2, q], [2, q]),
          bar4([5, h], [5, h]),
          bar4([1, q], [3, q], [2, q], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated opening 1s and two long tonic cadences make home unmistakable.",
      ),
    ],
  ),
  melody(
    "lightly-row",
    "Lightly Row",
    104,
    "traditional",
    "Traditional German children's tune ‘Hänschen klein’ in its common teaching-song form.",
    [
      phrase(
        [
          bar4([5, h], [3, h]),
          bar4([3, h], [4, q], [2, q]),
          bar4([2, h], [1, q], [2, q]),
          bar4([3, q], [4, q], [5, h]),
          bar4([5, h], [3, h]),
          bar4([3, h], [4, q], [2, q]),
          bar4([2, h], [1, q], [3, q]),
          bar4([1, w]),
        ],
        "independent",
        "The second half repeats the descent and ends with 2–1–3–1 tonic confirmation.",
      ),
    ],
  ),
  melody(
    "three-blind-mice",
    "Three Blind Mice",
    108,
    "traditional",
    "Traditional English round, with the familiar melody documented by the seventeenth century.",
    [
      phrase(
        [
          bar4([3, h], [2, h]),
          bar4([1, w]),
          bar4([3, h], [2, h]),
          bar4([1, w]),
          bar4([5, q], [4, q], [3, h]),
          bar4([5, q], [4, q], [3, h]),
          bar4([3, q], [2, q], [1, h]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated 3–2–1 descents and a final sustained 1 provide unusually direct tonic evidence.",
      ),
    ],
  ),
  melody(
    "baa-baa-black-sheep",
    "Baa, Baa, Black Sheep",
    96,
    "traditional",
    "Traditional English nursery rhyme sung to the eighteenth-century French melody also used by Twinkle.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [5, q], [5, q]),
          bar4([6, q], [6, q], [5, h]),
          bar4([4, q], [4, q], [3, q], [3, q]),
          bar4([2, q], [2, q], [1, h]),
          bar4([5, q], [5, q], [4, q], [4, q]),
          bar4([3, q], [3, q], [2, h]),
          bar4([1, q], [1, q], [5, q], [5, q]),
          bar4([2, q], [2, q], [1, h]),
        ],
        "independent",
        "The shared tune opens with repeated 1s and returns to 1 in both the first and final cadences.",
      ),
    ],
  ),
  melody(
    "rock-a-bye-baby",
    "Rock-a-bye Baby",
    80,
    "traditional",
    "Traditional English-language lullaby tune, published in the nineteenth century.",
    [
      phrase(
        [
          bar3([1, q], [3, q], [6, q]),
          bar3([5, h], [3, q]),
          bar3([4, q], [2, q], [7, q, -1]),
          bar3([1, dh]),
          bar3([1, q], [3, q], [6, q]),
          bar3([5, h], [3, q]),
          bar3([2, q], [7, q, -1], [2, q]),
          bar3([1, dh]),
        ],
        "independent",
        "Both halves begin on 1 and cadence through lower 7 to a sustained 1.",
      ),
    ],
  ),
  melody(
    "hush-little-baby",
    "Hush, Little Baby",
    92,
    "traditional",
    "Traditional American lullaby in a widely sung folk form.",
    [
      phrase(
        [
          bar4([1, q], [3, q], [5, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([5, q], [3, q], [2, q], [1, q]),
          bar4([2, h], [1, h]),
          bar4([1, q], [3, q], [5, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [1, q]),
          bar4([1, w]),
        ],
        "independent",
        "The melody starts on 1, repeatedly descends to it, and finishes with two tonic events.",
      ),
    ],
  ),
  melody(
    "polly-put-the-kettle-on",
    "Polly Put the Kettle On",
    112,
    "traditional",
    "Traditional English nursery tune, printed in the late eighteenth century.",
    [
      phrase(
        [
          bar4([5, q], [3, q], [3, q], [3, q]),
          bar4([4, q], [2, q], [2, h]),
          bar4([1, q], [2, q], [3, q], [4, q]),
          bar4([5, h], [5, h]),
          bar4([5, q], [3, q], [3, q], [3, q]),
          bar4([4, q], [2, q], [2, h]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The latter half reaches 1 and closes with lower 7 resolving to a full-measure tonic.",
      ),
    ],
  ),
  melody(
    "sing-a-song-of-sixpence",
    "Sing a Song of Sixpence",
    112,
    "traditional",
    "Traditional English nursery song documented in eighteenth-century print.",
    [
      phrase(
        [
          bar4([5, q], [5, q], [3, q], [3, q]),
          bar4([4, q], [4, q], [2, h]),
          bar4([1, q], [2, q], [3, q], [4, q]),
          bar4([5, w]),
          bar4([5, q], [3, q], [1, q], [3, q]),
          bar4([4, q], [2, q], [7, h, -1]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The answer phrase repeatedly uses 1 and closes with lower 7–1 resolution.",
      ),
    ],
  ),
  melody(
    "ring-around-the-rosie",
    "Ring Around the Rosie",
    108,
    "traditional",
    "Traditional English-language singing game in a common American melodic form.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [3, q], [3, q]),
          bar4([2, q], [2, q], [5, h]),
          bar4([3, q], [1, q], [3, q], [4, q]),
          bar4([2, h], [1, h]),
          bar4([5, q], [5, q], [3, h]),
          bar4([4, q], [4, q], [2, h]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated opening 1s and the final lower-7-to-1 cadence clearly identify home.",
      ),
    ],
  ),
  melody(
    "itsy-bitsy-spider",
    "Itsy Bitsy Spider",
    108,
    "traditional",
    "Traditional English-language nursery song, published in early twentieth-century folk collections.",
    [
      phrase(
        [
          bar4([5, e, -1], [1, e], [1, q], [1, e], [2, e], [3, q]),
          bar4([3, q], [2, q], [1, h]),
          bar4([2, q], [3, q], [4, q], [4, q]),
          bar4([3, h], [2, h]),
          bar4([1, q], [1, q], [3, q], [5, q]),
          bar4([5, q], [4, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The tune begins around 1, returns through it, and ends with lower 7 resolving to 1.",
      ),
    ],
  ),
  melody(
    "farmer-in-the-dell",
    "The Farmer in the Dell",
    108,
    "traditional",
    "Traditional German-American singing-game tune, widespread in the nineteenth century.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [1, q], [1, q]),
          bar4([1, q], [1, q], [2, q], [3, q]),
          bar4([3, q], [2, q], [1, q], [2, q]),
          bar4([3, w]),
          bar4([3, q], [4, q], [5, h]),
          bar4([5, q], [4, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Six opening tonic attacks and a final lower-7-to-1 cadence give strong evidence for home.",
      ),
    ],
  ),
  melody(
    "mulberry-bush",
    "Here We Go Round the Mulberry Bush",
    112,
    "traditional",
    "Traditional English singing-game tune documented in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, q], [5, q], [3, q], [3, q]),
          bar4([4, q], [4, q], [2, h]),
          bar4([1, q], [2, q], [3, q], [4, q]),
          bar4([5, h], [5, h]),
          bar4([5, q], [3, q], [1, q], [3, q]),
          bar4([4, q], [2, q], [7, h, -1]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The closing strain uses 1 twice and resolves lower 7 to a sustained tonic.",
      ),
    ],
  ),
  melody(
    "pop-goes-the-weasel",
    "Pop Goes the Weasel",
    116,
    "traditional",
    "Traditional English dance and nursery tune, published in the 1850s.",
    [
      phrase(
        [
          bar6([1, q], [1, e], [2, q], [2, e]),
          bar6([3, q], [5, e], [3, dq]),
          bar6([1, q], [1, e], [2, q], [2, e]),
          bar6([3, dq], [1, dq]),
          bar6([1, q], [1, e], [2, q], [2, e]),
          bar6([3, q], [5, e], [6, dq]),
          bar6([5, q], [3, e], [2, q], [7, e, -1]),
          bar6([1, dh]),
        ],
        "independent",
        "Each strain starts on 1, and the final lower-7-to-1 snap is a strong tonic resolution.",
      ),
    ],
  ),
  melody(
    "skip-to-my-lou",
    "Skip to My Lou",
    112,
    "traditional",
    "Traditional American partner-stealing dance song, documented in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, q], [3, q], [3, h]),
          bar4([5, q], [3, q], [3, h]),
          bar4([5, q], [4, q], [3, q], [2, q]),
          bar4([1, w]),
          bar4([1, q], [3, q], [5, h]),
          bar4([5, q], [4, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The first half cadences on 1 and the ending repeats a lower-7-to-1 tonic resolution.",
      ),
    ],
  ),
  melody(
    "shoo-fly",
    "Shoo, Fly, Don't Bother Me",
    112,
    "public-domain",
    "American popular and folk song first published in the 1860s.",
    [
      phrase(
        [
          bar4([1, q], [3, q], [5, h]),
          bar4([5, q], [6, q], [5, h]),
          bar4([4, q], [3, q], [2, q], [1, q]),
          bar4([2, h], [5, h, -1]),
          bar4([1, q], [3, q], [5, h]),
          bar4([5, q], [6, q], [5, h]),
          bar4([4, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The melody starts on 1, descends through 1, and ends with lower 7 resolving to tonic.",
      ),
    ],
  ),
  melody(
    "oh-susanna",
    "Oh! Susanna",
    108,
    "public-domain",
    "Stephen Foster song, first published in 1848.",
    [
      phrase(
        [
          bar4([1, e], [2, e], [3, q], [5, q], [6, q]),
          bar4([5, h], [3, h]),
          bar4([1, e], [2, e], [3, q], [3, q], [2, q]),
          bar4([1, h], [2, h]),
          bar4([3, q], [5, q], [6, q], [6, q]),
          bar4([5, q], [3, q], [1, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The opening starts on 1, the refrain lands on 1, and the final leading-tone motion resolves home.",
      ),
    ],
  ),
  melody(
    "camptown-races",
    "Camptown Races",
    116,
    "public-domain",
    "Stephen Foster minstrel-era song, published in 1850.",
    [
      phrase(
        [
          bar4([5, q], [5, q], [3, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([3, q], [2, q], [1, q], [2, q]),
          bar4([3, h], [1, h]),
          bar4([5, q], [5, q], [3, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The first cadence reaches 1 and the last phrase resolves lower 7 to a long tonic.",
      ),
    ],
  ),
  melody(
    "shell-be-coming-round-the-mountain",
    "She'll Be Coming 'Round the Mountain",
    116,
    "traditional",
    "Traditional American folk song derived from the spiritual ‘When the Chariot Comes’.",
    [
      phrase(
        [
          bar4([5, e, -1], [6, e, -1], [1, q], [1, q], [1, q]),
          bar4([3, q], [3, q], [3, h]),
          bar4([2, q], [1, q], [2, q], [3, q]),
          bar4([1, h], [5, h, -1]),
          bar4([1, q], [1, q], [3, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated 1s establish home immediately and the ending resolves lower 7 to 1.",
      ),
    ],
  ),
  melody(
    "when-the-saints",
    "When the Saints Go Marching In",
    104,
    "traditional",
    "Traditional American gospel hymn, developed from nineteenth-century spiritual material.",
    [
      phrase(
        [
          bar4([1, q], [3, q], [4, q], [5, q]),
          bar4([1, w, 1]),
          bar4([1, q], [3, q], [4, q], [5, q]),
          bar4([1, w, 1]),
          bar4([3, q], [1, q], [3, q], [2, q]),
          bar4([2, h], [1, h]),
          bar4([3, q], [5, q], [5, q], [4, q]),
          bar4([3, h], [1, h]),
        ],
        "independent",
        "Each opening ascent begins on 1 and reaches upper 1, while both later cadences return to home.",
      ),
    ],
  ),
  melody(
    "home-on-the-range",
    "Home on the Range",
    84,
    "public-domain",
    "Daniel E. Kelley tune with Brewster Higley lyrics, published in the late nineteenth century.",
    [
      phrase(
        [
          bar3([1, q], [2, q], [3, q]),
          bar3([5, h], [3, q]),
          bar3([2, q], [1, q], [6, q, -1]),
          bar3([5, dh, -1]),
          bar3([1, q], [2, q], [3, q]),
          bar3([5, q], [6, q], [5, q]),
          bar3([3, q], [2, q], [7, q, -1]),
          bar3([1, dh]),
        ],
        "independent",
        "The range opens from 1 and the second sentence closes lower 7 to a sustained tonic.",
      ),
    ],
  ),
  melody(
    "my-bonnie",
    "My Bonnie Lies over the Ocean",
    88,
    "traditional",
    "Traditional Scottish song, published in the nineteenth century.",
    [
      phrase(
        [
          bar3([5, q, -1], [1, h]),
          bar3([3, q], [2, q], [1, q]),
          bar3([2, q], [1, q], [6, q, -1]),
          bar3([5, dh, -1]),
          bar3([5, q, -1], [1, h]),
          bar3([3, q], [5, q], [6, q]),
          bar3([5, q], [3, q], [2, q]),
          bar3([1, dh]),
        ],
        "independent",
        "The lower-5 pickup resolves to 1 twice and the strain ends with a complete 5–3–2–1 descent.",
      ),
    ],
  ),
  melody(
    "auld-lang-syne",
    "Auld Lang Syne",
    88,
    "traditional",
    "Traditional Scots tune associated with Robert Burns's 1788 text.",
    [
      phrase(
        [
          bar4([5, q, -1], [1, q], [1, q], [1, q]),
          bar4([3, q], [2, q], [1, h]),
          bar4([2, q], [3, q], [2, q], [1, q]),
          bar4([2, h], [5, h]),
          bar4([5, q], [3, q], [1, q], [1, q]),
          bar4([3, q], [2, q], [1, h]),
          bar4([6, q, -1], [5, q, -1], [6, q, -1], [1, q]),
          bar4([1, w]),
        ],
        "independent",
        "The tune repeatedly returns to 1, and the closing lower-neighbor ascent settles on a long tonic.",
      ),
    ],
  ),
  melody(
    "lavenders-blue",
    "Lavender's Blue",
    96,
    "traditional",
    "Traditional English folk song documented in seventeenth-century broadside form.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [3, q], [3, q]),
          bar4([5, q], [5, q], [3, h]),
          bar4([4, q], [4, q], [2, q], [2, q]),
          bar4([1, w]),
          bar4([3, q], [3, q], [5, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all point home.",
      ),
    ],
  ),
  melody(
    "oranges-and-lemons",
    "Oranges and Lemons",
    104,
    "traditional",
    "Traditional English singing-game tune associated with London church bells.",
    [
      phrase(
        [
          bar4([1, q], [2, q], [3, q], [1, q]),
          bar4([2, q], [3, q], [4, h]),
          bar4([5, q], [3, q], [1, q], [3, q]),
          bar4([2, h], [1, h]),
          bar4([5, q], [5, q], [3, q], [3, q]),
          bar4([4, q], [2, q], [2, h]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The opening and midpoint use 1, while the final lower-7-to-1 cadence confirms the tonic.",
      ),
    ],
  ),
  melody(
    "hickory-dickory-dock",
    "Hickory Dickory Dock",
    108,
    "traditional",
    "Traditional English nursery rhyme tune in a common modern folk form.",
    [
      phrase(
        [
          bar4([1, q], [2, q], [3, q], [4, q]),
          bar4([5, h], [5, h]),
          bar4([6, q], [5, q], [4, q], [3, q]),
          bar4([2, h], [1, h]),
          bar4([5, q], [5, q], [3, q], [3, q]),
          bar4([4, q], [4, q], [2, h]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The scale ascent starts on 1, the first half cadences there, and the ending resolves lower 7 to 1.",
      ),
    ],
  ),
  melody(
    "clementine",
    "Oh My Darling, Clementine",
    88,
    "public-domain",
    "Percy Montrose song, published in 1884, drawing on earlier American folk material.",
    [
      phrase(
        [
          bar3([5, q, -1], [5, q, -1], [5, q, -1]),
          bar3([1, h], [3, q]),
          bar3([3, q], [3, q], [1, q]),
          bar3([5, dh, -1]),
          bar3([5, q, -1], [5, q, -1], [5, q, -1]),
          bar3([1, h], [3, q]),
          bar3([5, q], [5, q], [3, q]),
          bar3([1, dh]),
        ],
        "independent",
        "Repeated lower 5s resolve to 1 in both halves, and the final 5–3–1 outlines the tonic triad.",
      ),
    ],
  ),
  melody(
    "red-river-valley",
    "Red River Valley",
    84,
    "traditional",
    "Traditional North American cowboy song, documented in nineteenth-century manuscripts.",
    [
      phrase(
        [
          bar4([5, q, -1], [1, q], [2, q], [3, q]),
          bar4([3, h], [2, q], [1, q]),
          bar4([2, q], [3, q], [4, q], [5, q]),
          bar4([3, h], [1, h]),
          bar4([5, q], [5, q], [6, q], [5, q]),
          bar4([3, h], [2, h]),
          bar4([1, q], [2, q], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "The lower-5 pickup reaches 1, the first cadence returns there, and the full strain ends on tonic.",
      ),
    ],
  ),
  melody(
    "drunken-sailor",
    "What Shall We Do with a Drunken Sailor?",
    112,
    "traditional",
    "Traditional sea shanty documented in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, q], [5, q], [5, e], [6, e], [5, q]),
          bar4([4, q], [2, q], [2, h]),
          bar4([5, q], [5, q], [5, e], [6, e], [5, q]),
          bar4([4, q], [2, q], [2, h]),
          bar4([1, q], [1, q], [1, e], [2, e], [3, q]),
          bar4([2, q], [1, q], [7, h, -1]),
          bar4([6, q, -1], [5, q, -1], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "context-required",
        "The modal minor-color strain emphasizes 5 and lower 7; its final 1 is clear only with the full context.",
      ),
    ],
    "minor-cadence",
  ),
  melody(
    "swing-low",
    "Swing Low, Sweet Chariot",
    84,
    "traditional",
    "Traditional African American spiritual, documented in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, h], [3, q], [1, q]),
          bar4([6, h], [5, h]),
          bar4([3, q], [1, q], [2, q], [3, q]),
          bar4([1, w]),
          bar4([5, h], [3, q], [1, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The opening 5–3–1 descent and both long tonic cadences establish home.",
      ),
    ],
  ),
  melody(
    "go-tell-it-on-the-mountain",
    "Go Tell It on the Mountain",
    100,
    "traditional",
    "Traditional African American spiritual, collected and published in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, q], [5, q], [3, q], [1, q]),
          bar4([2, q], [3, q], [1, h]),
          bar4([5, q], [5, q], [6, q], [5, q]),
          bar4([3, h], [2, h]),
          bar4([1, q], [3, q], [5, q], [6, q]),
          bar4([5, q], [3, q], [1, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "A 5–3–1 opening descent, repeated 1s, and the final lower-7 resolution identify tonic.",
      ),
    ],
  ),
  melody(
    "kumbaya",
    "Kumbaya",
    76,
    "traditional",
    "Traditional African American spiritual and camp song, documented in early twentieth-century field recordings.",
    [
      phrase(
        [
          bar4([1, h], [3, h]),
          bar4([5, h], [5, h]),
          bar4([6, h], [5, h]),
          bar4([3, w]),
          bar4([1, h], [3, h]),
          bar4([5, q], [4, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The second statement begins on 1 and the final lower-7-to-1 motion gives a clear cadence.",
      ),
    ],
  ),
  melody(
    "michael-row-the-boat-ashore",
    "Michael, Row the Boat Ashore",
    88,
    "traditional",
    "Traditional African American spiritual first documented in the nineteenth-century Sea Islands.",
    [
      phrase(
        [
          bar4([1, q], [3, q], [5, h]),
          bar4([6, q], [5, q], [3, h]),
          bar4([5, q], [3, q], [2, q], [1, q]),
          bar4([2, h], [1, h]),
          bar4([1, q], [3, q], [5, h]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Both halves start on 1 and descend to it, with a final lower-leading-tone resolution.",
      ),
    ],
  ),
  melody(
    "simple-gifts",
    "Simple Gifts",
    104,
    "public-domain",
    "Joseph Brackett's Shaker dance song, composed in 1848.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [4, q], [4, q]),
          bar4([4, q], [5, q], [6, h]),
          bar4([6, q], [5, q], [4, q], [3, q]),
          bar4([2, h], [1, h]),
          bar4([1, q], [3, q], [4, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all establish home.",
      ),
    ],
  ),
  melody(
    "shenandoah",
    "Shenandoah",
    72,
    "traditional",
    "Traditional American folk song and river shanty, documented in the nineteenth century.",
    [
      phrase(
        [
          bar3([5, q, -1], [1, h]),
          bar3([3, h], [2, q]),
          bar3([1, q], [2, q], [3, q]),
          bar3([5, dh]),
          bar3([6, q], [5, q], [3, q]),
          bar3([2, h], [1, q]),
          bar3([2, q], [7, q, -1], [2, q]),
          bar3([1, dh]),
        ],
        "independent",
        "The pickup resolves to 1, the later descent reaches it, and the final 2–lower-7–2–1 motion settles home.",
      ),
    ],
  ),
  melody(
    "aura-lee",
    "Aura Lee",
    88,
    "public-domain",
    "George R. Poulton melody with W. W. Fosdick lyrics, published in 1861.",
    [
      phrase(
        [
          bar4([1, q], [3, q], [5, h]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [4, q], [2, q]),
          bar4([1, w]),
          bar4([3, q], [5, q], [1, h, 1]),
          bar4([7, q], [6, q], [5, h]),
          bar4([3, q], [2, q], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "The melody begins on 1, cadences there at midpoint, and closes again on a sustained tonic.",
      ),
    ],
  ),
  melody(
    "battle-hymn",
    "Battle Hymn of the Republic",
    108,
    "public-domain",
    "Traditional American camp-meeting tune used for ‘John Brown's Body’ and Julia Ward Howe's 1862 hymn.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [1, q], [7, q, -1]),
          bar4([1, q], [2, q], [3, h]),
          bar4([3, q], [3, q], [2, q], [1, q]),
          bar4([2, h], [5, h, -1]),
          bar4([1, q], [3, q], [5, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Three initial tonic attacks and a final lower-7-to-1 cadence provide strong tonic evidence.",
      ),
    ],
  ),
  melody(
    "scarborough-fair",
    "Scarborough Fair",
    80,
    "traditional",
    "Traditional English ballad tune in a common Dorian-inflected form.",
    [
      phrase(
        [
          bar3([1, q], [1, q], [5, q]),
          bar3([2, h], [1, q]),
          bar3([3, q], [4, q], [3, q]),
          bar3([2, dh]),
          bar3([1, q], [5, q, -1], [1, q]),
          bar3([2, q], [3, q], [2, q]),
          bar3([7, q, -1], [2, q], [7, q, -1]),
          bar3([1, dh]),
        ],
        "context-required",
        "The modal line begins and ends on 1, but its persistent 2 and lower 7 make beginner tonic evidence less direct.",
      ),
    ],
    "minor-cadence",
  ),
  melody(
    "greensleeves",
    "Greensleeves",
    76,
    "public-domain",
    "English Renaissance ballad tune, registered in 1580.",
    [
      phrase(
        [
          bar3([5, q, -1], [1, h]),
          bar3([2, q], [3, q], [4, q]),
          bar3([3, h], [2, q]),
          bar3([7, h, -1], [5, q, -1]),
          bar3([5, q, -1], [1, h]),
          bar3([2, q], [3, q], [2, q]),
          bar3([7, q, -1], [6, q, -1], [7, q, -1]),
          bar3([1, dh]),
        ],
        "context-required",
        "The minor-mode tune frames 1 with lower 7 and 6; its tonic is clear in context but conservative practice should defer it.",
      ),
    ],
    "minor-cadence",
  ),
  melody(
    "minuet-in-g",
    "Minuet in G",
    100,
    "public-domain",
    "Christian Petzold, Minuet in G major from the 1725 Notebook for Anna Magdalena Bach.",
    [
      phrase(
        [
          bar3([5, q], [1, q, 1], [2, q, 1]),
          bar3([3, q, 1], [4, q, 1], [5, q, 1]),
          bar3([1, q], [2, q], [3, q]),
          bar3([4, q], [5, q], [6, q]),
          bar3([5, q], [3, q], [1, q]),
          bar3([2, q], [3, q], [4, q]),
          bar3([3, q], [2, q], [7, q, -1]),
          bar3([1, dh]),
        ],
        "independent",
        "The closing half descends through the tonic triad and resolves lower 7 to a sustained 1.",
      ),
    ],
  ),
  melody(
    "blue-bells-of-scotland",
    "The Blue Bells of Scotland",
    92,
    "traditional",
    "Traditional Scottish song tune popularized in late eighteenth-century print.",
    [
      phrase(
        [
          bar4([5, q, -1], [1, q], [3, q], [5, q]),
          bar4([6, h], [5, h]),
          bar4([3, q], [1, q], [2, q], [3, q]),
          bar4([1, w]),
          bar4([5, q], [5, q], [6, q], [5, q]),
          bar4([3, h], [2, h]),
          bar4([1, q], [2, q], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "The pickup reaches 1, the first half cadences there, and the complete strain closes again on tonic.",
      ),
    ],
  ),
  melody(
    "loch-lomond",
    "The Bonnie Banks o' Loch Lomond",
    80,
    "traditional",
    "Traditional Scottish song, first published in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, q, -1], [1, q], [1, q], [2, q]),
          bar4([3, h], [2, h]),
          bar4([1, q], [3, q], [5, q], [6, q]),
          bar4([5, w]),
          bar4([5, q], [3, q], [1, q], [2, q]),
          bar4([3, q], [2, q], [1, h]),
          bar4([6, q, -1], [5, q, -1], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "The lower-5 pickup reaches 1, the later descent lands there, and the final phrase sustains tonic.",
      ),
    ],
  ),
  melody(
    "down-in-the-valley",
    "Down in the Valley",
    76,
    "traditional",
    "Traditional American folk song and Appalachian standard.",
    [
      phrase(
        [
          bar3([5, q, -1], [1, h]),
          bar3([3, h], [2, q]),
          bar3([1, q], [2, q], [3, q]),
          bar3([2, dh]),
          bar3([5, q, -1], [1, h]),
          bar3([3, q], [5, q], [3, q]),
          bar3([2, q], [7, q, -1], [2, q]),
          bar3([1, dh]),
        ],
        "independent",
        "Both lower-5 pickups resolve to 1 and the closing neighbor figure settles on a long tonic.",
      ),
    ],
  ),
  melody(
    "oh-where-has-my-little-dog-gone",
    "Oh Where, Oh Where Has My Little Dog Gone?",
    104,
    "public-domain",
    "Septimus Winner song, published in 1864, based on an older German folk melody.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [5, q], [5, q]),
          bar4([6, q], [5, q], [3, h]),
          bar4([4, q], [4, q], [2, q], [2, q]),
          bar4([1, w]),
          bar4([5, q], [5, q], [6, q], [5, q]),
          bar4([3, q], [1, q], [2, h]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated opening 1s, a midpoint tonic cadence, and the final leading-tone resolution identify home.",
      ),
    ],
  ),
  melody(
    "for-hes-a-jolly-good-fellow",
    "For He's a Jolly Good Fellow",
    108,
    "traditional",
    "Traditional celebratory song using the eighteenth-century French tune ‘Malbrouck s'en va-t-en guerre’.",
    [
      phrase(
        [
          bar4([5, q, -1], [1, q], [1, q], [2, q]),
          bar4([1, q], [7, q, -1], [1, h]),
          bar4([2, q], [3, q], [3, q], [4, q]),
          bar4([3, h], [2, h]),
          bar4([5, q], [5, q], [3, q], [1, q]),
          bar4([2, q], [3, q], [1, h]),
          bar4([2, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The opening repeatedly returns to 1 and the final lower-7-to-1 motion closes decisively.",
      ),
    ],
  ),
  melody(
    "we-wish-you-a-merry-christmas",
    "We Wish You a Merry Christmas",
    104,
    "traditional",
    "Traditional English carol from the West Country.",
    [
      phrase(
        [
          bar3([5, q, -1], [1, q], [1, q]),
          bar3([2, q], [1, q], [7, q, -1]),
          bar3([6, q, -1], [6, q, -1], [2, q]),
          bar3([2, q], [3, q], [2, q]),
          bar3([1, q], [7, q, -1], [5, q, -1]),
          bar3([3, q], [4, q], [3, q]),
          bar3([2, q], [7, q, -1], [2, q]),
          bar3([1, dh]),
        ],
        "independent",
        "The pickup reaches repeated 1s, and the final lower-7 neighbor figure resolves to sustained tonic.",
      ),
    ],
  ),
  melody(
    "silent-night",
    "Silent Night",
    72,
    "public-domain",
    "Franz Xaver Gruber carol melody, composed in 1818.",
    [
      phrase(
        [
          bar3([5, dq], [6, e], [5, q]),
          bar3([3, dh]),
          bar3([5, dq], [6, e], [5, q]),
          bar3([3, dh]),
          bar3([2, h], [2, q]),
          bar3([7, h, -1], [7, q, -1]),
          bar3([1, h], [1, q]),
          bar3([5, dh, -1]),
          bar3([4, h], [4, q]),
          bar3([1, q, 1], [7, h]),
          bar3([6, q], [5, q], [3, q]),
          bar3([1, dh]),
        ],
        "independent",
        "The later phrase states 1 in two registers and descends 6–5–3–1 to a long tonic.",
      ),
    ],
  ),
  melody(
    "away-in-a-manger",
    "Away in a Manger",
    80,
    "public-domain",
    "Nineteenth-century American carol melody commonly called Mueller.",
    [
      phrase(
        [
          bar3([1, q], [1, q], [4, q]),
          bar3([3, h], [2, q]),
          bar3([1, q], [1, q], [5, q]),
          bar3([4, dh]),
          bar3([3, q], [3, q], [6, q]),
          bar3([5, h], [4, q]),
          bar3([3, q], [2, q], [7, q, -1]),
          bar3([1, dh]),
        ],
        "independent",
        "Repeated opening 1s and the final 3–2–lower-7–1 descent provide clear tonic evidence.",
      ),
    ],
  ),
  melody(
    "good-king-wenceslas",
    "Good King Wenceslas",
    108,
    "public-domain",
    "Traditional spring carol melody ‘Tempus adest floridum’, printed in 1582.",
    [
      phrase(
        [
          bar4([1, q], [1, q], [1, q], [2, q]),
          bar4([1, q], [1, q], [5, h]),
          bar4([3, q], [3, q], [4, q], [3, q]),
          bar4([2, q], [1, q], [2, h]),
          bar4([5, q], [5, q], [3, q], [3, q]),
          bar4([4, q], [4, q], [2, h]),
          bar4([1, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "Repeated opening 1s and the final lower-7-to-1 cadence strongly establish home.",
      ),
    ],
  ),
  melody(
    "the-first-noel",
    "The First Noel",
    80,
    "traditional",
    "Traditional English carol, published in the early nineteenth century.",
    [
      phrase(
        [
          bar3([3, q], [2, q], [1, q]),
          bar3([2, h], [3, q]),
          bar3([4, q], [5, q], [6, q]),
          bar3([5, dh]),
          bar3([6, q], [5, q], [4, q]),
          bar3([3, h], [2, q]),
          bar3([1, q], [2, q], [7, q, -1]),
          bar3([1, dh]),
        ],
        "independent",
        "The opening descends to 1 and the complete strain ends with another tonic arrival.",
      ),
    ],
  ),
  melody(
    "o-come-all-ye-faithful",
    "O Come, All Ye Faithful",
    96,
    "public-domain",
    "Eighteenth-century Latin carol melody traditionally attributed to John Francis Wade.",
    [
      phrase(
        [
          bar4([1, h], [5, h]),
          bar4([1, h, 1], [5, h]),
          bar4([3, q], [2, q], [3, q], [4, q]),
          bar4([3, h], [2, h]),
          bar4([1, q], [7, q, -1], [6, q, -1], [5, q, -1]),
          bar4([2, h], [3, h]),
          bar4([4, q], [3, q], [2, q], [7, q, -1]),
          bar4([1, w]),
        ],
        "independent",
        "The tune opens with tonic octaves and eventually resolves lower 7 to a sustained 1.",
      ),
    ],
  ),
  melody(
    "joy-to-the-world",
    "Joy to the World",
    112,
    "public-domain",
    "Lowell Mason's 1836 hymn tune Antioch, drawing on earlier Handelian material.",
    [
      phrase(
        [
          bar4([1, q, 1], [7, q], [6, q], [5, q]),
          bar4([4, dq], [3, e], [2, h]),
          bar4([1, dq], [2, e], [3, h]),
          bar4([3, dq], [4, e], [5, h]),
          bar4([5, e], [6, e], [5, e], [4, e], [3, q], [2, q]),
          bar4([1, h], [5, h, -1]),
          bar4([1, q], [2, q], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "independent",
        "The opening scale descends from upper 1 and the final phrase returns twice to home.",
      ),
    ],
  ),
  melody(
    "god-rest-ye-merry-gentlemen",
    "God Rest Ye Merry, Gentlemen",
    96,
    "traditional",
    "Traditional English carol melody in a minor mode, printed in the nineteenth century.",
    [
      phrase(
        [
          bar4([5, q, -1], [1, q], [1, q], [7, q, -1]),
          bar4([1, q], [2, q], [3, h]),
          bar4([4, q], [3, q], [2, q], [1, q]),
          bar4([7, h, -1], [5, h, -1]),
          bar4([1, q], [3, q], [5, q], [4, q]),
          bar4([3, q], [2, q], [1, h]),
          bar4([7, q, -1], [6, q, -1], [7, q, -1], [2, q]),
          bar4([1, w]),
        ],
        "context-required",
        "Natural 1 frames the minor-mode phrase, but lower 7 and the modal contour warrant contextual practice.",
      ),
    ],
    "minor-cadence",
  ),
  melody(
    "what-child-is-this",
    "What Child Is This?",
    76,
    "public-domain",
    "William Chatterton Dix's carol sung to the sixteenth-century English tune Greensleeves.",
    [
      phrase(
        [
          bar3([5, q, -1], [1, h]),
          bar3([2, q], [3, q], [4, q]),
          bar3([3, h], [2, q]),
          bar3([7, h, -1], [5, q, -1]),
          bar3([1, q], [2, q], [3, q]),
          bar3([2, q], [1, q], [7, q, -1]),
          bar3([6, q, -1], [7, q, -1], [2, q]),
          bar3([1, dh]),
        ],
        "context-required",
        "The minor-mode cadence reaches 1, but its lower-7 and lower-6 emphasis makes it a contextual example.",
      ),
    ],
    "minor-cadence",
  ),
  melody(
    "twinkle-harmonized",
    "Twinkle, Twinkle, Little Star (harmonized)",
    92,
    "public-domain",
    "Traditional French melody published as ‘Ah! vous dirai-je, maman’ in the eighteenth century, with an original accompaniment written below the tune.",
    [
      phrase(
        [
          polyBar(
            [
              voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
              voiceOf(
                "harmony",
                ev(h, [1, -1], [3, -1], [5, -1]),
                ev(h, [1, -1], [3, -1], [5, -1]),
              ),
            ],
            [region(w, 1)],
          ),
          polyBar(
            [
              voiceOf("melody", ev(q, [6]), ev(q, [6]), ev(h, [5])),
              voiceOf(
                "harmony",
                ev(h, [4, -2], [6, -2], [1, -1]),
                ev(h, [1, -1], [3, -1], [5, -1]),
              ),
            ],
            [region(h, 4), region(h, 1)],
          ),
        ],
        "independent",
        "The opening states 1 twice and the accompaniment keeps a plain I–IV–I underneath it.",
        "independent",
      ),
      phrase(
        [
          polyBar(
            [
              voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [3]), ev(q, [3])),
              voiceOf(
                "harmony",
                ev(h, [4, -2], [6, -2], [1, -1]),
                ev(h, [1, -1], [3, -1], [5, -1]),
              ),
            ],
            [region(h, 4), region(h, 1)],
          ),
          polyBar(
            [
              voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [1])),
              voiceOf(
                "harmony",
                ev(h, [5, -2], [7, -2], [2, -1]),
                ev(h, [1, -1], [3, -1], [5, -1]),
              ),
            ],
            [region(h, 5), region(h, 1)],
          ),
        ],
        "independent",
        "The descent closes on a long 1 over a root-position V–I.",
        "independent",
      ),
    ],
  ),
  melody(
    "cadence-drill-block",
    "Block Triad Drill: I–IV–V–I",
    84,
    "original",
    "Original exercise written for this corpus: four root-position triads struck as blocks.",
    [
      phrase(
        [
          polyBar(
            [
              voiceOf("melody", ev(h, [1]), ev(h, [1])),
              voiceOf(
                "harmony",
                ev(h, [1, -1], [3, -1], [5, -1]),
                ev(h, [4, -2], [6, -2], [1, -1]),
              ),
            ],
            [region(h, 1), region(h, 4)],
          ),
          polyBar(
            [
              voiceOf("melody", ev(h, [2]), ev(h, [1])),
              voiceOf(
                "harmony",
                ev(h, [5, -2], [7, -2], [2, -1]),
                ev(h, [1, -1], [3, -1], [5, -1]),
              ),
            ],
            [region(h, 5), region(h, 1)],
          ),
        ],
        "independent",
        "Every chord holds 1 in the melody or resolves to it, and each triad is struck as one block.",
        "independent",
      ),
    ],
  ),
  melody(
    "cadence-drill-pop",
    "Block Triad Drill: I–V–vi–IV",
    84,
    "original",
    "Original exercise written for this corpus: the four-chord pop progression as block triads.",
    [
      phrase(
        [
          polyBar(
            [
              voiceOf("melody", ev(h, [1]), ev(h, [2])),
              voiceOf(
                "harmony",
                ev(h, [1, -1], [3, -1], [5, -1]),
                ev(h, [5, -2], [7, -2], [2, -1]),
              ),
            ],
            [region(h, 1), region(h, 5)],
          ),
          polyBar(
            [
              voiceOf("melody", ev(h, [3]), ev(h, [1])),
              voiceOf(
                "harmony",
                ev(h, [6, -2], [1, -1], [3, -1]),
                ev(h, [4, -2], [6, -2], [1, -1]),
              ),
            ],
            [region(h, 6, "minor"), region(h, 4)],
          ),
        ],
        "independent",
        "The melody opens and closes on 1 while the harmony turns V to vi rather than home.",
        "independent",
      ),
    ],
  ),
  melody(
    "cadence-drill-inverted",
    "Inverted Cadence Drill",
    84,
    "original",
    "Original exercise written for this corpus: a dominant with its third in the bass resolving to a root-position tonic.",
    [
      phrase(
        [
          polyBar(
            [
              voiceOf("melody", ev(h, [1]), ev(h, [2])),
              voiceOf(
                "harmony",
                ev(h, [1, -1], [3, -1], [5, -1]),
                ev(h, [7, -2], [2, -1], [5, -1]),
              ),
            ],
            [region(h, 1), region(h, 5)],
          ),
          polyBar(
            [
              voiceOf("melody", ev(h, [2]), ev(h, [1])),
              voiceOf(
                "harmony",
                ev(h, [7, -2], [2, -1], [5, -1]),
                ev(h, [1, -1], [3, -1], [5, -1]),
              ),
            ],
            [region(h, 5), region(h, 1)],
          ),
        ],
        "independent",
        "The melody frames the drill with 1, and the dominant sits on its third throughout.",
        "independent",
      ),
    ],
  ),
  melody(
    "turnaround-drill-block",
    "Turnaround Drill: ii–V–I as Blocks",
    84,
    "original",
    "Original exercise written for this corpus: the ii–V–I turnaround struck as block triads.",
    [
      phrase(
        [
          polyBar(
            [
              voiceOf("melody", ev(h, [1]), ev(h, [4])),
              voiceOf(
                "harmony",
                ev(h, [1, -1], [3, -1], [5, -1]),
                ev(h, [2, -1], [4, -1], [6, -1]),
              ),
            ],
            [region(h, 1), region(h, 2, "minor")],
          ),
          polyBar(
            [
              voiceOf("melody", ev(h, [2]), ev(h, [1])),
              voiceOf(
                "harmony",
                ev(h, [5, -2], [7, -2], [2, -1]),
                ev(h, [1, -1], [3, -1], [5, -1]),
              ),
            ],
            [region(h, 5), region(h, 1)],
          ),
        ],
        "independent",
        "The turnaround begins and ends on 1, each chord sounded as one block.",
        "independent",
      ),
    ],
  ),
  melody(
    "turnaround-drill-arpeggiated",
    "Turnaround Drill: ii–V–I Arpeggiated",
    84,
    "original",
    "Original exercise written for this corpus: the same turnaround spelled one note at a time.",
    [
      phrase(
        [
          withHarmony(bar4([2, q], [4, q], [5, q, -1], [7, q, -1]), [
            region(h, 2, "minor"),
            region(h, 5),
          ]),
          withHarmony(bar4([1, q], [3, q], [5, q], [1, q, 1]), [region(w, 1)]),
        ],
        "independent",
        "The same turnaround as the block drill, stated one note at a time and landing on an arpeggiated tonic triad.",
        "independent",
      ),
    ],
  ),
  melody(
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
  ),
];

export const MELODIES: Melody[] = MELODY_CORPUS.map((entry) => {
  const result = normalizeMelody(entry);
  if (!result.ok) throw new Error(result.error);
  return result.value;
});
