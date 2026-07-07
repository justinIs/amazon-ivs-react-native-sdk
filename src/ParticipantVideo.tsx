import type { ViewProps } from 'react-native';
import IvsParticipantViewNativeComponent from './IvsParticipantViewNativeComponent';
import type { AspectMode } from './types';

export interface ParticipantVideoProps extends ViewProps {
  /** Id of the participant whose video to render (from `StageParticipant`). */
  participantId: string;
  /** How the image fits the view. Defaults to `'fill'`. */
  aspectMode?: AspectMode;
  /**
   * Mirror the video horizontally (local rendering only). Use it for a
   * front-camera self-view. Defaults to `false`.
   */
  mirror?: boolean;
  /**
   * The participant's current `streamVersion` (from the Stage provider). Pass it
   * through so the native view re-resolves the video device when the
   * participant's streams change. Defaults to `0`.
   */
  streamVersion?: number;
}

/**
 * Renders a remote Stage participant's live video, backed by the native IVS
 * preview for their subscribed video device.
 *
 * Size and position it with normal React Native styling. Only render it for a
 * participant who is actually sending video (`participant.hasVideo`); otherwise
 * it shows nothing. Must be used while connected to a Stage via
 * {@link IvsStageProvider}.
 */
export function ParticipantVideo({
  participantId,
  aspectMode = 'fill',
  mirror = false,
  streamVersion = 0,
  ...viewProps
}: ParticipantVideoProps) {
  return (
    <IvsParticipantViewNativeComponent
      participantId={participantId}
      aspectMode={aspectMode}
      mirror={mirror}
      streamVersion={streamVersion}
      {...viewProps}
    />
  );
}
