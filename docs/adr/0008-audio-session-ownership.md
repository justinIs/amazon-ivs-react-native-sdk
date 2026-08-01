# Audio session ownership for output routing

## Context

IVS Broadcast SDK exposes audio **presets** (`video-chat`, `subscribe-only`, `studio`) but not speaker/earpiece/Bluetooth selection. Mobile apps require explicit routing.

## Decision

- **`setAudioPreset`** — direct passthrough to IVS `StageAudioManager` / `IVSStageAudioManager`.
- **`setAudioOutput`** — when not `'auto'`, SDK disables IVS audio-mode management and applies platform routing:
  - iOS: `AVAudioSession.overrideOutputAudioPort` on top of IVS preset category
  - Android: `setAudioModeManagementEnabled(false)` + `AudioManager` device selection
- **`'auto'` default** — do not override; IVS manages mode (matches pre-routing behaviour).
- **`IvsAudioSession`** is a dedicated module coordinating with **`IvsAppLifecycle`** for focus, Bluetooth, and interruptions.
- **`audioRouteChanged`** event + `IVSAudioRoute` payload for UI pickers.

## Consequences

- Routing complexity is opt-in via non-`auto` output
- `getCapabilities().audioRouting` lets apps hide unsupported pickers
- See [docs/audio.md](../audio.md) and [docs/notes/ios-audio-header-spike.md](../notes/ios-audio-header-spike.md)
