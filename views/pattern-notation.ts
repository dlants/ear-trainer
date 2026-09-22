import {
  type Event,
  type Note,
  type Pattern,
  notesHighestFirst,
} from "../music/note.ts";
import {
  Binder,
  cls,
  mountStyle,
  noop,
  ref,
  sanitize,
  showKeyed,
  type View,
} from "../vamp.ts";

const patternNotationClass = cls("pattern-notation");
const notationEventClass = cls("notation-event");
const harmonyEventClass = cls("harmony-event");
const notationNoteClass = cls("notation-note");
const accidentalClass = cls("accidental");
const degreeClass = cls("degree");
const octaveUpClass = cls("octave-up");
const octaveDownClass = cls("octave-down");

mountStyle(`
.${patternNotationClass} {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.18em;
  max-width: 100%;
}
.${patternNotationClass} > li {
  display: flex;
}
.${notationEventClass} {
  display: flex;
  margin: 0;
  list-style: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.04em;
  min-width: 0.72em;
  padding: 0.1em 0.14em;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
  line-height: 0.82;
}
.${notationEventClass}.${harmonyEventClass} {
  padding-block: 0.14em;
}
.${notationEventClass} > li {
  display: flex;
}
.${notationNoteClass} {
  display: inline-flex;
  align-items: baseline;
  white-space: nowrap;
}
.${harmonyEventClass} .${notationNoteClass} {
  font-size: 0.62em;
}
.${accidentalClass} {
  font-size: 0.48em;
}
.${octaveUpClass},
.${octaveDownClass} {
  font-size: 0.28em;
  line-height: 1;
}
.${octaveUpClass} {
  align-self: flex-start;
}
.${octaveDownClass} {
  align-self: flex-end;
}
`);

function accidentalGlyph(note: Note): string {
  return note.alteration === 1 ? "♯" : note.alteration === -1 ? "♭" : "";
}

function octaveGlyphs(note: Note): string {
  return (note.octave > 0 ? "↑" : "↓").repeat(Math.abs(note.octave));
}

class NotationNoteView implements View<Note> {
  container: HTMLElement;
  private b: Binder<Note>;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    initial: Note,
  ) {
    const accidentalRef = ref("accidental");
    const degreeRef = ref("degree");
    const octaveUpRef = ref("octaveUp");
    const octaveDownRef = ref("octaveDown");

    this.container = container;
    container.innerHTML = sanitize`
      <span class="${notationNoteClass}" data-notation-note>
        <span class="${accidentalClass}" data-ref="${accidentalRef}"></span><span class="${degreeClass}" data-ref="${degreeRef}"></span><sup class="${octaveUpClass}" data-ref="${octaveUpRef}"></sup><sub class="${octaveDownClass}" data-ref="${octaveDownRef}"></sub>
      </span>
    `;
    this.b = new Binder(container, initial);
    this.b.bindText(accidentalRef, accidentalGlyph);
    this.b.bindText(degreeRef, (note) => String(note.degree));
    this.b.bindText(octaveUpRef, (note) =>
      note.octave > 0 ? octaveGlyphs(note) : "",
    );
    this.b.bindVisible(octaveUpRef, (note) => note.octave > 0);
    this.b.bindText(octaveDownRef, (note) =>
      note.octave < 0 ? octaveGlyphs(note) : "",
    );
    this.b.bindVisible(octaveDownRef, (note) => note.octave < 0);
  }

  sync(state: Note): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

class NotationEventView implements View<Event> {
  container: HTMLElement;
  private b: Binder<Event>;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    initial: Event,
  ) {
    const notesRef = ref("notes");

    this.container = container;
    container.innerHTML = sanitize`
      <ol class="${notationEventClass}" data-notation-event data-ref="${notesRef}"></ol>
    `;
    this.b = new Binder(container, initial);
    this.b.bindClass(notesRef, (event) =>
      event.notes.length > 1
        ? `${notationEventClass} ${harmonyEventClass}`
        : notationEventClass,
    );
    this.b.bindList(notesRef, "li", (event) =>
      notesHighestFirst(event.notes).map((note, index) =>
        showKeyed(
          `${index}:${note.alteration}:${note.degree}:${note.octave}`,
          NotationNoteView,
          note,
          {},
          noop,
        ),
      ),
    );
  }

  sync(state: Event): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}

export class PatternNotationView implements View<Pattern> {
  container: HTMLElement;
  private b: Binder<Pattern>;

  constructor(
    container: HTMLElement,
    _dispatch: (msg: never) => void,
    initial: Pattern,
  ) {
    const eventsRef = ref("events");

    this.container = container;
    container.innerHTML = sanitize`
      <ol class="${patternNotationClass}" aria-label="note pattern" data-ref="${eventsRef}"></ol>
    `;
    this.b = new Binder(container, initial);
    this.b.bindList(eventsRef, "li", (pattern) =>
      pattern.events.map((event, index) =>
        showKeyed(
          `${index}:${event.notes.map((note) => `${note.alteration}:${note.degree}:${note.octave}`).join("+")}`,
          NotationEventView,
          event,
          {},
          noop,
        ),
      ),
    );
  }

  sync(state: Pattern): void {
    this.b.sync(state);
  }

  destroy(): void {
    this.b.cleanup();
    this.container.innerHTML = "";
  }
}
