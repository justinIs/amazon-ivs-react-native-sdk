import IvsParticipantVideoViewNativeComponent from '../spec/IvsParticipantVideoViewNativeComponent';
import type { ViewProps } from 'react-native';
import type { AspectMode } from '../core/types';

export interface IVSParticipantVideoViewProps extends ViewProps {
  /** Participant whose video stream should be rendered. */
  participantId: string;
  /** Horizontally mirror the video. Defaults to false. */
  mirror?: boolean;
  /** How the video fills the view bounds. Defaults to 'fill'. */
  aspectMode?: AspectMode;
}

/** Renders a remote (or local) participant's video stage stream natively. */
export function IVSParticipantVideoView({
  participantId,
  mirror = false,
  aspectMode = 'fill',
  ...viewProps
}: IVSParticipantVideoViewProps) {
  return (
    <IvsParticipantVideoViewNativeComponent
      participantId={participantId}
      mirror={mirror}
      aspectMode={aspectMode}
      {...viewProps}
    />
  );
}
