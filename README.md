# amazon-ivs-react-native-sdk

React Native SDK wrapping the **Amazon IVS Real-Time (Stages)** native SDKs for
building real-time video-calling apps.

**Status: Android proof-of-concept.** Proves the native IVS Android SDK
(`com.amazonaws:ivs-broadcast:1.43.0`) works inside a React Native New-Architecture
module: device enumeration + live local camera preview positioned with RN styles.
No Stage join/publish yet; iOS is being PoC'd separately. See [Roadmap](#roadmap).

## Quick start

Prerequisites:

- **Node ≥ 22** (`nvm use` picks up `.nvmrc`) and **pnpm** (`corepack enable`)
- **JDK 17** — AGP rejects newer JDKs
- **Android SDK** and a device or emulator running Android 9+ (API 28, required by
  the IVS SDK). A physical device is best for real camera behaviour.

Point your shell at the SDK/JDK, then install and run:

```sh
export ANDROID_HOME="$HOME/Android/Sdk"    # your Android SDK location
export JAVA_HOME="/path/to/jdk-17"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

pnpm install              # once
pnpm example start        # terminal A: Metro (leave running)
pnpm example android      # terminal B: build + install + launch (wires adb reverse)
```

Tip: keep those exports in a gitignored `env.sh` at the repo root and
`source env.sh` per shell instead of retyping them.

Expected: the app shows "Native SDK version: 1.43.0", asks for camera/mic
permission, renders a live front-camera preview in an RN-styled card, lists the
discovered devices, and the Flip button switches cameras.

Other everyday commands (repo root):

```sh
pnpm typecheck            # tsc over library + example
pnpm lint                 # eslint
pnpm clean                # remove android/example build output and lib/
```

Tips:

- **Faster builds:** set `reactNativeArchitectures=arm64-v8a` in
  `example/android/gradle.properties` (most phones are arm64). The first native
  build takes a few minutes; later builds are fast.
- Both an emulator and a phone connected? Target one:
  `pnpm example android -- --device <serial-from-adb-devices>`.

## Usage

```tsx
import {
  CameraPreview,
  getSdkVersion,
  enumerateDevices,
} from 'amazon-ivs-react-native-sdk';

const version = await getSdkVersion();      // smoke-test the native lib loaded
const devices = await enumerateDevices();   // after camera permission is granted

<CameraPreview position="front" aspectMode="fill" style={{ flex: 1 }} />;
```

Request `CAMERA` (and `RECORD_AUDIO`) at runtime before showing the preview —
`example/src/App.tsx` is a complete working screen.

| Export | Kind | Description |
| --- | --- | --- |
| `getSdkVersion(): Promise<string>` | module | Version of the native IVS SDK. |
| `enumerateDevices(): Promise<DeviceInfo[]>` | module | Local cameras + microphones. |
| `<CameraPreview />` | component | Live local camera preview. Props: `position` (`'front'`\|`'back'`), `mirror` (defaults true for front), `aspectMode` (`'fill'`\|`'fit'`), plus all `ViewProps`. |
| `<IvsStageProvider>` / `useIvsStage()` | component/hook | Join an IVS Stage with a participant token and observe `connectionState`, `participants`, and an event `log`. |

### Connecting to a Stage

Wrap your tree in `<IvsStageProvider>` and drive it with `useIvsStage()`:

```tsx
import { IvsStageProvider, useIvsStage } from 'amazon-ivs-react-native-sdk';

function StageControls() {
  const { connectionState, participants, log, join, leave } = useIvsStage();
  // join(token) with an AWS-issued participant token; watch connectionState.
}
```

Joining needs a **participant token** minted by AWS (`CreateParticipantToken`) —
the app can't generate one. Use the helper CLI to create stages and tokens:

```sh
cp scripts/ivs.env.example scripts/ivs.env   # set AWS_PROFILE/region, edit defaults
./scripts/ivs create-stage my-stage          # prints a stage ARN → set IVS_STAGE_ARN
./scripts/ivs token --user-id alice --username "Alice"   # prints a token to paste
```

Run `./scripts/ivs help` for all commands. This milestone connects and observes
events only; publishing local media and rendering remote streams come next.

## CI, releases & installing in other apps

`.github/workflows/build.yml` runs on every push/PR: typecheck, lint, packs the
library tarball, and builds the example **release APK** (JS bundle embedded — no
Metro needed; arm64-v8a + armeabi-v7a). Download both from the workflow run's
**Artifacts**. The APK is signed with the standard RN debug keystore: fine for
sideloading/testing, not for store distribution.

Pushing a version tag additionally publishes a GitHub Release with the tarball
and APK attached:

```sh
git tag v0.1.0 && git push origin v0.1.0
```

Other projects can then install the library straight from the release URL:

```sh
pnpm add https://github.com/justinIs/amazon-ivs-react-native-sdk/releases/download/v0.1.0/amazon-ivs-react-native-sdk-0.1.0.tgz
```

## Running on a device or emulator

### Physical device

Enable Developer options → USB debugging, plug in via USB and accept the debugging
prompt, confirm it appears in `adb devices`, then run the Quick start commands.

### Emulator

**Setup (once).** Install the tools + a system image, then create an AVD. Pick the
system-image ABI that matches your **host CPU** — `x86_64` on Intel/AMD, `arm64-v8a`
on Apple Silicon (an emulator on a mismatched ABI is unusably slow):

```sh
yes | sdkmanager --licenses
sdkmanager "platform-tools" "emulator" \
  "platforms;android-35" "build-tools;36.0.0" \
  "system-images;android-35;google_apis;x86_64"
echo no | avdmanager create avd -n ivs-poc -d pixel_6 \
  -k "system-images;android-35;google_apis;x86_64"
```

**Start it up.** Launch the emulator and leave it running, then build in another
terminal:

```sh
emulator -list-avds                    # names you can launch
emulator -avd ivs-poc -gpu host -no-snapshot \
  -camera-back virtualscene -camera-front emulated &
adb wait-for-device                    # block until it's up
pnpm example start                     # Metro (own terminal)
pnpm example android                   # build + install
```

What the flags do: `-gpu host` renders on the real GPU (see the gotcha below);
`-no-snapshot` boots clean instead of restoring a saved state; `-camera-*` give the
AVD virtual cameras so the preview shows a synthetic scene (`virtualscene` is a 3-D
room, `emulated` an animated test pattern) instead of a black frame.

> **GPU gotcha (host-specific):** always pass `-gpu host`. The software renderer
> (`-gpu swiftshader_indirect`) segfaults on boot on some hosts — windowed and
> headless — and an AVD created by Android Studio often bakes that mode into its
> `config.ini`, so the `-gpu host` flag is what overrides it. If your host has no
> usable GPU, try `-gpu angle_indirect`.

Emulator setup **is environment-specific**: the system-image ABI follows your CPU,
the working GPU backend depends on your hardware/drivers, and AVD names are whatever
you created (`emulator -list-avds` shows them). If `-list-avds` is empty but you know
an AVD exists, its files are likely outside `~/.android/avd` — point `ANDROID_AVD_HOME`
at that directory (this repo's local `env.sh` does exactly that for the bundled AVD).

### Manual build / standalone APK

What `pnpm example android` does under the hood — useful for CI or driving by hand:

```sh
cd example/android
./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081        # let the device reach Metro
adb shell am start -n ivsrealtime.example/.MainActivity
```

`./gradlew :app:assembleRelease` embeds the JS bundle (no Metro needed).

## Architecture

Three thin layers, each with a single responsibility. React Native **codegen**
generates the type-safe bridge between the JS specs and Kotlin
(New Architecture: TurboModule + Fabric).

```
JS/TS  (src/)
  index.tsx                            public API surface (re-exports)
  CameraPreview.tsx                    ergonomic RN component wrapper
  IvsCameraPreviewNativeComponent.ts   Fabric view codegen spec
  NativeIvsRealtime.ts                 TurboModule codegen spec
  types.ts                             shared public types

Native Android  (android/src/main/java/com/ivsrealtime/)
  IvsRealtimeModule.kt                 TurboModule: getSdkVersion, enumerateDevices
  IvsCameraPreviewView.kt              hosts the IVS ImagePreviewView
  IvsCameraPreviewViewManager.kt       Fabric ViewManager (codegen-backed)
  IvsDevices.kt                        shared DeviceDiscovery singleton
  IvsRealtimePackage.kt                registers the module + view manager
```

## pnpm / monorepo notes

- `pnpm-workspace.yaml` sets `nodeLinker: hoisted` so Metro, autolinking, and
  native-module resolution get the flat `node_modules` React Native expects.
  (pnpm 10+ reads settings from that file, **not** `.npmrc`.) All packages land
  in the repo-root `node_modules` — there is no `example/node_modules`.
- Gradle can't use Node module resolution, so the Android build pins paths to
  the root `node_modules`: `example/android/settings.gradle` (gradle plugin)
  and the `react {}` block in `example/android/app/build.gradle`
  (`reactNativeDir`, `codegenDir`, `cliFile`, `hermesCommand`).
- `example/` declares `@react-native/gradle-plugin` and `@react-native/codegen`
  as direct devDependencies so those path-referenced packages are installed at
  the pinned `react-native` version.

## Roadmap

- [x] Android: local device enumeration + local camera preview
- [ ] Android: join a Stage (token/connect), publish local media, subscribe to remote participants
- [ ] Error/state events surfaced to JS
- [ ] iOS parity (IVS iOS SDK)

## License

MIT
