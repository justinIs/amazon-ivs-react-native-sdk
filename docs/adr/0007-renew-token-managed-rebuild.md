# renewToken as managed rebuild with participantId reassignment

## Context

IVS participant tokens expire. AWS provides renewal by joining with a new token; the local participant receives a new `participantId`.

## Decision

`renewToken(token)` performs a **managed rebuild**:

1. Construct a new native Stage with the new token
2. Preserve device holds (avoid camera flicker / indicator blink)
3. Preserve publish intent, subscribe config, and registered views
4. Emit local `participantLeft` then `participantJoined` through the normal event path

Remote peers must re-subscribe/re-render against the new local `participantId`; views bound by id rebind automatically via the participant streams registry.

## Consequences

- Example app includes renew-token UI to validate tile rebinding
- Token refresh policy (automatic) remains post-v1; v1 exposes `token-expired` + manual `renewToken`
