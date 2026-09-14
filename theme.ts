import { mountStyle, pressedClass } from "./vamp.ts";

mountStyle(`
:root {
  color-scheme: light;

  --color-canvas: #f7f8f5;
  --color-surface: #ffffff;
  --color-text: #1c2820;
  --color-text-muted: #657168;
  --color-border: #d7ded8;

  --color-playback-sweep: #dcecdf;
  --color-playback-active: #c9e1ce;

  --color-brand: #285c3a;
  --color-brand-strong: #1f4930;
  --color-brand-active: #3c704e;
  --color-brand-surface: #edf5ee;
  --color-brand-border: #79a984;

  --color-unsure: #355f7a;
  --color-unsure-surface: #eaf2f7;
  --color-unsure-border: #8aabba;

  --color-incorrect: #843b38;
  --color-incorrect-surface: #f8e9e7;
  --color-incorrect-border: #c98b85;

  --color-correct: #215c36;
  --color-correct-surface: #e2f1e6;
  --color-correct-border: #69a47a;

  --radius-control: 12px;
  --focus-ring: 0 0 0 3px rgb(53 95 122 / 28%);
}

html {
  background: var(--color-canvas);
}

body {
  margin: 0;
  background: var(--color-canvas);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
}

/* Desktop: keep the single-column mobile layout centered. Containment makes #app
   the containing block for the position:fixed nav/corner chrome so they stay
   pinned to the column rather than the window. */
#app {
  max-width: 480px;
  margin-inline: auto;
  min-height: 100dvh;
  contain: layout paint;
}

@media (min-width: 481px) {
  #app {
    border-inline: 1px solid var(--color-border);
  }
}

button,
input {
  font: inherit;
}

summary {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
button {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Immediate press feedback: handlers fire on pointerdown, so the control must
   look pressed in the same frame as the touch. onPress toggles this class,
   since CSS :active is delayed on touch. */
.${pressedClass}:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(1px);
}

@media (prefers-reduced-motion: reduce) {
  .${pressedClass}:not(:disabled) {
    transform: none;
  }
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
`);
