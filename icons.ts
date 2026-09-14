import { type RawHtml, raw } from "./vamp.ts";

const ATTRS =
  'viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

function svg(body: string): RawHtml {
  return raw(`<svg xmlns="http://www.w3.org/2000/svg" ${ATTRS}>${body}</svg>`);
}

export function keyIcon(): RawHtml {
  return raw(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.25"/><path d="m9.5 9.5 10.25 10.25" stroke-width="2.4"/><path d="m14.5 14.5 2.6-2.6 2 2-2.6 2.6"/><path d="m11.2 11.2 1.8-1.8"/></svg>',
  );
}

export function playIcon(): RawHtml {
  return raw(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="m7 4 13 8-13 8z"/></svg>',
  );
}

/** A sustained tonal reference: a held tone with radiating waves. */
export function droneIcon(): RawHtml {
  return svg(
    '<path d="M12 8v8"/><path d="M8.5 9.5a4 4 0 0 0 0 5"/><path d="M15.5 9.5a4 4 0 0 1 0 5"/><path d="M5.5 6.5a8 8 0 0 0 0 11"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>',
  );
}

/** Microphone, for listening to the learner's voice. */
export function micIcon(): RawHtml {
  return svg(
    '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3.5"/>',
  );
}

export function chevronIcon(): RawHtml {
  return svg('<path d="m9 18 6-6-6-6"/>');
}

export function questionIcon(): RawHtml {
  return svg(
    '<path d="M8.8 8a3.5 3.5 0 1 1 6.8 1.2c0 2.3-3.6 2.3-3.6 5"/><path d="M12 19h.01"/>',
  );
}

/** GitHub mark, for the source-code link. */
export function githubIcon(): RawHtml {
  return raw(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.24-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.24a11.4 11.4 0 0 1 6 0c2.3-1.56 3.3-1.24 3.3-1.24.66 1.66.25 2.88.12 3.18.77.84 1.24 1.92 1.24 3.24 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"/></svg>',
  );
}
export function checkIcon(): RawHtml {
  return svg('<path d="M20 6 9 17l-5-5"/>');
}
