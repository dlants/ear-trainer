# Testing

`npm test` runs the main suite in desktop Chromium plus the focused `*.activation.test.ts` probe in WebKit. Pure-logic suites import their module directly and run in Node; anything touching the DOM runs its body inside `page.evaluate` against `test/blank.html`, importing the real modules through the Vite dev server, with assertions back in Node. Shared browser-side fixtures live in `test/*-harness.ts`; `test/support.ts` holds `fn()` and `fakeTimers()`. Install both browser engines with `npx playwright install chromium webkit`.

The WebKit activation probe holds a trusted touch tap between `pointerdown` and `pointerup` and demonstrates that `AudioContext.resume()` remains suspended when invoked from `pointerdown`, while a context resumed from the resulting `click` reaches `running`. It reports through browser console events because a later `page.evaluate()` can itself carry automation's user-gesture flag and invalidate the observation. This proves the event-boundary mechanism in a real browser engine; it does not reproduce the exact Android Chrome hang.

## Android

`npm run test:android` runs `android/*.android.ts` against real Chrome on an attached device or emulator, over adb. This layer exists because desktop Chromium — even with `hasTouch` and a device descriptor — synthesizes input through the desktop gesture path, so touch-specific and activation-specific behavior does not reproduce there.

Local setup, one time:

- `brew install openjdk` and `brew install --cask android-commandlinetools`. Use the `openjdk` formula rather than the `temurin` cask, which needs an interactive sudo password.
- `sdkmanager "platform-tools" "emulator" "platforms;android-35" "system-images;android-35;google_apis;arm64-v8a"` with `ANDROID_HOME=/opt/homebrew/share/android-commandlinetools` and `JAVA_HOME=/opt/homebrew/opt/openjdk`.
- `avdmanager create avd -n ear-trainer -k "system-images;android-35;google_apis;arm64-v8a"`.

Booting it:

- `emulator -avd ear-trainer -no-window -no-audio -no-snapshot -gpu swiftshader_indirect -no-boot-anim`
- `adb shell input keyevent KEYCODE_WAKEUP && adb shell settings put system screen_off_timeout 2147483647`. **Without this the screen sleeps and OS-level taps are silently dropped** — events never reach the page and tests fail with no visible cause.

Two traps worth remembering:

- `page.tap()` on an Android page dispatches through CDP, which is not the device's real input pipeline. `tapElement` in `android/fixtures.ts` uses `adb shell input tap` at device pixels instead, offsetting for Chrome's toolbar.
- The emulator's Chrome does not enforce the autoplay policy: an `AudioContext` is `running` with no user gesture at all, and `navigator.userActivation.isActive` is true on a fresh page. So this layer can catch a hang or a crash in the unlock flow, but it cannot prove activation gating is correct. That one still needs a real device.
