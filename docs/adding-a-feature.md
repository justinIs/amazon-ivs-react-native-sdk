# Adding a feature

Use this checklist for SDK updates, API changes, and bug fixes that touch the native bridge.

## Checklist

1. **Add the method or event to `src/spec/`.**  
   Update `NativeAmazonIvsRealTime.ts` and Fabric specs if views change. Codegen must see the new surface.

2. **Implement in both stage managers.**  
   `ios/IvsStageManager.mm` **and** `android/.../IvsStageManager.kt`. Keep logic parallel.

3. **Add enum mappings to both `IvsMapping` files.**  
   Wire strings must match exactly; the parity test enforces this.

4. **Expose on `src/core/IVSStage.ts`.**  
   Core wraps native calls with `IVSError` mapping and event emission.

5. **Optionally surface via a hook.**  
   Add to `IVSStageProvider` / `hooks.ts` if React apps need it — **no new native calls in `src/react/`**.

6. **Extend tests.**  
   Add to the parity test; add a mapping unit test if enums changed; add JS tests for core/provider behaviour.

7. **Add to the example app.**  
   Prove the feature manually; the example is the first integration test.

8. **Add a changeset entry.**  
   `yarn changeset` — documents the release note and semver bump.

## What not to do

- Do not call `TurboModuleRegistry` from `src/react/`.
- Do not add platform-only methods to the spec — use `getCapabilities()` instead.
- Do not skip one platform; the parity test will fail.

## Native SDK bumps

If the feature requires a newer IVS Broadcast SDK, follow [upgrading-the-native-sdk.md](upgrading-the-native-sdk.md) — bump Android AAR and iOS podspec **together**.

## ADRs

If the feature changes a settled decision (join semantics, view naming, single active stage, etc.), add or update a record in [docs/adr/](adr/).
