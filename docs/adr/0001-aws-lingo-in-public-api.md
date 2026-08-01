# Public API uses AWS IVS terminology verbatim

The SDK's public API mirrors AWS IVS Real-Time naming exactly (Stage, Participant, Participant Token, Stage Stream, publish/subscribe) instead of renaming to generic WebRTC vocabulary (room, peer, track) the way LiveKit/Daily do. Decided because developers using this SDK will live in AWS docs and consoles; a 1:1 vocabulary removes a translation layer. The cost — less familiarity for people coming from other RTC SDKs — is accepted.
