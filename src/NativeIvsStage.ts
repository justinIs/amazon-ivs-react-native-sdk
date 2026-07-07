import type { TurboModule } from 'react-native';
import { TurboModuleRegistry, type CodegenTypes } from 'react-native';

/**
 * TurboModule spec for connecting to an IVS Real-Time **Stage**.
 *
 * This is the signalling/connection surface — it joins a Stage with an
 * AWS-issued participant token and streams lifecycle events back to JS. It does
 * not yet publish local media (that's the next milestone); on connect it
 * subscribes to remote participants so their join/publish events are observable.
 *
 * Codegen constraint: event payloads must be flat, codegen-friendly objects
 * (strings/booleans), so enum-like values (`state`) are passed as strings and
 * mapped to unions in `types.ts`.
 */

/** `state`: 'disconnected' | 'connecting' | 'connected'. */
export interface StageConnectionStateEvent {
  state: string;
}

export interface StageParticipantEvent {
  participantId: string;
  userId: string;
  isLocal: boolean;
  /** Custom token attributes as a JSON object string (parsed to a map in JS). */
  attributesJson: string;
  /** Whether the token grants this participant PUBLISH capability. */
  canPublish: boolean;
  /** Whether the token grants this participant SUBSCRIBE capability. */
  canSubscribe: boolean;
}

export interface StageParticipantLeftEvent {
  participantId: string;
}

/** Fired when a participant's metadata (e.g. custom attributes) changes. */
export interface StageParticipantMetadataEvent {
  participantId: string;
  /** Latest custom attributes as a JSON object string. */
  attributesJson: string;
}

/**
 * Summary of the media a participant is currently publishing to us. Emitted as
 * streams are added, removed, or their mute state changes. The actual video is
 * rendered natively via `<ParticipantVideo participantId=… />`; JS only needs
 * these flags to decide what to show.
 */
export interface StageParticipantStreamsEvent {
  participantId: string;
  hasVideo: boolean;
  hasAudio: boolean;
  videoMuted: boolean;
  audioMuted: boolean;
}

/**
 * `state` is a publish state ('not_published' | 'attempting_publish' |
 * 'published') or subscribe state ('not_subscribed' | 'attempting_subscribe' |
 * 'subscribed'), depending on which event carries it.
 */
export interface StageParticipantStateEvent {
  participantId: string;
  state: string;
}

export interface StageErrorEvent {
  message: string;
}

export interface Spec extends TurboModule {
  /**
   * Join a Stage with an AWS-issued participant token. Resolves once the native
   * join has been initiated; watch `onConnectionStateChanged` for the result.
   * Rejects if a token is malformed or the SDK refuses the join outright.
   */
  joinStage(token: string): Promise<void>;

  /** Leave the current Stage and release it. No-op if not joined. */
  leaveStage(): void;

  /**
   * Mute/unmute the published local video (camera) stream. No-op if not
   * publishing video. Muting stops sending frames to other participants.
   */
  setLocalVideoMuted(muted: boolean): void;

  /**
   * Mute/unmute the published local audio (microphone) stream. No-op if not
   * publishing audio.
   */
  setLocalAudioMuted(muted: boolean): void;

  readonly onConnectionStateChanged: CodegenTypes.EventEmitter<StageConnectionStateEvent>;
  readonly onParticipantJoined: CodegenTypes.EventEmitter<StageParticipantEvent>;
  readonly onParticipantLeft: CodegenTypes.EventEmitter<StageParticipantLeftEvent>;
  readonly onParticipantMetadataUpdated: CodegenTypes.EventEmitter<StageParticipantMetadataEvent>;
  readonly onParticipantPublishStateChanged: CodegenTypes.EventEmitter<StageParticipantStateEvent>;
  readonly onParticipantSubscribeStateChanged: CodegenTypes.EventEmitter<StageParticipantStateEvent>;
  readonly onParticipantStreamsChanged: CodegenTypes.EventEmitter<StageParticipantStreamsEvent>;
  readonly onError: CodegenTypes.EventEmitter<StageErrorEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('IvsStage');
