/**
 * Public types for amazon-ivs-react-native-sdk.
 *
 * PoC scope: local device enumeration + local camera preview, plus Stage
 * connection + participant/event observation. Publishing local media and
 * rendering remote streams arrive in a later milestone.
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

/** Connection lifecycle of a Stage (mirrors IVS `Stage.ConnectionState`). */
export type StageConnectionState = 'disconnected' | 'connecting' | 'connected';

/** Whether a participant is publishing media (mirrors `Stage.PublishState`). */
export type StagePublishState =
  'not_published' | 'attempting_publish' | 'published';

/** Whether we're subscribed to a participant (mirrors `Stage.SubscribeState`). */
export type StageSubscribeState =
  'not_subscribed' | 'attempting_subscribe' | 'subscribed';

/** A participant in the Stage, as tracked by the provider from SDK events. */
export interface StageParticipant {
  /** Server-assigned participant id (stable for the session). */
  participantId: string;
  /** Application-supplied user id encoded in the participant token. */
  userId: string;
  /** True for the local participant (this device). */
  isLocal: boolean;
  publishState: StagePublishState;
  subscribeState: StageSubscribeState;
  /** Custom key/value attributes encoded in the participant token. */
  attributes: Record<string, string>;
  /** Token grants PUBLISH capability (may send media). */
  canPublish: boolean;
  /** Token grants SUBSCRIBE capability (may receive media). */
  canSubscribe: boolean;
  /** True while the participant is publishing a video stream to us. */
  hasVideo: boolean;
  /** True while the participant is publishing an audio stream to us. */
  hasAudio: boolean;
  /** True when the participant's video stream is currently muted. */
  videoMuted: boolean;
  /** True when the participant's audio stream is currently muted. */
  audioMuted: boolean;
  /**
   * Bumps whenever the participant's media streams change. Pass it to
   * `<ParticipantVideo streamVersion={…} />` so the native view re-resolves the
   * video device.
   */
  streamVersion: number;
}

/** One line in the provider's rolling event log (for UI feedback/debugging). */
export interface StageLogEntry {
  /** Monotonic id for React keys. */
  id: number;
  /** Epoch milliseconds when the event was recorded. */
  time: number;
  /** Human-readable description of the event. */
  message: string;
}
