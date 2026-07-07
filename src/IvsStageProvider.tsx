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
import NativeIvsStage from './NativeIvsStage';
import type {
  StageConnectionState,
  StageLogEntry,
  StageParticipant,
  StagePublishState,
  StageSubscribeState,
} from './types';

/** Value exposed by {@link IvsStageProvider} via {@link useIvsStage}. */
export interface IvsStageContextValue {
  /** Current Stage connection state. */
  connectionState: StageConnectionState;
  /** Participants currently in the Stage (including the local one). */
  participants: StageParticipant[];
  /** Rolling log of Stage events, newest first (capped). */
  log: StageLogEntry[];
  /** Last error message surfaced by the SDK, if any. */
  error: string | null;
  /** True while the local camera stream is muted (not sent to others). */
  videoMuted: boolean;
  /** True while the local microphone stream is muted. */
  audioMuted: boolean;
  /** Join a Stage with an AWS-issued participant token. */
  join: (token: string) => Promise<void>;
  /** Leave the current Stage. */
  leave: () => void;
  /** Toggle the local camera mute (self and remote view). */
  toggleVideo: () => void;
  /** Toggle the local microphone mute. */
  toggleAudio: () => void;
}

const IvsStageContext = createContext<IvsStageContextValue | null>(null);

const LOG_CAP = 200;

/** Short id for readable logs. */
function short(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/**
 * Parse the JSON attribute map the native side sends. Attributes cross the
 * bridge as a JSON string (codegen event payloads are flat); tolerate malformed
 * or empty input by returning an empty map.
 */
function parseAttributes(json: string): Record<string, string> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function upsertParticipant(
  list: StageParticipant[],
  next: StageParticipant
): StageParticipant[] {
  const i = list.findIndex((p) => p.participantId === next.participantId);
  if (i === -1) return [...list, next];
  const copy = list.slice();
  copy[i] = { ...copy[i], ...next };
  return copy;
}

function patchParticipant(
  list: StageParticipant[],
  participantId: string,
  patch: Partial<StageParticipant>
): StageParticipant[] {
  return list.map((p) =>
    p.participantId === participantId ? { ...p, ...patch } : p
  );
}

/**
 * Manages a single IVS Stage connection and exposes its state to the tree.
 *
 * Subscribes to the native Stage events once on mount and reduces them into
 * `connectionState`, a `participants` list, and a rolling `log` for UI feedback.
 * Wrap the part of your app that needs Stage access and read it with
 * {@link useIvsStage}.
 */
export function IvsStageProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] =
    useState<StageConnectionState>('disconnected');
  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [log, setLog] = useState<StageLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Local publish mute state (we publish camera+mic on join; these toggle them).
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const seq = useRef(0);

  const append = useCallback((message: string) => {
    setLog((prev) =>
      [{ id: seq.current++, time: Date.now(), message }, ...prev].slice(
        0,
        LOG_CAP
      )
    );
  }, []);

  useEffect(() => {
    const subscriptions = [
      NativeIvsStage.onConnectionStateChanged((e) => {
        setConnectionState(e.state as StageConnectionState);
        if (e.state === 'disconnected') {
          setParticipants([]);
          // Native rebuilds unmuted streams on the next join; mirror that here.
          setVideoMuted(false);
          setAudioMuted(false);
        }
        append(`connection: ${e.state}`);
      }),
      NativeIvsStage.onParticipantJoined((e) => {
        setParticipants((prev) =>
          upsertParticipant(prev, {
            participantId: e.participantId,
            userId: e.userId,
            isLocal: e.isLocal,
            publishState: 'not_published',
            subscribeState: 'not_subscribed',
            attributes: parseAttributes(e.attributesJson),
            canPublish: e.canPublish,
            canSubscribe: e.canSubscribe,
            hasVideo: false,
            hasAudio: false,
            videoMuted: false,
            audioMuted: false,
            streamVersion: 0,
          })
        );
        append(
          `joined: ${e.isLocal ? '(you) ' : ''}${short(e.participantId)}` +
            (e.userId ? ` [${e.userId}]` : '')
        );
      }),
      NativeIvsStage.onParticipantMetadataUpdated((e) => {
        setParticipants((prev) =>
          patchParticipant(prev, e.participantId, {
            attributes: parseAttributes(e.attributesJson),
          })
        );
        append(`metadata updated: ${short(e.participantId)}`);
      }),
      NativeIvsStage.onParticipantLeft((e) => {
        setParticipants((prev) =>
          prev.filter((p) => p.participantId !== e.participantId)
        );
        append(`left: ${short(e.participantId)}`);
      }),
      NativeIvsStage.onParticipantPublishStateChanged((e) => {
        setParticipants((prev) =>
          patchParticipant(prev, e.participantId, {
            publishState: e.state as StagePublishState,
          })
        );
        append(`publish ${short(e.participantId)}: ${e.state}`);
      }),
      NativeIvsStage.onParticipantSubscribeStateChanged((e) => {
        setParticipants((prev) =>
          patchParticipant(prev, e.participantId, {
            subscribeState: e.state as StageSubscribeState,
          })
        );
        append(`subscribe ${short(e.participantId)}: ${e.state}`);
      }),
      NativeIvsStage.onParticipantStreamsChanged((e) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.participantId === e.participantId
              ? {
                  ...p,
                  hasVideo: e.hasVideo,
                  hasAudio: e.hasAudio,
                  videoMuted: e.videoMuted,
                  audioMuted: e.audioMuted,
                  // Bump so <ParticipantVideo> re-resolves the native device.
                  streamVersion: p.streamVersion + 1,
                }
              : p
          )
        );
        append(
          `streams ${short(e.participantId)}: ` +
            `video=${e.hasVideo ? (e.videoMuted ? 'muted' : 'on') : 'off'} ` +
            `audio=${e.hasAudio ? (e.audioMuted ? 'muted' : 'on') : 'off'}`
        );
      }),
      NativeIvsStage.onError((e) => {
        setError(e.message);
        append(`error: ${e.message}`);
      }),
    ];
    return () => subscriptions.forEach((s) => s.remove());
  }, [append]);

  const join = useCallback(
    async (token: string) => {
      setError(null);
      append('joining…');
      try {
        await NativeIvsStage.joinStage(token);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        append(`join failed: ${message}`);
        throw e;
      }
    },
    [append]
  );

  const leave = useCallback(() => {
    NativeIvsStage.leaveStage();
    append('leaving…');
  }, [append]);

  const toggleVideo = useCallback(() => {
    setVideoMuted((muted) => {
      const next = !muted;
      NativeIvsStage.setLocalVideoMuted(next);
      append(`camera ${next ? 'muted' : 'unmuted'}`);
      return next;
    });
  }, [append]);

  const toggleAudio = useCallback(() => {
    setAudioMuted((muted) => {
      const next = !muted;
      NativeIvsStage.setLocalAudioMuted(next);
      append(`mic ${next ? 'muted' : 'unmuted'}`);
      return next;
    });
  }, [append]);

  const value = useMemo<IvsStageContextValue>(
    () => ({
      connectionState,
      participants,
      log,
      error,
      videoMuted,
      audioMuted,
      join,
      leave,
      toggleVideo,
      toggleAudio,
    }),
    [
      connectionState,
      participants,
      log,
      error,
      videoMuted,
      audioMuted,
      join,
      leave,
      toggleVideo,
      toggleAudio,
    ]
  );

  return (
    <IvsStageContext.Provider value={value}>
      {children}
    </IvsStageContext.Provider>
  );
}

/** Access the nearest {@link IvsStageProvider}'s Stage state and controls. */
export function useIvsStage(): IvsStageContextValue {
  const ctx = useContext(IvsStageContext);
  if (!ctx) {
    throw new Error('useIvsStage must be used within an <IvsStageProvider>');
  }
  return ctx;
}
