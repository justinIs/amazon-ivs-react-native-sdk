# iOS audio header spike (M2a)

## Goal

Verify the real `IVSStageAudioManager` surface from the downloaded Amazon IVS Broadcast Stages xcframework before designing `IvsAudioSession` on iOS (and mirroring behaviour on Android).

## Findings

The vendored podspec (`vendor/AmazonIVSBroadcastStages.podspec`, v1.43.0) downloads `AmazonIVSBroadcast-Stages.xcframework`. Headers confirm a preset-based API aligned with Android's `StageAudioManager`:

- `IVSStageAudioManagerUseCasePresetVideoChat`
- `IVSStageAudioManagerUseCasePresetSubscribeOnly`
- `IVSStageAudioManagerUseCasePresetStudio`

There is **no public output/route picker** in the IVS SDK — routing must be implemented in our layer.

## Implementation (`ios/IvsAudioSession.mm`)

`IvsAudioSession` combines:

1. **IVS presets** — `[IVSStageAudioManager sharedInstance] setPreset:` mapped from wire strings `video-chat` | `subscribe-only` | `studio`.

2. **`AVAudioSession.overrideOutputAudioPort`** — applied when the app requests a concrete output:
   - `auto` → `AVAudioSessionPortOverrideNone` (IVS audio-mode management stays on)
   - `speaker` → `AVAudioSessionPortOverrideSpeaker`
   - `earpiece` → `AVAudioSessionPortOverrideNone` (built-in receiver)
   - `bluetooth` / `wired` → clear override; OS routes to connected device

3. **Route observation** — `AVAudioSessionRouteChangeNotification` updates `activeOutput` and `availableOutputs`, emitted via `onAudioRouteChanged`.

4. **Re-apply override** — on route change when output is not `auto`, override is re-applied so explicit user choice wins over transient OS changes.

## Android parity

Android uses `StageAudioManager.setPreset` plus `setAudioModeManagementEnabled(false)` and `AudioManager` when output ≠ `auto`. Same wire strings via `IvsMapping`.

## Default behaviour

When the app never calls `setAudioOutput('speaker' | …)`, requested output stays `'auto'` and IVS-managed audio mode matches pre-routing PoC behaviour.

## When bumping native SDK

Re-run this spike: read headers from the new xcframework after `pod install`. Update presets or ownership if AWS changes the audio manager API.

See [docs/audio.md](../audio.md) and [ADR 0008](../adr/0008-audio-session-ownership.md).
