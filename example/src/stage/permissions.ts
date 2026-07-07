import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request camera + microphone permission so we can publish local media to a
 * Stage. Returns whether the camera was granted (the visible signal); audio is
 * requested too but treated as best-effort. Safe to call repeatedly — Android
 * no-ops once granted.
 */
export async function ensureMediaPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    return (
      result[PermissionsAndroid.PERMISSIONS.CAMERA] ===
      PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}
