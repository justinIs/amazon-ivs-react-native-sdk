import { useEffect } from 'react';
import { useStageContext, type StageContextValue } from './IVSStageProvider';
import type {
  IVSParticipantInfo,
  IVSStageStreamInfo,
  StageEventMap,
  StageEventName,
} from '../core/types';

/** Connection state, join/leave, and the underlying IVSStage instance. */
export function useStage(): Pick<
  StageContextValue,
  | 'connectionState'
  | 'error'
  | 'join'
  | 'leave'
  | 'renewToken'
  | 'clearError'
  | 'stage'
> {
  const ctx = useStageContext();
  return {
    connectionState: ctx.connectionState,
    error: ctx.error,
    join: ctx.join,
    leave: ctx.leave,
    renewToken: ctx.renewToken,
    clearError: ctx.clearError,
    stage: ctx.stage,
  };
}

/** All participants currently on the stage (local + remote). */
export function useParticipants(): IVSParticipantInfo[] {
  return useStageContext().participants;
}

/**
 * Thin selector over useParticipants — streams render natively by participantId;
 * JS only sees metadata.
 */
export function useParticipantStreams(
  participantId: string
): IVSStageStreamInfo[] {
  const participants = useParticipants();
  const participant = participants.find(
    (p) => p.participantId === participantId
  );
  return participant?.streams ?? [];
}

/** Local media controls and publish intent/state. */
export function useLocalMedia(): Pick<
  StageContextValue,
  | 'localParticipant'
  | 'publishEnabled'
  | 'publishState'
  | 'microphoneEnabled'
  | 'cameraEnabled'
  | 'cameraPosition'
  | 'setPublishEnabled'
  | 'setMicrophoneEnabled'
  | 'setCameraEnabled'
  | 'setCameraPosition'
  | 'flipCamera'
  | 'prepareDevices'
  | 'releaseDevices'
  | 'requestPermissions'
  | 'setPublishing'
  | 'setMicrophoneMuted'
  | 'switchCamera'
> {
  const ctx = useStageContext();
  return {
    localParticipant: ctx.localParticipant,
    publishEnabled: ctx.publishEnabled,
    publishState: ctx.publishState,
    microphoneEnabled: ctx.microphoneEnabled,
    cameraEnabled: ctx.cameraEnabled,
    cameraPosition: ctx.cameraPosition,
    setPublishEnabled: ctx.setPublishEnabled,
    setMicrophoneEnabled: ctx.setMicrophoneEnabled,
    setCameraEnabled: ctx.setCameraEnabled,
    setCameraPosition: ctx.setCameraPosition,
    flipCamera: ctx.flipCamera,
    prepareDevices: ctx.prepareDevices,
    releaseDevices: ctx.releaseDevices,
    requestPermissions: ctx.requestPermissions,
    setPublishing: ctx.setPublishing,
    setMicrophoneMuted: ctx.setMicrophoneMuted,
    switchCamera: ctx.switchCamera,
  };
}

/** Current audio route plus setter, fed by `audioRouteChanged`. */
export function useAudioRoute(): Pick<
  StageContextValue,
  'audioRoute' | 'setAudioOutput'
> {
  const ctx = useStageContext();
  return {
    audioRoute: ctx.audioRoute,
    setAudioOutput: ctx.setAudioOutput,
  };
}

/**
 * Subscribe to a Stage event for side effects (analytics, toasts).
 * Generic over the event name so the listener payload is typed from StageEventMap.
 */
export function useStageEvent<E extends StageEventName>(
  event: E,
  listener: (payload: StageEventMap[E]) => void
): void {
  const { stage } = useStageContext();
  useEffect(() => {
    const unsubscribe = stage.on(event, listener);
    return unsubscribe;
  }, [stage, event, listener]);
}
