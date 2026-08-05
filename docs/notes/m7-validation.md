# M7 validation notes

## Automated (ran in this implementation)

| Check | Result |
| ----- | ------ |
| `yarn typecheck` | Pass |
| `yarn test` (60 JS + parity) | Pass |
| `yarn prepare` / bob build | Pass |
| Parity: both platforms implement every spec method | Pass |
| Parity: identical `IvsMapping` wire strings | Pass |
| PeerDeps floor in package.json | `react-native >=0.81.0` (fixture-app build deferred — needs local RN 0.81 toolchains) |

## Manual release checklist — simulator / CI (flagged for you)

These need a developer machine with simulators/devices and an AWS stage token (`./scripts/ivs token`):

1. Launch example on **iOS simulator** and **Android emulator** (minSdk 28).
2. Permission screen shows `undetermined` before request; after deny, "Open Settings" works.
3. Lobby `IVSLocalPreviewView` green room.
4. Join watch-only, then go live; mute / cam / flip / publish dock.
5. Second participant tile (needs a second device or second token session).
6. Audio route picker: speaker ↔ earpiece; Bluetooth headset (`audioRouteChanged`) — **physical device**.
7. Phone-call interruption recovery — **physical device**.
8. Background / foreground camera mute restore.
9. Renew token mid-call: local tile rebinds to new `participantId`; remote peers see leave+join.
10. Leave: OS camera/microphone indicators clear.

## Known limitations (accepted for v1, verify or revisit later)

- **iOS earpiece routing under the video-chat preset** needs physical-device
  confirmation: the preset's `defaultToSpeaker` category option may fight the
  `overrideOutputAudioPort` earpiece override. Covered by manual checklist
  item 6.
- **Android Bluetooth/wired output selection is a no-op below API 31** —
  `setCommunicationDevice` is the only reliable takeover path; older devices
  fall back to speakerphone on/off only.
- **Concurrent `leave()` drift**: a second `leave()` while one is pending
  rejects on Android but resolves on iOS. Harmless (both settle), but align
  when next touching the leave path.
- **Native CI jobs are now blocking** (Android assemble, Android unit, iOS
  macOS build). Fork PRs may still need a maintainer to approve workflows
  before checks appear.

## RN peer-floor fixture validation

Not run in this pass (toolchain-heavy). Procedure:

1. Create a bare RN app at the candidate floor (start at 0.81).
2. Install this package from a packed tarball (`yarn pack`).
3. Enable New Architecture; add the vendor podspec line on iOS.
4. Build both platforms; adjust `peerDependencies` if codegen fails below 0.81.
