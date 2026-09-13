import type { AudioEngine } from "./audio/engine.ts";
import { DISMISS_KEY, installEnv, shouldShowInstall } from "./pwa/install.ts";
import { AboutView } from "./views/about.ts";
import { DismissStack } from "./views/dropdown.ts";
import { InstallView } from "./views/install.ts";

export type StartupOptions = {
  container: HTMLElement;
  audio: AudioEngine;
  window: Window;
  storage: Storage;
  ready(audio: AudioEngine): void;
};

export function startStartup(options: StartupOptions): void {
  const { container, audio, window, storage, ready } = options;
  const dismissStack = new DismissStack();
  const pathname =
    (window.location?.pathname ?? "/").replace(/\/+$/, "") || "/";
  if (pathname === "/about") {
    new AboutView(container, () => {}, {}, { dismissStack });
    return;
  }

  const installState = { env: installEnv(window, storage) };
  if (!shouldShowInstall(installState.env)) {
    ready(audio);
    return;
  }

  const installView = new InstallView(
    container,
    () => {
      storage.setItem(DISMISS_KEY, "1");
      installView.destroy();
      ready(audio);
    },
    installState,
  );
}
