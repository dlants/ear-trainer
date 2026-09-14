import type { AudioEngine } from "../audio/engine.ts";
import { initialState, StartView } from "../views/start.ts";

new StartView(
  document.body,
  (message) => {
    if (message.type !== "UNLOCK") return;
    const context = new AudioContext();
    void context.resume().then(() => console.log(`unlock:${context.state}`));
  },
  initialState(),
  { audio: {} as AudioEngine },
);
