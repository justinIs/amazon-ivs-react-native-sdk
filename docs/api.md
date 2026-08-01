# API reference

The public API is exported from `amazon-ivs-react-native-sdk` and documented inline with **TSDoc** in `src/`.

## Where to look

| Area | Source |
| --- | --- |
| Entry point | [`src/index.tsx`](../src/index.tsx) |
| Imperative core | [`src/core/IVSStage.ts`](../src/core/IVSStage.ts), [`src/core/types.ts`](../src/core/types.ts) |
| React provider | [`src/react/IVSStageProvider.tsx`](../src/react/IVSStageProvider.tsx) |
| Hooks | [`src/react/hooks.ts`](../src/react/hooks.ts) |
| Views | [`src/react/IVSLocalPreviewView.tsx`](../src/react/IVSLocalPreviewView.tsx), [`src/react/IVSParticipantVideoView.tsx`](../src/react/IVSParticipantVideoView.tsx) |
| Native contract | [`src/spec/NativeAmazonIvsRealTime.ts`](../src/spec/NativeAmazonIvsRealTime.ts) |

## Generated docs (future)

Typedoc from `src/` can produce HTML API docs. Not wired in CI yet — use IDE hover on exports or read TSDoc at source.

## Quick export map

**Core**

- `IVSStage`, `IVSError`
- `getSdkVersion`, `getCapabilities`, `enumerateDevices`
- `getCameraPermission`, `getMicrophonePermission`, `requestCameraPermission`, `requestMicrophonePermission`

**React**

- `IVSStageProvider`, `IVSLocalPreviewView`, `IVSParticipantVideoView`
- `useStage`, `useParticipants`, `useParticipantStreams`, `useLocalMedia`, `useAudioRoute`, `useStageEvent`, `useStageContext`

**Types**

- `IVSParticipantInfo`, `IVSStageStreamInfo`, `IVSAudioRoute`, `JoinOptions`, `SubscribeType`, `PermissionStatus`, `AudioOutput`, `AudioPreset`, …

Deprecated aliases (`setPublishing`, `setMicrophoneMuted`, `switchCamera`) remain until 1.0.0 — prefer `setPublishEnabled`, `setMicrophoneEnabled`, `flipCamera`.

## Example

The [example app](../example/src/App.tsx) exercises the full surface: permissions, lobby preview, watch/go-live, grid, dock, subscribe cycling, audio picker, renew token.

See also [architecture.md](architecture.md) and [getting-started.md](getting-started.md).
