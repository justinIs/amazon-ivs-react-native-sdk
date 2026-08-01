import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

interface NativeProps extends ViewProps {
  participantId: string;
  mirror?: CodegenTypes.WithDefault<boolean, false>;
  aspectMode?: CodegenTypes.WithDefault<'fill' | 'fit', 'fill'>;
}

export default codegenNativeComponent<NativeProps>('IvsParticipantVideoView');
