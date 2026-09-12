import type { AudioEngine } from "./audio/engine.ts";
import { DISMISS_KEY, installEnv, shouldShowInstall } from "./pwa/install.ts";
import { InstallView } from "./views/install.ts";
import {
  type Msg as StartMsg,
  StartView,
  initialState as startInitialState,
  update as startUpdate,
} from "./views/start.ts";

export type StartupOptions = {
  container: HTMLElement;
  audio: AudioEngine;
  window: Window;
  storage: Storage;
  ready(audio: AudioEngine): void;
};

export function startStartup(options: StartupOptions): void {
  const { container, audio, window, storage, ready } = options;

  const mountAudioGate = (): void => {
    const state = startInitialState();
    let view: StartView;
    let complete = false;
    const dispatch = (msg: StartMsg): void => {
      if (complete) return;
      startUpdate(state, msg, { audio }, dispatch);
      if (msg.type === "UNLOCKED") {
        complete = true;
        view.destroy();
        ready(audio);
        return;
      }
      view.sync(state);
    };
    view = new StartView(container, dispatch, state);
  };

  const installState = { env: installEnv(window, storage) };
  if (!shouldShowInstall(installState.env)) {
    mountAudioGate();
    return;
  }

  const installView = new InstallView(
    container,
    () => {
      storage.setItem(DISMISS_KEY, "1");
      installView.destroy();
      mountAudioGate();
    },
    installState,
  );
}
