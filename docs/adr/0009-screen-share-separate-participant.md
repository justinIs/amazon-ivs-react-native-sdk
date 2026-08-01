# Screen share as separate participant

## Context

Screen sharing could be modeled as a second stream on one participant or as a second participant on the stage.

## Decision

**Screen share is its own participant** with a dedicated participant token, conventionally minted with attribute `screen-share=true`. This matches AWS server composition (`featuredParticipantAttribute: screen-share`) and web SDK guidance (separate Stage/token for screen).

Implications:

- Renders via existing `IVSParticipantVideoView` — no stream-selector prop
- Local capture preview via `IVSLocalPreviewView source="screen"` (post-v1)
- Public API: future `startScreenShare({ token })` / `stopScreenShare()`; second native Stage is SDK-owned, not a second app-visible `IVSStage`
- `getCapabilities().screenShare` reports platform support

Platform mechanics (ReplayKit extension + App Group on iOS; `MediaProjection` foreground service on Android) are post-v1.

## Consequences

- Participant view props are **final** for v1
- Token minting docs include `screen-share=true` convention today ([tokens.md](../tokens.md))
- `attributes` must remain `Record<string, string>`, not JSON strings
