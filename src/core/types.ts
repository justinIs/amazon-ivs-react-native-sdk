import type { IVSError } from './IVSError';

export type CameraPosition = 'front' | 'back';
export type AspectMode = 'fill' | 'fit';
export type MediaType = 'audio' | 'video';
export type DeviceType =
  'camera' | 'microphone' | 'userImage' | 'userAudio' | 'unknown';
export type DevicePosition =
  'front' | 'back' | 'usb' | 'bluetooth' | 'aux' | 'unknown';
export type StageConnectionState = 'disconnected' | 'connecting' | 'connected';
export type ParticipantPublishState =
  'notPublished' | 'attemptingPublish' | 'published';
export type ParticipantSubscribeState =
  'notSubscribed' | 'attemptingSubscribe' | 'subscribed';
export type SubscribeType = 'none' | 'audio-only' | 'audio-video';
export type PermissionStatus =
  'granted' | 'denied' | 'restricted' | 'undetermined';
export type AudioPreset = 'video-chat' | 'subscribe-only' | 'studio';
export type AudioOutput =
  'auto' | 'speaker' | 'earpiece' | 'bluetooth' | 'wired';

export type IVSErrorCode =
  | 'token-expired'
  | 'token-invalid'
  | 'join-failed'
  | 'permission-denied'
  | 'device-unavailable'
  | 'disconnected'
  | 'stage-in-use'
  | 'disposed'
  | 'not-linked'
  | 'unknown';

export interface IVSAudioRoute {
  /** What the app asked for. */
  output: AudioOutput;
  /** What the OS actually selected — `auto` resolves to a concrete port. */
  activeOutput: Exclude<AudioOutput, 'auto'>;
  /** Outputs currently connected and selectable on this device. */
  availableOutputs: Exclude<AudioOutput, 'auto'>[];
}

export interface IVSStageStreamInfo {
  mediaType: MediaType;
  isMuted: boolean;
  deviceType: DeviceType;
  urn: string;
}

export interface IVSParticipantInfo {
  participantId: string;
  userId: string;
  isLocal: boolean;
  attributes: Record<string, string>;
  publishState: ParticipantPublishState;
  subscribeState: ParticipantSubscribeState;
  streams: IVSStageStreamInfo[];
}

export interface IVSVideoConfig {
  width?: number;
  height?: number;
  targetFramerate?: number;
  minBitrate?: number;
  maxBitrate?: number;
}

export interface IVSDeviceInfo {
  deviceId: string;
  urn: string;
  friendlyName: string;
  type: DeviceType;
  position: DevicePosition;
  isDefault: boolean;
}

export interface IVSCapabilities {
  screenShare: boolean;
  backgroundAudio: boolean;
  bluetoothMicrophone: boolean;
  audioRouting: boolean;
  rtcStats: boolean;
  simulcast: boolean;
}

export interface IVSStageState {
  connectionState: StageConnectionState;
  publishEnabled: boolean;
  publishState: ParticipantPublishState;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  cameraPosition: CameraPosition;
  audioOutput: AudioOutput;
}

export interface IVSStageOptions {
  /** Reserved for future construction options. */
}

export interface JoinOptions {
  /** When true, acquire devices and publish immediately after join. Default false. */
  publish?: boolean;
}

export interface NativeErrorDetails {
  domain?: string;
  code?: number;
  message?: string;
  userInfo?: Record<string, string | number>;
}

export type StageEventMap = {
  connectionStateChanged: { state: StageConnectionState; error?: IVSError };
  participantJoined: IVSParticipantInfo;
  participantUpdated: IVSParticipantInfo;
  participantLeft: { participantId: string };
  streamsChanged: { participantId: string; streams: IVSStageStreamInfo[] };
  audioRouteChanged: IVSAudioRoute;
  error: IVSError;
};

export type StageEventName = keyof StageEventMap;
