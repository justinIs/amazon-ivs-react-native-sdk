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
  /** Join a Stage with an AWS-issued participant token. */
  join: (token: string) => Promise<void>;
  /** Leave the current Stage. */
  leave: () => void;
}

const IvsStageContext = createContext<IvsStageContextValue | null>(null);

const LOG_CAP = 200;

/** Short id for readable logs. */
function short(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
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
        if (e.state === 'disconnected') setParticipants([]);
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
          })
        );
        append(
          `joined: ${e.isLocal ? '(you) ' : ''}${short(e.participantId)}` +
            (e.userId ? ` [${e.userId}]` : '')
        );
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

  const value = useMemo<IvsStageContextValue>(
    () => ({ connectionState, participants, log, error, join, leave }),
    [connectionState, participants, log, error, join, leave]
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
