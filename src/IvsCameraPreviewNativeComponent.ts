import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

/**
 * Codegen spec for the native camera-preview view (Fabric).
 *
 * The native side hosts the IVS SDK's `ImagePreviewView` for the selected
 * local camera. All props are optional with native-side defaults so the
 * component renders a live preview with zero configuration.
 */
export interface NativeProps extends ViewProps {
  /** 'front' (default) or 'back'. Changing it flips the camera. */
  cameraPosition?: CodegenTypes.WithDefault<string, 'front'>;
  /** Mirror the preview horizontally (defaults to true for the front camera). */
  mirror?: boolean;
  /** 'fill' (default, crop) or 'fit' (letterbox). */
  aspectMode?: CodegenTypes.WithDefault<string, 'fill'>;
}

export default codegenNativeComponent<NativeProps>('IvsCameraPreview');
