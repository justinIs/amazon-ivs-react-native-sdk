# react-native-ivs-realtime

A React Native SDK that wraps the **Amazon IVS Real-Time (Stages)** native SDK for
building real-time video-calling apps.

**Status: Android proof-of-concept.** This milestone proves we can load the native
IVS Android SDK inside a React Native native module and drive the on-device APIs —
enumerate cameras/mics and render a live **local camera preview** positioned with
React Native. It deliberately does **not** join or publish to a Stage yet, and iOS
is not implemented. The structure is set up to grow into that (see [Roadmap](#roadmap)).

- Package name: `react-native-ivs-realtime`
- Native module: `IvsRealtime` (TurboModule)
- Native view: `<CameraPreview />` (Fabric component, codegen name `IvsCameraPreview`)
- Architecture: React Native **New Architecture** (Turbo + Fabric)
- Android IVS SDK: `com.amazonaws:ivs-broadcast:1.43.0` (Maven Central), **minSdk 28 / Android 9+**

## Architecture

Three thin layers, each with a single responsibility:

```
JS/TS  (src/)
  index.tsx                       public API surface (re-exports)
  CameraPreview.tsx               ergonomic RN component wrapper
  IvsCameraPreviewNativeComponent.ts   Fabric view codegen spec
  NativeIvsRealtime.ts            TurboModule codegen spec
  types.ts                        shared public types

Native Android  (android/src/main/java/com/ivsrealtime/)
  IvsRealtimeModule.kt            TurboModule: getSdkVersion, enumerateDevices
  IvsCameraPreviewView.kt         hosts the IVS ImagePreviewView
  IvsCameraPreviewViewManager.kt  Fabric ViewManager (codegen-backed)
  IvsRealtimePackage.kt           registers the module + view manager
```

React Native **codegen** generates the type-safe bridge between the JS specs and the
Kotlin (`NativeIvsRealtimeSpec`, `IvsCameraPreviewManagerInterface`/`Delegate`).

## Usage

```tsx
import {
  CameraPreview,
  getSdkVersion,
  enumerateDevices,
} from 'react-native-ivs-realtime';

// Smoke-test that the native lib loaded:
const version = await getSdkVersion();

// List local cameras/mics (after camera permission is granted):
const devices = await enumerateDevices();

// Live local preview — size/position it with normal RN styles:
<CameraPreview position="front" aspectMode="fill" style={{ flex: 1 }} />;
```

Request `CAMERA` (and `RECORD_AUDIO`) at runtime before showing the preview. See
`example/src/App.tsx` for a complete working screen.

### API

| Export | Kind | Description |
| --- | --- | --- |
| `getSdkVersion(): Promise<string>` | module | Version of the native IVS SDK. |
| `enumerateDevices(): Promise<DeviceInfo[]>` | module | Local cameras + microphones. |
| `<CameraPreview />` | component | Live local camera preview. Props: `position` (`'front'`\|`'back'`), `mirror` (defaults true for front), `aspectMode` (`'fill'`\|`'fit'`), plus all `ViewProps`. |

## Requirements

- Node ≥ 22 and **pnpm** (`corepack enable` to get the pinned version)
- **JDK 17** (the Android Gradle Plugin does not support newer JDKs)
- Android SDK with an API 28+ emulator or a physical Android 9+ device (a physical
  device is recommended for real camera behaviour)

## Build & run

First install JS deps (once):

```sh
pnpm install
```

Set up your shell so the Android SDK tools are on `PATH` (adjust `ANDROID_HOME` to your
SDK, and use a **JDK 17** — AGP rejects newer JDKs):

```sh
export ANDROID_HOME="$HOME/Android/Sdk"          # your Android SDK location
export JAVA_HOME="/path/to/jdk-17"               # a JDK 17
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Then run the example with a device or emulator connected:

```sh
pnpm example start        # terminal A: Metro (leave running)
pnpm example android      # terminal B: build + install + launch (also wires adb reverse)
```

Expected: the app shows "Native SDK version: 1.43.0", prompts for camera/mic permission,
renders the live front-camera preview in an RN-styled rounded card, lists the discovered
devices, and the Flip button switches cameras.

### Run on a physical Android device

1. On the phone, enable **Developer options** (Settings → About phone → tap **Build
   number** 7×), then **Developer options → USB debugging**.
2. Plug in via USB and tap **Allow** on the "Allow USB debugging?" prompt.
3. Confirm it's visible: `adb devices` → your phone shows as `device`.
4. `pnpm example start` (terminal A) and `pnpm example android` (terminal B). Accept the
   camera/mic permission prompt on the phone.

Tips:
- The first native build compiles for your ABI (arm64) via NDK/CMake — a few minutes;
  subsequent builds are fast.
- **Faster builds:** set `reactNativeArchitectures=arm64-v8a` in
  `example/android/gradle.properties` (most phones are arm64).
- If both an emulator and a phone are connected, target one:
  `pnpm example android -- --device <serial-from-adb-devices>`.

### Run on an emulator (with first-time setup)

Install the emulator, a system image, and platform/build tools (accept licenses):

```sh
yes | sdkmanager --licenses
sdkmanager "platform-tools" "emulator" \
  "platforms;android-35" "build-tools;36.0.0" \
  "system-images;android-35;google_apis;x86_64"
```

Create an AVD:

```sh
echo no | avdmanager create avd -n ivs-poc -d pixel_6 \
  -k "system-images;android-35;google_apis;x86_64"
```

(Optional) give it emulated cameras so the preview shows a test image — add to
`~/.android/avd/ivs-poc.avd/config.ini`:

```ini
hw.camera.back=virtualscene
hw.camera.front=emulated
```

Start the emulator:

```sh
emulator -avd ivs-poc -gpu host -no-snapshot \
  -camera-back virtualscene -camera-front emulated
```

> **GPU gotcha (important):** use **`-gpu host`** (the real GPU). During this project the
> software renderer `-gpu swiftshader_indirect` **segfaulted on boot** — both windowed and
> headless (`-no-window`). SwiftShader was the crashing path; `-gpu host` boots reliably.
> If your host truly has no usable GPU, try `-gpu angle_indirect` as an alternative.

Wait for boot, then run the app:

```sh
adb wait-for-device
adb shell 'while [ "$(getprop sys.boot_completed)" != 1 ]; do sleep 1; done'
pnpm example start        # terminal A
pnpm example android      # terminal B
```

The emulator exposes a *virtual* camera (an animated scene), so the preview shows that
synthetic feed rather than a real camera.

### Manual build / standalone APK

What `pnpm example android` does under the hood — useful for CI or driving a device by hand:

```sh
cd example/android
./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081                       # let the device reach Metro
adb shell am start -n ivsrealtime.example/.MainActivity
```

For a self-contained build that doesn't need Metro, use `./gradlew :app:assembleRelease`
(embeds the JS bundle).

### pnpm notes

This repo uses pnpm with `node-linker=hoisted` (see `.npmrc`) so Metro, autolinking,
and native-module resolution get the flat `node_modules` React Native expects. Two RN
build-time packages are declared as explicit `example/` devDependencies because pnpm
(unlike Yarn) won't symlink transitive deps into `example/node_modules`, and the
Android build references them by literal path — keep them pinned to the `react-native`
version:

- `@react-native/gradle-plugin` — used by `example/android/settings.gradle`
- `@react-native/codegen` — used by the library's codegen task

## Roadmap

- [x] Android: local device enumeration + local camera preview
- [ ] Android: join a Stage (token/connect), publish local media, subscribe to remote participants
- [ ] Error/state events surfaced to JS
- [ ] iOS parity (IVS iOS SDK)

## License

MIT
