# Upgrading the native IVS SDK

Amazon IVS Real-Time (Stages) ships as:

- **Android**: Maven `com.amazonaws:ivs-broadcast:<version>:stages@aar`
- **iOS**: XCFramework via `vendor/AmazonIVSBroadcastStages.podspec`

Bump **both together** so parity holds.

## Steps

1. **Pick the target version** from [AWS IVS release notes](https://docs.aws.amazon.com/ivs/latest/userguide/release-notes.html) and the broadcast SDK download page.

2. **Android** — edit `android/build.gradle`:

```gradle
ext.AmazonIvsRealTime = [
  // ...
  ivsBroadcastVersion: "1.43.0"  // bump here
]
```

3. **iOS** — edit `vendor/AmazonIVSBroadcastStages.podspec`:
   - `s.version`
   - `:http` URL (usually `https://broadcast.live-video.net/<version>/AmazonIVSBroadcast-Stages.xcframework.zip`)
   - `:sha256` checksum

4. **Update the podspec dependency** in `AmazonIvsRealTime.podspec` if the version pin is explicit:

```ruby
s.dependency "AmazonIVSBroadcastStages", "1.43.0"
```

5. **Compute sha256** (do not guess):

```bash
curl -sL "https://broadcast.live-video.net/1.43.0/AmazonIVSBroadcast-Stages.xcframework.zip" \
  | shasum -a 256
```

AWS also publishes the checksum in their `Package.swift` for each release.

6. **Run tests**:

```bash
yarn test          # JS + parity
cd ios && xcodebuild test -scheme AmazonIvsRealTime -destination 'platform=iOS Simulator,name=iPhone 16'
cd example/android && ./gradlew :amazon-ivs-react-native-sdk:testDebugUnitTest
```

7. **Read IVS release notes** for new or renamed error codes — update `IvsMapping` on both platforms if needed.

8. **Rebuild the example** on iOS and Android; run the [release checklist](release-checklist.md).

## iOS header verification

After bumping the xcframework, re-read `IVSStageAudioManager` headers (see [docs/notes/ios-audio-header-spike.md](notes/ios-audio-header-spike.md)). Preset or audio-mode APIs occasionally shift between releases.

## Version skew

Do not ship with mismatched Android and iOS native SDK versions — behaviour divergences show up as parity failures or subtle stage bugs.
