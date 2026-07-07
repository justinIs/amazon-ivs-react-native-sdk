import { useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import {
  enumerateDevices,
  getSdkVersion,
  type DeviceInfo,
} from 'amazon-ivs-react-native-sdk';

async function requestCameraPermission(): Promise<boolean> {
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
  return (
    result[PermissionsAndroid.PERMISSIONS.CAMERA] ===
    PermissionsAndroid.RESULTS.GRANTED
  );
}

export interface CameraDevicesState {
  granted: boolean;
  sdkVersion: string;
  devices: DeviceInfo[];
  error: string | null;
}

/**
 * Requests camera/mic permission on mount, reads the native SDK version, and
 * enumerates local devices. Encapsulates the one-time setup so screens stay
 * presentational.
 */
export function useCameraDevices(): CameraDevicesState {
  const [granted, setGranted] = useState(false);
  const [sdkVersion, setSdkVersion] = useState('…');
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSdkVersion(await getSdkVersion());
        const ok = await requestCameraPermission();
        setGranted(ok);
        if (ok) {
          setDevices(await enumerateDevices());
        } else {
          setError('Camera permission was denied.');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  return { granted, sdkVersion, devices, error };
}
