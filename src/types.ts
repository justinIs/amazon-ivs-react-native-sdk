/**
 * Public types for react-native-ivs-realtime.
 *
 * PoC scope: local device enumeration + local camera preview. No Stage
 * (join/publish/subscribe) types yet — those arrive in a later milestone.
 */

/** Which physical camera to use for the preview. */
export type CameraPosition = 'front' | 'back';

/**
 * How the camera image is fit into the preview view's bounds.
 * - `fill`: crop to fill the whole view (no letterboxing).
 * - `fit`:  letterbox so the entire image is visible.
 */
export type AspectMode = 'fill' | 'fit';

/** A local input device reported by the native IVS SDK. */
export type DeviceType = 'camera' | 'microphone' | 'unknown';

/** A single local device (camera or microphone) discovered on the handset. */
export interface DeviceInfo {
  /** Stable identifier (the SDK device URN). */
  id: string;
  /** Human-readable name from the SDK descriptor. */
  name: string;
  /** Coarse device category. */
  type: DeviceType;
  /** Physical position for cameras; `unknown` for mics or unspecified. */
  position: CameraPosition | 'unknown';
}
