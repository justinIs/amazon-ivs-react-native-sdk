# Architecture

The SDK is organized in four layers. Each layer has a single job; crossing boundaries without going through the spec is a review failure.

```
src/spec/           TurboModule + Fabric codegen specs   ← the ONLY cross-platform contract
src/core/           IVSStage class, IVSError, enums       ← no React, no platform checks
src/react/          provider + hooks                      ← no native calls not in core
ios/  android/      mirrored file layout per platform     ← every spec method implemented
```

## Layer responsibilities

| Layer | Contains | Must not |
| --- | --- | --- |
| **spec** | `NativeAmazonIvsRealTime.ts`, Fabric view specs | Business logic, React |
| **core** | `IVSStage`, `IVSError`, types, permission helpers | React imports, `Platform.OS` |
| **react** | `IVSStageProvider`, hooks, view wrappers | Direct TurboModule calls |
| **native** | ObjC++/Kotlin managers and Fabric views | API shapes not in spec |

## Boundary rules

1. **The spec is the contract.** Nothing crosses the JS/native bridge that is not declared in `src/spec/`. No `Platform.OS` branching in `src/`.
2. **Both platforms implement every spec method.** Unsupported platform features belong in `getCapabilities()`, not as reject stubs on main.
3. **`src/react/` may not call native.** Hooks read from the provider; the provider drives `IVSStage`. Apps using Redux, Zustand, or XState can use the core without the provider.
4. **Native layers mirror file-for-file.** A reviewer should diff `ios/IvsStageManager.mm` against `android/.../IvsStageManager.kt` section by section.

## Mirrored native layout

| Responsibility | iOS | Android |
| --- | --- | --- |
| TurboModule shim (marshalling only) | `AmazonIvsRealTime.mm` | `AmazonIvsRealTimeModule.kt` |
| Stage lifecycle, strategy, state | `IvsStageManager.mm` | `IvsStageManager.kt` |
| Device acquire/release | `IvsDevices.mm` | `IvsDevices.kt` |
| Participant + view registry | `IvsParticipantStreams.mm` | `IvsParticipantStreams.kt` |
| Enum ↔ wire string mapping | `IvsMapping.mm` | `IvsMapping.kt` |
| Preview host base class | `IvsPreviewHostView.mm` | `IvsPreviewHostView.kt` |
| Fabric views | `IvsLocalPreviewView`, `IvsParticipantVideoView` | same names, `.kt` |
| Foreground/background + interruptions | `IvsAppLifecycle.mm` | `IvsAppLifecycle.kt` |
| Audio preset + output routing | `IvsAudioSession.mm` | `IvsAudioSession.kt` |

The TurboModule shim converts arguments, calls managers, and resolves or rejects. **Every state decision lives in `IvsStageManager`**, the only object that talks to the IVS SDK directly.

## Deliberate splits

- **`IvsMapping`** — most likely to drift between platforms; covered by unit tests on both sides.
- **`IvsParticipantStreams`** — owns participantId → renderer registry; pushes stream changes to views natively. Stream identity never crosses the bridge.

## Testing the boundaries

- **JS unit tests** mock the TurboModule; core and provider logic run without native code.
- **Parity test** (`src/__tests__/parity.test.ts`) asserts both native trees implement every spec method and that mapping wire strings match.
- **Native mapping tests** (XCTest, JUnit) lock enum tables independently.

See [adding-a-feature.md](adding-a-feature.md) for the checklist when extending the surface.
