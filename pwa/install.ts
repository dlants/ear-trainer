export type InstallEnv = {
  /** Already launched from the home screen. */
  standalone: boolean;
  /** iOS has no install prompt, so the instructions have to be spelled out. */
  ios: boolean;
  dismissed: boolean;
};

export const DISMISS_KEY = "install:dismissed";

/**
 * The install step is a first-run screen rather than a banner, because on iOS
 * only a home-screen install is exempt from Safari's storage eviction, and the
 * whole deck lives in localStorage.
 */
export function shouldShowInstall(env: InstallEnv): boolean {
  if (env.standalone) return false;
  return !env.dismissed;
}

export function installEnv(win: Window, storage: Storage): InstallEnv {
  const nav = win.navigator as Navigator & { standalone?: boolean };
  return {
    standalone:
      nav.standalone === true ||
      win.matchMedia?.("(display-mode: standalone)").matches === true,
    ios: /iPad|iPhone|iPod/.test(nav.userAgent),
    dismissed: storage.getItem(DISMISS_KEY) === "1",
  };
}
