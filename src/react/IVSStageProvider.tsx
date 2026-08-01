import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  IVSStage,
  requestCameraPermission,
  requestMicrophonePermission,
} from '../core/IVSStage';
import { IVSError } from '../core/IVSError';
import type {
  AudioOutput,
  CameraPosition,
  IVSAudioRoute,
  IVSParticipantInfo,
  IVSStageStreamInfo,
  IVSVideoConfig,
  JoinOptions,
  ParticipantPublishState,
  PermissionStatus,
  StageConnectionState,
  SubscribeType,
} from '../core/types';

export type StageContextValue = {
  stage: IVSStage;
  connectionState: StageConnectionState;
  participants: IVSParticipantInfo[];
  localParticipant: IVSParticipantInfo | null;
  publishEnabled: boolean;
  publishState: ParticipantPublishState;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  cameraPosition: CameraPosition;
  audioRoute: IVSAudioRoute;
  error: IVSError | null;
  join: (token: string, opts?: JoinOptions) => Promise<void>;
  leave: () => Promise<void>;
  renewToken: (token: string) => Promise<void>;
  setPublishEnabled: (enabled: boolean) => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  setCameraEnabled: (enabled: boolean) => Promise<void>;
  setCameraPosition: (position: CameraPosition) => Promise<void>;
  flipCamera: () => Promise<void>;
  setSubscribeType: (
    participantId: string,
    type: SubscribeType
  ) => Promise<void>;
  setAudioOutput: (output: AudioOutput) => Promise<void>;
  prepareDevices: (opts?: {
    camera?: boolean;
    microphone?: boolean;
  }) => Promise<void>;
  releaseDevices: () => Promise<void>;
  requestPermissions: () => Promise<{
    camera: PermissionStatus;
    microphone: PermissionStatus;
  }>;
  clearError: () => void;
  // Deprecated aliases
  /** @deprecated Use setPublishEnabled */
  setPublishing: (enabled: boolean) => Promise<void>;
  /** @deprecated Use setMicrophoneEnabled(!muted) */
  setMicrophoneMuted: (muted: boolean) => Promise<void>;
  /** @deprecated Use flipCamera / setCameraPosition */
  switchCamera: (position?: CameraPosition) => Promise<void>;
};

const StageContext = createContext<StageContextValue | null>(null);

const DEFAULT_AUDIO_ROUTE: IVSAudioRoute = {
  output: 'auto',
  activeOutput: 'speaker',
  availableOutputs: ['speaker', 'earpiece'],
};

export type IVSStageProviderProps = {
  children: ReactNode;
  /** When set, automatically joins on mount / token change. */
  token?: string;
  /** Default subscribe type for remote participants. Defaults to audio-video. */
  subscribe?: SubscribeType;
  /** Video quality settings applied when publishing. */
  videoConfig?: IVSVideoConfig;
  /** Join options used when `token` prop triggers auto-join. */
  joinOptions?: JoinOptions;
};

function upsertParticipant(
  list: IVSParticipantInfo[],
  participant: IVSParticipantInfo
): IVSParticipantInfo[] {
  const index = list.findIndex(
    (p) => p.participantId === participant.participantId
  );
  if (index === -1) {
    return [...list, participant];
  }
  const next = list.slice();
  next[index] = participant;
  return next;
}

/**
 * Value comparison: freshly-mapped participants always carry new stream array
 * instances, so reference equality would defeat referential stability.
 */
function streamsEqual(
  a: IVSStageStreamInfo[],
  b: IVSStageStreamInfo[]
): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((stream, i) => {
    const other = b[i]!;
    return (
      stream.urn === other.urn &&
      stream.mediaType === other.mediaType &&
      stream.deviceType === other.deviceType &&
      stream.isMuted === other.isMuted
    );
  });
}

function attributesEqual(
  a: Record<string, string>,
  b: Record<string, string>
): boolean {
  if (a === b) {
    return true;
  }
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) {
    return false;
  }
  return aKeys.every((key) => a[key] === b[key]);
}

function replaceStreams(
  list: IVSParticipantInfo[],
  participantId: string,
  streams: IVSStageStreamInfo[]
): IVSParticipantInfo[] {
  return list.map((p) =>
    p.participantId === participantId ? { ...p, streams } : p
  );
}

/**
 * Owns an IVSStage instance and reconciles participant/connection state.
 * Subscribes to events first, then snapshots via listParticipants() —
 * the reverse order drops anything emitted between snapshot and subscription.
 */
export function IVSStageProvider({
  children,
  token,
  subscribe = 'audio-video',
  videoConfig,
  joinOptions,
}: IVSStageProviderProps) {
  const stageRef = useRef<IVSStage | null>(null);
  if (stageRef.current == null) {
    stageRef.current = new IVSStage();
  }
  const stage = stageRef.current;

  const [connectionState, setConnectionState] =
    useState<StageConnectionState>('disconnected');
  const [participants, setParticipants] = useState<IVSParticipantInfo[]>([]);
  const [publishEnabled, setPublishEnabledState] = useState(false);
  const [publishState, setPublishState] =
    useState<ParticipantPublishState>('notPublished');
  const [microphoneEnabled, setMicrophoneEnabledState] = useState(true);
  const [cameraEnabled, setCameraEnabledState] = useState(true);
  const [cameraPosition, setCameraPositionState] =
    useState<CameraPosition>('front');
  const [audioRoute, setAudioRoute] =
    useState<IVSAudioRoute>(DEFAULT_AUDIO_ROUTE);
  const [error, setError] = useState<IVSError | null>(null);

  // Stable identity cache for participant objects (referential stability).
  const participantCache = useRef(new Map<string, IVSParticipantInfo>());

  const stabilizeParticipants = useCallback(
    (list: IVSParticipantInfo[]): IVSParticipantInfo[] => {
      const nextCache = new Map<string, IVSParticipantInfo>();
      const result = list.map((p) => {
        const prev = participantCache.current.get(p.participantId);
        if (
          prev != null &&
          prev.userId === p.userId &&
          prev.isLocal === p.isLocal &&
          prev.publishState === p.publishState &&
          prev.subscribeState === p.subscribeState &&
          streamsEqual(prev.streams, p.streams) &&
          attributesEqual(prev.attributes, p.attributes)
        ) {
          nextCache.set(p.participantId, prev);
          return prev;
        }
        nextCache.set(p.participantId, p);
        return p;
      });
      participantCache.current = nextCache;
      return result;
    },
    []
  );

  const refreshLocalMediaFlags = useCallback(async () => {
    const state = await stage.readState();
    setMicrophoneEnabledState(state.microphoneEnabled);
    setCameraEnabledState(state.cameraEnabled);
    setPublishEnabledState(state.publishEnabled);
    setPublishState(state.publishState);
    setCameraPositionState(state.cameraPosition);
    setConnectionState(state.connectionState);
  }, [stage]);

  useEffect(() => {
    let cancelled = false;
    const pendingEvents: Array<() => void> = [];
    let snapshotReady = false;

    const applyOrBuffer = (fn: () => void) => {
      if (snapshotReady) {
        fn();
      } else {
        pendingEvents.push(fn);
      }
    };

    const unsubscribers = [
      stage.on('connectionStateChanged', (event) => {
        applyOrBuffer(() => {
          setConnectionState(event.state);
          if (event.error) {
            setError(event.error);
          }
        });
      }),
      stage.on('participantJoined', (participant) => {
        applyOrBuffer(() => {
          setParticipants((prev) =>
            stabilizeParticipants(upsertParticipant(prev, participant))
          );
        });
      }),
      stage.on('participantLeft', (event) => {
        applyOrBuffer(() => {
          setParticipants((prev) =>
            stabilizeParticipants(
              prev.filter((p) => p.participantId !== event.participantId)
            )
          );
        });
      }),
      stage.on('participantUpdated', (participant) => {
        applyOrBuffer(() => {
          setParticipants((prev) =>
            stabilizeParticipants(upsertParticipant(prev, participant))
          );
          if (participant.isLocal) {
            setPublishState(participant.publishState);
          }
        });
      }),
      stage.on('streamsChanged', (event) => {
        applyOrBuffer(() => {
          setParticipants((prev) =>
            stabilizeParticipants(
              replaceStreams(prev, event.participantId, event.streams)
            )
          );
        });
      }),
      stage.on('audioRouteChanged', (route) => {
        applyOrBuffer(() => {
          setAudioRoute(route);
        });
      }),
      stage.on('error', (event) => {
        applyOrBuffer(() => {
          setError(event);
        });
      }),
    ];

    (async () => {
      try {
        await stage.setDefaultSubscribeType(subscribe);
        if (videoConfig != null) {
          await stage.setVideoConfig(videoConfig);
        }
        const [state, snapshot] = await Promise.all([
          stage.readState(),
          stage.listParticipants(),
        ]);
        if (cancelled) {
          return;
        }
        setConnectionState(state.connectionState);
        setPublishEnabledState(state.publishEnabled);
        setPublishState(state.publishState);
        setMicrophoneEnabledState(state.microphoneEnabled);
        setCameraEnabledState(state.cameraEnabled);
        setCameraPositionState(state.cameraPosition);
        setParticipants((prev) => {
          const byId = new Map(prev.map((p) => [p.participantId, p]));
          for (const p of snapshot) {
            byId.set(p.participantId, p);
          }
          return stabilizeParticipants(Array.from(byId.values()));
        });
        snapshotReady = true;
        for (const fn of pendingEvents) {
          fn();
        }
        pendingEvents.length = 0;
        try {
          const route = await stage.getAudioRoute();
          if (!cancelled) {
            setAudioRoute(route);
          }
        } catch {
          // Audio route may be unavailable before session setup.
        }
      } catch (e) {
        if (!cancelled) {
          setError(IVSError.fromUnknown(e));
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub());
      const instance = stage;
      instance
        .leave()
        .catch(() => undefined)
        .finally(() => {
          instance.dispose();
        });
    };
    // Intentionally mount-once for the Stage instance lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    stage.setDefaultSubscribeType(subscribe).catch((e) => {
      setError(IVSError.fromUnknown(e));
    });
  }, [stage, subscribe]);

  useEffect(() => {
    if (videoConfig == null) {
      return;
    }
    stage.setVideoConfig(videoConfig).catch((e) => {
      setError(IVSError.fromUnknown(e));
    });
  }, [stage, videoConfig]);

  useEffect(() => {
    if (token == null || token.trim().length === 0) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const state = await stage.readState();
        if (cancelled || state.connectionState !== 'disconnected') {
          return;
        }
        await stage.join(token.trim(), joinOptions);
        if (!cancelled) {
          await refreshLocalMediaFlags();
        }
      } catch (e) {
        if (!cancelled) {
          setError(IVSError.fromUnknown(e, 'join-failed'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stage, token, joinOptions, refreshLocalMediaFlags]);

  const join = useCallback(
    async (joinToken: string, opts?: JoinOptions) => {
      setError(null);
      try {
        await stage.join(joinToken, opts);
        await refreshLocalMediaFlags();
      } catch (e) {
        const ivsError = IVSError.fromUnknown(e, 'join-failed');
        setError(ivsError);
        throw ivsError;
      }
    },
    [stage, refreshLocalMediaFlags]
  );

  const leave = useCallback(async () => {
    setError(null);
    await stage.leave();
    setParticipants([]);
    setConnectionState('disconnected');
    setPublishEnabledState(false);
    setPublishState('notPublished');
  }, [stage]);

  const renewToken = useCallback(
    async (nextToken: string) => {
      setError(null);
      try {
        await stage.renewToken(nextToken);
        await refreshLocalMediaFlags();
      } catch (e) {
        const ivsError = IVSError.fromUnknown(e, 'token-invalid');
        setError(ivsError);
        throw ivsError;
      }
    },
    [stage, refreshLocalMediaFlags]
  );

  const setPublishEnabled = useCallback(
    async (enabled: boolean) => {
      setPublishEnabledState(enabled);
      try {
        await stage.setPublishEnabled(enabled);
        await refreshLocalMediaFlags();
      } catch (e) {
        setPublishEnabledState(!enabled);
        const ivsError = IVSError.fromUnknown(e);
        setError(ivsError);
        throw ivsError;
      }
    },
    [stage, refreshLocalMediaFlags]
  );

  const setMicrophoneEnabled = useCallback(
    async (enabled: boolean) => {
      setMicrophoneEnabledState(enabled);
      try {
        await stage.setMicrophoneEnabled(enabled);
      } catch (e) {
        setMicrophoneEnabledState(!enabled);
        const ivsError = IVSError.fromUnknown(e);
        setError(ivsError);
        throw ivsError;
      }
    },
    [stage]
  );

  const setCameraEnabled = useCallback(
    async (enabled: boolean) => {
      setCameraEnabledState(enabled);
      try {
        await stage.setCameraEnabled(enabled);
      } catch (e) {
        setCameraEnabledState(!enabled);
        const ivsError = IVSError.fromUnknown(e);
        setError(ivsError);
        throw ivsError;
      }
    },
    [stage]
  );

  const setCameraPosition = useCallback(
    async (position: CameraPosition) => {
      await stage.setCameraPosition(position);
      setCameraPositionState(position);
    },
    [stage]
  );

  const flipCamera = useCallback(async () => {
    await stage.flipCamera();
    const state = await stage.readState();
    setCameraPositionState(state.cameraPosition);
  }, [stage]);

  const setSubscribeType = useCallback(
    async (participantId: string, type: SubscribeType) => {
      await stage.setSubscribeType(participantId, type);
    },
    [stage]
  );

  const setAudioOutput = useCallback(
    async (output: AudioOutput) => {
      await stage.setAudioOutput(output);
      const route = await stage.getAudioRoute();
      setAudioRoute(route);
    },
    [stage]
  );

  const prepareDevices = useCallback(
    async (opts?: { camera?: boolean; microphone?: boolean }) => {
      await stage.prepareDevices(opts);
    },
    [stage]
  );

  const releaseDevices = useCallback(async () => {
    await stage.releaseDevices();
  }, [stage]);

  const requestPermissions = useCallback(async () => {
    const [camera, microphone] = await Promise.all([
      requestCameraPermission(),
      requestMicrophonePermission(),
    ]);
    return { camera, microphone };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setPublishing = setPublishEnabled;
  const setMicrophoneMuted = useCallback(
    (muted: boolean) => setMicrophoneEnabled(!muted),
    [setMicrophoneEnabled]
  );
  const switchCamera = useCallback(
    async (position?: CameraPosition) => {
      if (position != null) {
        await setCameraPosition(position);
        return;
      }
      await flipCamera();
    },
    [setCameraPosition, flipCamera]
  );

  const localParticipant = participants.find((p) => p.isLocal) ?? null;

  const value = useMemo<StageContextValue>(
    () => ({
      stage,
      connectionState,
      participants,
      localParticipant,
      publishEnabled,
      publishState,
      microphoneEnabled,
      cameraEnabled,
      cameraPosition,
      audioRoute,
      error,
      join,
      leave,
      renewToken,
      setPublishEnabled,
      setMicrophoneEnabled,
      setCameraEnabled,
      setCameraPosition,
      flipCamera,
      setSubscribeType,
      setAudioOutput,
      prepareDevices,
      releaseDevices,
      requestPermissions,
      clearError,
      setPublishing,
      setMicrophoneMuted,
      switchCamera,
    }),
    [
      stage,
      connectionState,
      participants,
      localParticipant,
      publishEnabled,
      publishState,
      microphoneEnabled,
      cameraEnabled,
      cameraPosition,
      audioRoute,
      error,
      join,
      leave,
      renewToken,
      setPublishEnabled,
      setMicrophoneEnabled,
      setCameraEnabled,
      setCameraPosition,
      flipCamera,
      setSubscribeType,
      setAudioOutput,
      prepareDevices,
      releaseDevices,
      requestPermissions,
      clearError,
      setPublishing,
      setMicrophoneMuted,
      switchCamera,
    ]
  );

  return (
    <StageContext.Provider value={value}>{children}</StageContext.Provider>
  );
}

export function useStageContext(): StageContextValue {
  const ctx = useContext(StageContext);
  if (ctx == null) {
    throw new Error('IVS hooks must be used within an <IVSStageProvider>.');
  }
  return ctx;
}
