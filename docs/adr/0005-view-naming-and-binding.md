# View naming and binding model

## Context

Video UI needs two distinct bindings: local devices (available before join) vs. stage participants (require `participantId`).

## Decision

| Binds to | Before join? | Component |
| --- | --- | --- |
| Local **device** | Yes | `IVSLocalPreviewView` |
| **Participant** on stage | No | `IVSParticipantVideoView` |

- `IVSLocalPreviewView` accepts optional `source` (`'camera' | 'screen' | device urn`) for future screen capture; camera position is **not** a prop — use `flipCamera()`.
- `IVSParticipantVideoView` renders local or remote video by `participantId`; clears on unpublish (no frozen frame).
- Shared layout/mirror/aspect behaviour lives in native `IvsPreviewHostView`; two Fabric components remain (codegen cannot express discriminated union props cleanly).

Renamed from PoC `IVSCameraPreviewView` because preview binds to a device, not a participant.

## Consequences

- Green room and permission flows use `IVSLocalPreviewView` only.
- In-stage self tile uses `IVSParticipantVideoView` with local `participantId`, same as remotes.
- Screen share (post-v1) does not require new participant view props — see [ADR 0009](0009-screen-share-separate-participant.md).
