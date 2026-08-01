# Troubleshooting

## Black or frozen preview

- **Permissions**: Confirm camera is `granted` via `getCameraPermission()`. Denied needs Settings.
- **Preview before devices**: Call `prepareDevices({ camera: true })` or `requestPermissions()` before showing `IVSLocalPreviewView` if preview stays black.
- **Unmount while publishing**: Do not unmount `IVSLocalPreviewView` while `publishEnabled` — it churns the IVS camera session and can crash. Hide with an overlay instead (see example app).
- **Simulator**: iOS Simulator camera is limited; use a physical device for camera QA.

## Android emulator

- Use an x86_64 or arm64 system image with **Google APIs**.
- Set `reactNativeArchitectures=arm64-v8a` (or match your AVD ABI) if builds fail with ABI mismatch.
- Emulator GPU mode **Automatic** or **Hardware** — software GLES can break camera preview.
- minSdk **28** required; older AVD images will not install.

## iOS build / pod install

- **`RCT_NEW_ARCH_ENABLED`**: Must be `1` for this SDK. Clean `ios/Pods` and reinstall if codegen errors mention missing spec.
- **AmazonIVSBroadcastStages**: Ensure the vendored podspec line is in the **app** Podfile (see [getting-started.md](getting-started.md)).
- **M1/M2 vs Intel**: If pod install fails on xcframework slice, delete `Pods`, `Podfile.lock`, and rebuild.
- **Camera on simulator**: Expected limitations; test preview on device.

## Native module not linked

Error: native module not linked — rebuild the app.

1. Stop Metro
2. iOS: `cd ios && pod install && cd ..` then rebuild in Xcode
3. Android: `cd android && ./gradlew clean && cd ..` then `yarn android`
4. Confirm `newArchEnabled=true` / `RCT_NEW_ARCH_ENABLED=1`

## Join fails immediately

- Token expired or wrong stage ARN — mint a fresh token with `./scripts/ivs token`
- Viewer token without publish capability — use `join(token, { publish: false })` or a token with `PUBLISH`
- `stage-in-use` — only one active `IVSStage` per process; call `leave()` or `dispose()` first

## No remote video

- Remote participant must be **published** (`publishState === 'published'`)
- Check subscribe type is not `none`
- Confirm `participantId` matches `IVSParticipantVideoView` prop

## Audio in wrong output

- Default is `auto` — IVS preset drives route. For explicit control, call `setAudioOutput`.
- Viewer apps: try preset `subscribe-only`
- See [audio.md](audio.md)

## Metro / monorepo

The example resolves the library via `amazon-ivs-react-native-sdk-source` condition in `example/metro.config.js`. If imports fail during example dev:

```bash
yarn install
yarn prepare   # bob build
```

## Still stuck?

Open an issue with platform, RN version, New Arch enabled, native SDK version from `getSdkVersion()`, and redacted logs (never paste tokens).
