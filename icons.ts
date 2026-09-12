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

export function questionIcon(): RawHtml {
  return svg(
    '<path d="M8.8 8a3.5 3.5 0 1 1 6.8 1.2c0 2.3-3.6 2.3-3.6 5"/><path d="M12 19h.01"/>',
  );
}

export function checkIcon(): RawHtml {
  return svg('<path d="M20 6 9 17l-5-5"/>');
}
