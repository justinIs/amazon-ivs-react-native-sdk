import type { ViewProps } from 'react-native';
import IvsCameraPreviewNativeComponent from './IvsCameraPreviewNativeComponent';
import type { AspectMode, CameraPosition } from './types';

export interface CameraPreviewProps extends ViewProps {
  /** Which camera to show. Defaults to `'front'`. */
  position?: CameraPosition;
  /**
   * Mirror the preview horizontally. Defaults to `true` for the front camera
   * and `false` for the back camera (matches typical selfie behaviour).
   */
  mirror?: boolean;
  /** How the image fits the view. Defaults to `'fill'`. */
  aspectMode?: AspectMode;
}

/**
 * Live local camera preview backed by the native IVS `ImagePreviewView`.
 *
 * Size and position it with normal React Native styling — e.g. a full-screen
 * feed, a rounded card, or an absolutely-positioned picture-in-picture tile.
 * This renders the on-device camera only; it does not join or publish to a Stage.
 */
export function CameraPreview({
  position = 'front',
  mirror,
  aspectMode = 'fill',
  ...viewProps
}: CameraPreviewProps) {
  // Resolve the mirror default here so the native side always receives an
  // explicit boolean (codegen booleans can't express "default true for front").
  const resolvedMirror = mirror ?? position === 'front';

  return (
    <IvsCameraPreviewNativeComponent
      cameraPosition={position}
      mirror={resolvedMirror}
      aspectMode={aspectMode}
      {...viewProps}
    />
  );
}
