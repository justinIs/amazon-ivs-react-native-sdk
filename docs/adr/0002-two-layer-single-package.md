# One npm package with four layers: spec, core, react, native

The SDK ships as a single npm package with four layers:

1. **`src/spec/`** — TurboModule + Fabric codegen specs (the only cross-platform contract)
2. **`src/core/`** — imperative `IVSStage` class, errors, types (no React)
3. **`src/react/`** — `IVSStageProvider` + hooks built strictly on core
4. **`ios/` / `android/`** — mirrored native implementations

Considered hooks-only (rejected: locks out apps with their own state management and makes the native bridge untestable in isolation) and Daily-style separate core/react packages (rejected: versioning overhead not justified at this size).

The react layer must contain no native calls that the core does not expose. See [ADR 0004](0004-four-layer-boundary-rules.md) for enforcement rules.
