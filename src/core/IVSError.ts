import type { IVSErrorCode, NativeErrorDetails } from './types';

const KNOWN_CODES: ReadonlySet<string> = new Set([
  'token-expired',
  'token-invalid',
  'join-failed',
  'permission-denied',
  'device-unavailable',
  'disconnected',
  'stage-in-use',
  'disposed',
  'not-linked',
  'unknown',
]);

export function normalizeErrorCode(
  code: string | undefined
): IVSErrorCode | null {
  if (code != null && KNOWN_CODES.has(code)) {
    return code as IVSErrorCode;
  }
  return null;
}

/**
 * Normalized error from the IVS Real-Time SDK.
 * All promise rejections and `error` events are instances of this class.
 */
export class IVSError extends Error {
  readonly code: IVSErrorCode;
  readonly nativeError?: NativeErrorDetails;

  constructor(
    code: IVSErrorCode,
    message: string,
    nativeError?: NativeErrorDetails
  ) {
    super(message);
    this.name = 'IVSError';
    this.code = code;
    this.nativeError = nativeError;
  }

  static isIVSError(error: unknown): error is IVSError {
    return error instanceof IVSError;
  }

  static fromUnknown(
    error: unknown,
    fallbackCode: IVSErrorCode = 'unknown'
  ): IVSError {
    if (error instanceof IVSError) {
      return error;
    }

    if (error != null && typeof error === 'object') {
      const e = error as {
        code?: string;
        message?: string;
        userInfo?: NativeErrorDetails;
        nativeError?: NativeErrorDetails;
      };
      const code = normalizeErrorCode(e.code) ?? fallbackCode;
      const message =
        typeof e.message === 'string' && e.message.length > 0
          ? e.message
          : 'An unknown error occurred.';
      return new IVSError(code, message, e.nativeError ?? e.userInfo);
    }

    return new IVSError(
      fallbackCode,
      error instanceof Error ? error.message : String(error)
    );
  }
}
