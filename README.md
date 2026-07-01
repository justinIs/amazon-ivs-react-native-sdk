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

```sh
pnpm install
pnpm example android      # builds the library + example, installs on device/emulator
pnpm example start        # start Metro (if it didn't auto-start)
```

Expected: the app shows the native SDK version, prompts for camera permission, renders
the live front-camera preview in an RN-styled rounded card, and the flip button
switches cameras.

### pnpm note

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
