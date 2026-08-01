# Audio

Mobile RTC apps expect speaker vs. earpiece control on day one. The IVS Broadcast SDK exposes **presets**, not output routing — this SDK layers routing on top.

## Presets

`setAudioPreset(preset)` maps 1:1 to IVS use-case presets:

| Preset | Typical use |
| --- | --- |
| `video-chat` | Two-way calls (default for publishing) |
| `subscribe-only` | Viewer-only; media playback route, respects ringer switch |
| `studio` | Higher-quality capture scenarios |

Pick the wrong preset and users ask "why is audio in the earpiece?" or "why is it quiet?" — `subscribe-only` for watch-only apps, `video-chat` for go-live.

## Output routing

`setAudioOutput(output)` selects where audio plays:

| Value | Behaviour |
| --- | --- |
| `auto` | **Default.** IVS audio-mode management stays enabled; OS chooses route from preset |
| `speaker` | Force loudspeaker |
| `earpiece` | Built-in receiver |
| `bluetooth` | Connected Bluetooth device |
| `wired` | Headphones / USB audio |

When output is not `auto`, the SDK disables IVS audio-mode management and owns:

- **Android**: `AudioManager` — `setCommunicationDevice` (API 31+) or `setSpeakerphoneOn`
- **iOS**: `AVAudioSession.overrideOutputAudioPort` layered on the IVS preset category

`IvsAudioSession` coordinates with `IvsAppLifecycle` for focus, Bluetooth SCO, and interruption recovery.

## Route events

`audioRouteChanged` fires when hardware changes (headphones plugged, Bluetooth connected). Payload shape:

```ts
interface IVSAudioRoute {
  output: AudioOutput;           // what the app asked for
  activeOutput: Exclude<AudioOutput, 'auto'>;  // resolved port
  availableOutputs: Exclude<AudioOutput, 'auto'>[];
}
```

Use `useAudioRoute()` in React apps; render a picker from `availableOutputs`.

## Capabilities

`getCapabilities().audioRouting` reports whether explicit routing is supported. Hide route UI when false.

## React usage

```tsx
const { audioRoute, setAudioOutput } = useAudioRoute();

// Default — never call setAudioOutput; behaviour matches IVS-managed mode
await setAudioOutput('speaker');
```

## Further reading

- [docs/notes/ios-audio-header-spike.md](notes/ios-audio-header-spike.md) — iOS header verification
- [ADR 0008 — audio session ownership](adr/0008-audio-session-ownership.md)
