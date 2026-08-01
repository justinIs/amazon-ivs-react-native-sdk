# Single active stage enforced on join()

## Context

Native managers (`IvsStageManager`) are singleton owners today. Multiple concurrent `IVSStage` JS instances would share one native stage silently.

## Decision

**One active stage per process for v1.** The second `IVSStage.join()` while another is connected rejects with `stage-in-use`. Constructor is side-effect-free; `join()` acquires the singleton.

Sequential lobby → room via `leave()` / `dispose()` covers real flows. Screen share uses an SDK-owned second native stage not exposed to apps (post-v1).

## Consequences

- Apps cannot run two visible stages concurrently without a future native refactor (keyed registry, handle-scoped events, device arbitration).
- JS surface already models instances — concurrent stages would not break the public API, only native internals.
