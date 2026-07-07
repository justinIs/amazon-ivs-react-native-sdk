import NativeIvsRealtime from './NativeIvsRealtime';
import type { DeviceInfo } from './types';

export { CameraPreview } from './CameraPreview';
export type { CameraPreviewProps } from './CameraPreview';
export { ParticipantVideo } from './ParticipantVideo';
export type { ParticipantVideoProps } from './ParticipantVideo';
export { IvsStageProvider, useIvsStage } from './IvsStageProvider';
export type { IvsStageContextValue } from './IvsStageProvider';
export type {
  AspectMode,
  CameraPosition,
  DeviceInfo,
  DeviceType,
  StageConnectionState,
  StageLogEntry,
  StageParticipant,
  StagePublishState,
  StageSubscribeState,
} from './types';

/**
 * Returns the version of the underlying native IVS broadcast SDK.
 * Useful as a smoke test that the native library loaded correctly.
 */
export function getSdkVersion(): Promise<string> {
  return NativeIvsRealtime.getSdkVersion();
}

/**
 * Enumerate the local cameras and microphones reported by the IVS SDK.
 *
 * Call after camera/microphone permissions are granted, otherwise the
 * native SDK may report an empty or partial device list.
 */
export async function enumerateDevices(): Promise<DeviceInfo[]> {
  const devices = await NativeIvsRealtime.enumerateDevices();
  // Native returns plain objects already matching the DeviceInfo shape.
  return devices as DeviceInfo[];
}
