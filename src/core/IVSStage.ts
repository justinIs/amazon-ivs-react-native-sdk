import type {
  NativeAudioRoute,
  NativeParticipantInfo,
  NativeStageState,
  NativeStageStreamInfo,
} from '../spec/NativeAmazonIvsRealTime';
import { IVSError } from './IVSError';
import {
  parseActiveAudioOutput,
  parseAudioOutput,
  parseCameraPosition,
  parseConnectionState,
  parseDevicePosition,
  parseDeviceType,
  parseMediaType,
  parsePermissionStatus,
  parsePublishState,
  parseSubscribeState,
} from './enums';
import { nativeModule, wrapNative } from './native';
import type {
  AudioOutput,
  AudioPreset,
  CameraPosition,
  IVSAudioRoute,
  IVSCapabilities,
  IVSDeviceInfo,
  IVSParticipantInfo,
  IVSStageOptions,
  IVSStageState,
  IVSStageStreamInfo,
  IVSVideoConfig,
  JoinOptions,
  PermissionStatus,
  StageEventMap,
  StageEventName,
  SubscribeType,
} from './types';

type Listener<E extends StageEventName> = (event: StageEventMap[E]) => void;
type Subscription = { remove(): void };

/** Process-wide active-stage slot. Enforced on join(), not in the constructor. */
let activeStage: IVSStage | null = null;

function mapStream(stream: NativeStageStreamInfo): IVSStageStreamInfo {
  return {
    mediaType: parseMediaType(stream.mediaType),
    isMuted: stream.isMuted,
    deviceType: parseDeviceType(stream.deviceType),
    urn: stream.urn,
  };
}

function mapParticipant(participant: NativeParticipantInfo): IVSParticipantInfo {
  return {
    participantId: participant.participantId,
    userId: participant.userId,
    isLocal: participant.isLocal,
    attributes: participant.attributes ?? {},
    publishState: parsePublishState(participant.publishState),
    subscribeState: parseSubscribeState(participant.subscribeState),
    streams: (participant.streams ?? []).map(mapStream),
  };
}

function mapState(state: NativeStageState): IVSStageState {
  return {
    connectionState: parseConnectionState(state.connectionState),
    publishEnabled: state.publishEnabled,
    publishState: parsePublishState(state.publishState),
    microphoneEnabled: state.microphoneEnabled,
    cameraEnabled: state.cameraEnabled,
    cameraPosition: parseCameraPosition(state.cameraPosition),
    audioOutput: parseAudioOutput(state.audioOutput),
  };
}

function mapAudioRoute(route: NativeAudioRoute): IVSAudioRoute {
  return {
    output: parseAudioOutput(route.output),
    activeOutput: parseActiveAudioOutput(route.activeOutput),
    availableOutputs: (route.availableOutputs ?? []).map(parseActiveAudioOutput),
  };
}

/**
 * Imperative Stage core.
 * Wraps the TurboModule with typed methods and a typed event emitter.
 * The React provider/hooks layer is built strictly on top of this object.
 */
export class IVSStage {
  private readonly listeners = new Map<
    StageEventName,
    Set<Listener<StageEventName>>
  >();
  private nativeSubscriptions: Subscription[] = [];
  private disposed = false;

  // Cached local intent for optimistic updates.
  private publishEnabled = false;
  private microphoneEnabled = true;
  private cameraEnabled = true;

  constructor(_options?: IVSStageOptions) {
    this.bindNativeEvents();
  }

  private bindNativeEvents() {
    const native = nativeModule();
    this.nativeSubscriptions = [
      native.onStageConnectionStateChanged((event) => {
        const state = parseConnectionState(event.state);
        if (state === 'disconnected' && activeStage === this) {
          activeStage = null;
        }
        this.emit('connectionStateChanged', {
          state,
          error:
            event.error != null
              ? new IVSError('disconnected', event.error)
              : undefined,
        });
      }),
      native.onParticipantJoined((participant) => {
        this.emit('participantJoined', mapParticipant(participant));
      }),
      native.onParticipantUpdated((participant) => {
        this.emit('participantUpdated', mapParticipant(participant));
      }),
      native.onParticipantLeft((event) => {
        this.emit('participantLeft', event);
      }),
      native.onParticipantStreamsChanged((event) => {
        this.emit('streamsChanged', {
          participantId: event.participantId,
          streams: (event.streams ?? []).map(mapStream),
        });
      }),
      native.onAudioRouteChanged((route) => {
        this.emit('audioRouteChanged', mapAudioRoute(route));
      }),
      native.onStageError((event) => {
        const error = new IVSError(
          (event.code as IVSError['code']) || 'unknown',
          event.message,
          event.nativeError
        );
        // Native 1300 (retry exhausted) maps to disconnected + error; 1400 is
        // error-event-only while still connected (native keeps retrying).
        if (error.code === 'disconnected') {
          if (activeStage === this) {
            activeStage = null;
          }
          this.emit('connectionStateChanged', {
            state: 'disconnected',
            error,
          });
        }
        this.emit('error', error);
      }),
    ];
  }

  private emit<E extends StageEventName>(event: E, payload: StageEventMap[E]) {
    const set = this.listeners.get(event);
    if (set == null) {
      return;
    }
    for (const listener of set) {
      (listener as Listener<E>)(payload);
    }
  }

  /** Subscribe to a Stage event. Returns an unsubscribe function. */
  on<E extends StageEventName>(event: E, listener: Listener<E>): () => void {
    let set = this.listeners.get(event);
    if (set == null) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<StageEventName>);
    return () => {
      set!.delete(listener as Listener<StageEventName>);
    };
  }

  /**
   * Join a stage with a participant token.
   * Connects without publishing unless `opts.publish` is true.
   * Rejects with `stage-in-use` if another IVSStage is already joined.
   */
  async join(token: string, opts: JoinOptions = {}): Promise<void> {
    this.assertNotDisposed();
    if (activeStage != null && activeStage !== this) {
      throw new IVSError(
        'stage-in-use',
        'Another IVSStage is already joined. Leave or dispose it before joining.'
      );
    }
    this.publishEnabled = opts.publish ?? false;
    await wrapNative(
      () =>
        nativeModule().joinStage(token, { publish: this.publishEnabled }),
      'join-failed'
    );
    activeStage = this;
  }

  /** Leave the current stage and release local streams/devices. */
  async leave(): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() => nativeModule().leaveStage());
    this.publishEnabled = false;
    if (activeStage === this) {
      activeStage = null;
    }
  }

  /**
   * Renew the participant token via a managed native Stage rebuild.
   * Preserves device holds, publish intent, subscribe config, and view registry.
   * The local participantId changes; participantLeft/Joined are emitted for local.
   */
  async renewToken(token: string): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() => nativeModule().renewToken(token), 'token-invalid');
  }

  /**
   * Tear down native event subscriptions and free the active-stage slot.
   * Calls after dispose reject with code `disposed`.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    if (activeStage === this) {
      activeStage = null;
    }
    for (const sub of this.nativeSubscriptions) {
      sub.remove();
    }
    this.nativeSubscriptions = [];
    this.listeners.clear();
  }

  async setPublishEnabled(enabled: boolean): Promise<void> {
    this.assertNotDisposed();
    const previous = this.publishEnabled;
    this.publishEnabled = enabled;
    try {
      await wrapNative(
        () => nativeModule().setPublishEnabled(enabled),
        'device-unavailable'
      );
    } catch (error) {
      this.publishEnabled = previous;
      throw error;
    }
  }

  /** @deprecated Use setPublishEnabled */
  async setPublishing(enabled: boolean): Promise<void> {
    return this.setPublishEnabled(enabled);
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    this.assertNotDisposed();
    const previous = this.microphoneEnabled;
    this.microphoneEnabled = enabled;
    try {
      await wrapNative(() => nativeModule().setMicrophoneEnabled(enabled));
    } catch (error) {
      this.microphoneEnabled = previous;
      throw error;
    }
  }

  /** @deprecated Use setMicrophoneEnabled(!muted) */
  async setMicrophoneMuted(muted: boolean): Promise<void> {
    return this.setMicrophoneEnabled(!muted);
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    this.assertNotDisposed();
    const previous = this.cameraEnabled;
    this.cameraEnabled = enabled;
    try {
      await wrapNative(() => nativeModule().setCameraEnabled(enabled));
    } catch (error) {
      this.cameraEnabled = previous;
      throw error;
    }
  }

  async setCameraPosition(position: CameraPosition): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(
      () => nativeModule().setCameraPosition(position),
      'device-unavailable'
    );
  }

  async flipCamera(): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() => nativeModule().flipCamera(), 'device-unavailable');
  }

  /** @deprecated Use flipCamera() or setCameraPosition(position) */
  async switchCamera(position?: CameraPosition): Promise<void> {
    if (position != null) {
      return this.setCameraPosition(position);
    }
    return this.flipCamera();
  }

  async prepareDevices(opts?: {
    camera?: boolean;
    microphone?: boolean;
  }): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(
      () =>
        nativeModule().prepareDevices({
          camera: opts?.camera ?? true,
          microphone: opts?.microphone ?? true,
        }),
      'device-unavailable'
    );
  }

  async releaseDevices(): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(
      () => nativeModule().releaseDevices(),
      'device-unavailable'
    );
  }

  async setVideoConfig(config: IVSVideoConfig): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() => nativeModule().setVideoConfig(config));
  }

  async setDefaultSubscribeType(type: SubscribeType): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() => nativeModule().setDefaultSubscribeType(type));
  }

  async setSubscribeType(
    participantId: string,
    type: SubscribeType
  ): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() =>
      nativeModule().setSubscribeType(participantId, type)
    );
  }

  async setAudioPreset(preset: AudioPreset): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() => nativeModule().setAudioPreset(preset));
  }

  async setAudioOutput(output: AudioOutput): Promise<void> {
    this.assertNotDisposed();
    await wrapNative(() => nativeModule().setAudioOutput(output));
  }

  async getAudioRoute(): Promise<IVSAudioRoute> {
    this.assertNotDisposed();
    const route = await wrapNative(() => nativeModule().getAudioRoute());
    return mapAudioRoute(route);
  }

  async readState(): Promise<IVSStageState> {
    this.assertNotDisposed();
    const state = await wrapNative(() => nativeModule().readState());
    const mapped = mapState(state);
    this.publishEnabled = mapped.publishEnabled;
    this.microphoneEnabled = mapped.microphoneEnabled;
    this.cameraEnabled = mapped.cameraEnabled;
    return mapped;
  }

  async listParticipants(): Promise<IVSParticipantInfo[]> {
    this.assertNotDisposed();
    const participants = await wrapNative(() =>
      nativeModule().listParticipants()
    );
    return participants.map(mapParticipant);
  }

  /** @internal test helper */
  static _resetActiveStageForTests(): void {
    activeStage = null;
  }

  /** @internal test helper */
  static _getActiveStageForTests(): IVSStage | null {
    return activeStage;
  }

  private assertNotDisposed() {
    if (this.disposed) {
      throw new IVSError('disposed', 'IVSStage has been disposed.');
    }
  }
}

/** Version of the underlying native Amazon IVS Broadcast SDK. */
export function getSdkVersion(): Promise<string> {
  return wrapNative(() => nativeModule().getSdkVersion());
}

export async function getCapabilities(): Promise<IVSCapabilities> {
  return wrapNative(() => nativeModule().getCapabilities());
}

export async function enumerateDevices(): Promise<IVSDeviceInfo[]> {
  const devices = await wrapNative(() => nativeModule().enumerateDevices());
  return devices.map((d) => ({
    deviceId: d.deviceId,
    urn: d.urn,
    friendlyName: d.friendlyName,
    type: parseDeviceType(d.type),
    position: parseDevicePosition(d.position),
    isDefault: d.isDefault,
  }));
}

export function getCameraPermission(): Promise<PermissionStatus> {
  return wrapNative(() => nativeModule().getCameraPermission()).then(
    parsePermissionStatus
  );
}

export function getMicrophonePermission(): Promise<PermissionStatus> {
  return wrapNative(() => nativeModule().getMicrophonePermission()).then(
    parsePermissionStatus
  );
}

export function requestCameraPermission(): Promise<PermissionStatus> {
  return wrapNative(() => nativeModule().requestCameraPermission()).then(
    parsePermissionStatus
  );
}

export function requestMicrophonePermission(): Promise<PermissionStatus> {
  return wrapNative(() => nativeModule().requestMicrophonePermission()).then(
    parsePermissionStatus
  );
}
