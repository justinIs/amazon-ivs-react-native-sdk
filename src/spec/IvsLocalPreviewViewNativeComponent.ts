import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

interface NativeProps extends ViewProps {
  /** Local device source: 'camera' | 'screen' | device urn. */
  source?: CodegenTypes.WithDefault<string, 'camera'>;
  mirror?: CodegenTypes.WithDefault<boolean, true>;
  aspectMode?: CodegenTypes.WithDefault<'fill' | 'fit', 'fill'>;
}

export default codegenNativeComponent<NativeProps>('IvsLocalPreviewView');
