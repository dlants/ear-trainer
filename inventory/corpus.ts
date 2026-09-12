import type { Context } from "../music/note.ts";

/**
 * Melodies in degree notation, one event per melodic note. Transcribed by ear
 * against the tonic; the key is unambiguous for this repertoire. This is the
 * input to `scripts/derive-inventory.ts` and, later, the song view.
 */
export type CorpusMelody = {
  id: string;
  title: string;
  context: Context;
  melody: string;
};

export const CORPUS: CorpusMelody[] = [
  {
    id: "twinkle",
    title: "Twinkle, Twinkle, Little Star",
    context: "major-cadence",
    melody:
      "1-1-5-5-6-6-5-4-4-3-3-2-2-1-5-5-4-4-3-3-2-5-5-4-4-3-3-2-1-1-5-5-6-6-5-4-4-3-3-2-2-1",
  },
  {
    id: "mary",
    title: "Mary Had a Little Lamb",
    context: "major-cadence",
    melody: "3-2-1-2-3-3-3-2-2-2-3-5-5-3-2-1-2-3-3-3-3-2-2-3-2-1",
  },
  {
    id: "happy-birthday",
    title: "Happy Birthday",
    context: "major-cadence",
    melody: "5v-5v-6v-5v-1-7v-5v-5v-6v-5v-2-1-5v-5v-5-3-1-7v-4-4-3-1-2-1",
  },
  {
    id: "ode-to-joy",
    title: "Ode to Joy",
    context: "major-cadence",
    melody: "3-3-4-5-5-4-3-2-1-1-2-3-3-2-2-3-3-4-5-5-4-3-2-1-1-2-3-2-1-1",
  },
  {
    id: "row-your-boat",
    title: "Row, Row, Row Your Boat",
    context: "major-cadence",
    melody: "1-1-1-2-3-3-2-3-4-5-1^-1^-1^-5-5-5-3-3-3-1-1-1-5-4-3-2-1",
  },
  {
    id: "jingle-bells",
    title: "Jingle Bells",
    context: "major-cadence",
    melody: "3-3-3-3-3-3-3-5-1-2-3-4-4-4-4-4-3-3-3-3-2-2-3-2-5",
  },
  {
    id: "frere-jacques",
    title: "Frère Jacques",
    context: "major-cadence",
    melody: "1-2-3-1-1-2-3-1-3-4-5-3-4-5-5-6-5-4-3-1-5-6-5-4-3-1-1-5v-1-1-5v-1",
  },
  {
    id: "london-bridge",
    title: "London Bridge",
    context: "major-cadence",
    melody: "5-6-5-4-3-4-5-2-3-4-3-4-5-5-6-5-4-3-4-5-2-5-3-1",
  },
  {
    id: "old-macdonald",
    title: "Old MacDonald Had a Farm",
    context: "major-cadence",
    melody: "1-1-1-5v-6v-6v-5v-3-3-2-2-1-5-1-1-1-5v-6v-6v-5v-3-3-2-2-1",
  },
  {
    id: "hot-cross-buns",
    title: "Hot Cross Buns",
    context: "major-cadence",
    melody: "3-2-1-3-2-1-1-1-1-1-2-2-2-2-3-2-1",
  },
  {
    id: "yankee-doodle",
    title: "Yankee Doodle",
    context: "major-cadence",
    melody: "1-1-2-3-1-3-2-5v-1-1-2-3-1-7v-1-1-2-3-4-3-2-1-7v-5v-6v-7v-1-1",
  },
  {
    id: "this-old-man",
    title: "This Old Man",
    context: "major-cadence",
    melody: "5-3-5-5-3-5-6-5-4-3-2-3-4-1-1-1-2-3-4-5-3-1-2-7v-2-1",
  },
];
