import {
  TurboModuleRegistry,
  type TurboModule,
  type CodegenTypes,
} from 'react-native';

export type NativeDeviceInfo = {
  deviceId: string;
  urn: string;
  friendlyName: string;
  type: string;
  position: string;
  isDefault: boolean;
};

export type NativeCapabilities = {
  screenShare: boolean;
  backgroundAudio: boolean;
  bluetoothMicrophone: boolean;
  audioRouting: boolean;
  rtcStats: boolean;
  simulcast: boolean;
};

export type NativeStageStreamInfo = {
  mediaType: string;
  isMuted: boolean;
  deviceType: string;
  urn: string;
};

export type NativeParticipantInfo = {
  participantId: string;
  userId: string;
  isLocal: boolean;
  attributes: { [key: string]: string };
  publishState: string;
  subscribeState: string;
  streams: NativeStageStreamInfo[];
};

export type NativeStageState = {
  connectionState: string;
  publishEnabled: boolean;
  publishState: string;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  cameraPosition: string;
  audioOutput: string;
};

export type NativeAudioRoute = {
  output: string;
  activeOutput: string;
  availableOutputs: string[];
};

export type NativeConnectionStateChangedEvent = {
  state: string;
  error?: string;
};

export type NativeParticipantLeftEvent = {
  participantId: string;
};

export type NativeStreamsChangedEvent = {
  participantId: string;
  streams: NativeStageStreamInfo[];
};

export type NativeStageErrorEvent = {
  code: string;
  message: string;
  nativeError?: {
    domain?: string;
    code?: number;
    message?: string;
    userInfo?: { [key: string]: string | number };
  };
};

export type JoinStageOptions = {
  publish?: boolean;
};

export type PrepareDevicesOptions = {
  camera?: boolean;
  microphone?: boolean;
};

export type VideoConfigOptions = {
  width?: number;
  height?: number;
  targetFramerate?: number;
  minBitrate?: number;
  maxBitrate?: number;
};

export interface Spec extends TurboModule {
  // environment
  getSdkVersion(): Promise<string>;
  getCapabilities(): Promise<NativeCapabilities>;
  enumerateDevices(): Promise<NativeDeviceInfo[]>;
  getCameraPermission(): Promise<string>;
  getMicrophonePermission(): Promise<string>;
  requestCameraPermission(): Promise<string>;
  requestMicrophonePermission(): Promise<string>;

  // stage lifecycle
  joinStage(token: string, options: JoinStageOptions): Promise<void>;
  leaveStage(): Promise<void>;
  renewToken(token: string): Promise<void>;
  listParticipants(): Promise<NativeParticipantInfo[]>;
  readState(): Promise<NativeStageState>;

  // publish + local media
  setPublishEnabled(enabled: boolean): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  setCameraPosition(position: string): Promise<void>;
  flipCamera(): Promise<void>;
  prepareDevices(options: PrepareDevicesOptions): Promise<void>;
  releaseDevices(): Promise<void>;

  // media configuration
  setVideoConfig(config: VideoConfigOptions): Promise<void>;
  setDefaultSubscribeType(type: string): Promise<void>;
  setSubscribeType(participantId: string, type: string): Promise<void>;

  // audio session
  setAudioPreset(preset: string): Promise<void>;
  setAudioOutput(output: string): Promise<void>;
  getAudioRoute(): Promise<NativeAudioRoute>;

  // events
  readonly onStageConnectionStateChanged: CodegenTypes.EventEmitter<NativeConnectionStateChangedEvent>;
  readonly onParticipantJoined: CodegenTypes.EventEmitter<NativeParticipantInfo>;
  readonly onParticipantUpdated: CodegenTypes.EventEmitter<NativeParticipantInfo>;
  readonly onParticipantLeft: CodegenTypes.EventEmitter<NativeParticipantLeftEvent>;
  readonly onParticipantStreamsChanged: CodegenTypes.EventEmitter<NativeStreamsChangedEvent>;
  readonly onAudioRouteChanged: CodegenTypes.EventEmitter<NativeAudioRoute>;
  readonly onStageError: CodegenTypes.EventEmitter<NativeStageErrorEvent>;
}

const NativeAmazonIvsRealTime = TurboModuleRegistry.get<Spec>('AmazonIvsRealTime');

export default NativeAmazonIvsRealTime;
