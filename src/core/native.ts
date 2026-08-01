import NativeAmazonIvsRealTime, {
  type Spec,
} from '../spec/NativeAmazonIvsRealTime';
import { IVSError } from './IVSError';
import type { IVSErrorCode } from './types';

export function nativeModule(): Spec {
  if (NativeAmazonIvsRealTime == null) {
    throw new IVSError(
      'not-linked',
      "'amazon-ivs-react-native-sdk' native module is not linked. Rebuild the app after installing the package."
    );
  }
  return NativeAmazonIvsRealTime;
}

export async function wrapNative<T>(
  operation: () => Promise<T>,
  fallbackCode: IVSErrorCode = 'unknown'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw IVSError.fromUnknown(error, fallbackCode);
  }
}
