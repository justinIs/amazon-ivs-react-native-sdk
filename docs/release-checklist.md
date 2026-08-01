# Release checklist

Run this manual pass on **both iOS and Android** before tagging a release. Automated E2E is deferred until an AWS test account and dual runners exist.

## Environment

- [ ] Physical device preferred for camera, Bluetooth, and phone-call cases (simulator OK for smoke)
- [ ] Fresh participant token from `./scripts/ivs token`
- [ ] Second device or browser participant for multi-user checks

## Launch and permissions

- [ ] App launches without crash
- [ ] Permission screen shows `undetermined` before first prompt
- [ ] Request camera/mic grants access; preview works
- [ ] Deny permission → **Open Settings** opens system settings
- [ ] After granting in Settings, return shows updated status

## Lobby / green room

- [ ] `IVSLocalPreviewView` shows local camera before join
- [ ] SDK version string loads

## Join flows

- [ ] **Watch only** — joins without publishing; no camera indicator for viewer token
- [ ] **Go live** — joins with camera/mic publishing
- [ ] Viewer can tap **Go live** after join without re-entering token

## In-room controls

- [ ] Mute / unmute updates published audio
- [ ] Camera off / on (preview stays mounted while publishing)
- [ ] Flip camera switches front/back
- [ ] Stop live unpublishes; leave disconnects and clears OS indicators

## Remote participants

- [ ] Second participant joins; tile renders in grid
- [ ] Per-participant **Media** cycles: audio-video → audio-only → hidden
- [ ] Hidden tile shows placeholder, not frozen video
- [ ] Unpublish clears remote video (no frozen last frame)

## Audio routing

- [ ] Output picker lists available routes
- [ ] Switch speaker ↔ earpiece; audio follows
- [ ] Connect Bluetooth headset — `audioRouteChanged` fires; audio routes correctly
- [ ] Disconnect Bluetooth — route updates

## Interruptions and lifecycle

- [ ] Incoming phone call — audio pauses/recovers after call
- [ ] Background app — publishing intent preserved; foreground restores sensibly

## Token renewal

- [ ] Mint a replacement token for same user
- [ ] **Renew token** mid-session — local tile rebinds (`participantId` changes)
- [ ] Remote peers re-render local video after renew

## Leave and cleanup

- [ ] Leave stage — connection disconnected
- [ ] Camera/mic OS indicators clear after leave
- [ ] Rejoin with new token works

## Build artifacts

- [ ] CI example APK (Android) installs and runs smoke path
- [ ] iOS simulator/device build from same commit

## Sign-off

Record platform, device model, SDK native version (from `getSdkVersion()`), and any failures in the release PR.
