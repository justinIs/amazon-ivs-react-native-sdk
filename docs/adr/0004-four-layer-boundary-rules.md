# Four-layer boundary rules

## Context

The SDK spans JavaScript and two native platforms. Without explicit boundaries, platform checks and duplicate native calls creep into React code and the contract drifts between iOS and Android.

## Decision

1. **The spec is the contract.** Nothing crosses the JS/native bridge unless declared in `src/spec/`. No `Platform.OS` in `src/`.
2. **Both platforms implement every spec method.** Platform-specific gaps use `getCapabilities()`, not reject stubs on main.
3. **`src/react/` may not call native.** Hooks and provider delegate to `IVSStage` in core.
4. **Native layers mirror file-for-file.** Stage logic lives in `IvsStageManager`; shims marshal only.

## Consequences

- Parity test can assert method lists and mapping tables mechanically.
- Redux/Zustand apps can use core without the provider.
- New features follow the [adding-a-feature checklist](../adding-a-feature.md).
