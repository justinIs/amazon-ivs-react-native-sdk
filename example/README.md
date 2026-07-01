# Example app

Demo app for `react-native-ivs-realtime`. It requests camera permission, shows the
native IVS SDK version, renders a live local camera preview, lets you flip the
camera, and lists discovered devices.

Run it from the repo root (Android-only for this PoC):

```sh
pnpm install
pnpm example android    # build + install on a device/emulator
pnpm example start      # start Metro if it didn't auto-start
```

See the root [README](../README.md) for requirements (JDK 17, Android SDK) and the
pnpm notes.
