import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

/**
 * Codegen spec for the native remote-participant video view (Fabric).
 *
 * The native side resolves the participant's current video device from the
 * shared stream registry (populated by the Stage module) and hosts its IVS
 * `ImagePreviewView`. JS carries no media objects — only the participant id and
 * a version counter.
 */
export interface NativeProps extends ViewProps {
  /** Id of the participant whose video to render. */
  participantId: string;
  /** 'fill' (default, crop) or 'fit' (letterbox). */
  aspectMode?: CodegenTypes.WithDefault<string, 'fill'>;
  /**
   * Mirror the video horizontally. Only affects local rendering — use it for a
   * front-camera self-view. Defaults to false (remote video is shown as sent).
   */
  mirror?: boolean;
  /**
   * Bumped by JS whenever the participant's streams change, so the native view
   * re-resolves the (possibly new) video device even when `participantId` is
   * unchanged.
   */
  streamVersion?: CodegenTypes.WithDefault<CodegenTypes.Int32, 0>;
}

export default codegenNativeComponent<NativeProps>('IvsParticipantView');
