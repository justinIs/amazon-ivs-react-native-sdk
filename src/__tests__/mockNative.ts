import type { Spec } from '../spec/NativeAmazonIvsRealTime';

type Sub = { remove: jest.Mock };

export type MockNative = {
  module: Spec;
  emitters: {
    onStageConnectionStateChanged: jest.Mock;
    onParticipantJoined: jest.Mock;
    onParticipantUpdated: jest.Mock;
    onParticipantLeft: jest.Mock;
    onParticipantStreamsChanged: jest.Mock;
    onAudioRouteChanged: jest.Mock;
    onStageError: jest.Mock;
  };
  emit: {
    connection: (payload: { state: string; error?: string }) => void;
    participantJoined: (payload: Record<string, unknown>) => void;
    participantUpdated: (payload: Record<string, unknown>) => void;
    participantLeft: (payload: { participantId: string }) => void;
    streamsChanged: (payload: Record<string, unknown>) => void;
    audioRoute: (payload: Record<string, unknown>) => void;
    error: (payload: Record<string, unknown>) => void;
  };
  state: {
    connectionState: string;
    publishEnabled: boolean;
    publishState: string;
    microphoneEnabled: boolean;
    cameraEnabled: boolean;
    cameraPosition: string;
    audioOutput: string;
    participants: Array<Record<string, unknown>>;
  };
};

function makeEmitter() {
  const listeners: Array<(payload: unknown) => void> = [];
  const subscribe = jest.fn((listener: (payload: unknown) => void): Sub => {
    listeners.push(listener);
    return {
      remove: jest.fn(() => {
        const i = listeners.indexOf(listener);
        if (i >= 0) listeners.splice(i, 1);
      }),
    };
  });
  return {
    subscribe,
    emit: (payload: unknown) => {
      for (const l of listeners.slice()) l(payload);
    },
  };
}

export function createMockNative(): MockNative {
  const connection = makeEmitter();
  const joined = makeEmitter();
  const updated = makeEmitter();
  const left = makeEmitter();
  const streams = makeEmitter();
  const audio = makeEmitter();
  const error = makeEmitter();

  const state = {
    connectionState: 'disconnected',
    publishEnabled: false,
    publishState: 'notPublished',
    microphoneEnabled: true,
    cameraEnabled: true,
    cameraPosition: 'front',
    audioOutput: 'auto',
    participants: [] as Array<Record<string, unknown>>,
  };

  const module = {
    getSdkVersion: jest.fn(async () => '1.43.0'),
    getCapabilities: jest.fn(async () => ({
      screenShare: false,
      backgroundAudio: true,
      bluetoothMicrophone: true,
      audioRouting: true,
      rtcStats: false,
      simulcast: false,
    })),
    enumerateDevices: jest.fn(async () => []),
    getCameraPermission: jest.fn(async () => 'undetermined'),
    getMicrophonePermission: jest.fn(async () => 'undetermined'),
    requestCameraPermission: jest.fn(async () => 'granted'),
    requestMicrophonePermission: jest.fn(async () => 'granted'),
    joinStage: jest.fn(
      async (_token: string, options: { publish?: boolean }) => {
        state.connectionState = 'connected';
        state.publishEnabled = options.publish ?? false;
        state.publishState = state.publishEnabled
          ? 'published'
          : 'notPublished';
        state.participants = [
          {
            participantId: 'local-1',
            userId: 'user-1',
            isLocal: true,
            attributes: { username: 'Alice' },
            publishState: state.publishState,
            subscribeState: 'notSubscribed',
            streams: [],
          },
        ];
        connection.emit({ state: 'connecting' });
        connection.emit({ state: 'connected' });
        joined.emit(state.participants[0]);
      }
    ),
    leaveStage: jest.fn(async () => {
      state.connectionState = 'disconnected';
      state.publishEnabled = false;
      state.publishState = 'notPublished';
      state.participants = [];
      connection.emit({ state: 'disconnected' });
    }),
    renewToken: jest.fn(async (_token: string) => {
      const old = state.participants.find((p) => p.isLocal);
      if (old) {
        left.emit({ participantId: old.participantId as string });
      }
      const next = {
        participantId: 'local-2',
        userId: (old?.userId as string) ?? 'user-1',
        isLocal: true,
        attributes: (old?.attributes as Record<string, string>) ?? {},
        publishState: state.publishState,
        subscribeState: 'notSubscribed',
        streams: [],
      };
      state.participants = state.participants
        .filter((p) => !p.isLocal)
        .concat([next]);
      joined.emit(next);
    }),
    listParticipants: jest.fn(async () => state.participants),
    readState: jest.fn(async () => ({
      connectionState: state.connectionState,
      publishEnabled: state.publishEnabled,
      publishState: state.publishState,
      microphoneEnabled: state.microphoneEnabled,
      cameraEnabled: state.cameraEnabled,
      cameraPosition: state.cameraPosition,
      audioOutput: state.audioOutput,
    })),
    setPublishEnabled: jest.fn(async (enabled: boolean) => {
      state.publishEnabled = enabled;
      state.publishState = enabled ? 'published' : 'notPublished';
    }),
    setMicrophoneEnabled: jest.fn(async (enabled: boolean) => {
      state.microphoneEnabled = enabled;
    }),
    setCameraEnabled: jest.fn(async (enabled: boolean) => {
      state.cameraEnabled = enabled;
    }),
    setCameraPosition: jest.fn(async (position: string) => {
      state.cameraPosition = position;
    }),
    flipCamera: jest.fn(async () => {
      state.cameraPosition =
        state.cameraPosition === 'front' ? 'back' : 'front';
    }),
    prepareDevices: jest.fn(async () => undefined),
    releaseDevices: jest.fn(async () => undefined),
    setVideoConfig: jest.fn(async () => undefined),
    setDefaultSubscribeType: jest.fn(async () => undefined),
    setSubscribeType: jest.fn(async () => undefined),
    setAudioPreset: jest.fn(async () => undefined),
    setAudioOutput: jest.fn(async (output: string) => {
      state.audioOutput = output;
    }),
    getAudioRoute: jest.fn(async () => ({
      output: state.audioOutput,
      activeOutput:
        state.audioOutput === 'auto' ? 'speaker' : state.audioOutput,
      availableOutputs: ['speaker', 'earpiece'],
    })),
    onStageConnectionStateChanged: connection.subscribe,
    onParticipantJoined: joined.subscribe,
    onParticipantUpdated: updated.subscribe,
    onParticipantLeft: left.subscribe,
    onParticipantStreamsChanged: streams.subscribe,
    onAudioRouteChanged: audio.subscribe,
    onStageError: error.subscribe,
  } as unknown as Spec;

  return {
    module,
    emitters: {
      onStageConnectionStateChanged: connection.subscribe,
      onParticipantJoined: joined.subscribe,
      onParticipantUpdated: updated.subscribe,
      onParticipantLeft: left.subscribe,
      onParticipantStreamsChanged: streams.subscribe,
      onAudioRouteChanged: audio.subscribe,
      onStageError: error.subscribe,
    },
    emit: {
      connection: connection.emit,
      participantJoined: joined.emit,
      participantUpdated: updated.emit,
      participantLeft: left.emit,
      streamsChanged: streams.emit,
      audioRoute: audio.emit,
      error: error.emit,
    },
    state,
  };
}
