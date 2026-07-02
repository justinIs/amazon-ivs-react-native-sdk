import { useCallback, useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CameraPreview,
  enumerateDevices,
  getSdkVersion,
  type CameraPosition,
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

export default function App() {
  const [granted, setGranted] = useState(false);
  const [sdkVersion, setSdkVersion] = useState('…');
  const [position, setPosition] = useState<CameraPosition>('front');
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

  const flip = useCallback(() => {
    setPosition((p) => (p === 'front' ? 'back' : 'front'));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IVS Real-Time — Local Preview PoC</Text>
      <Text style={styles.meta}>Native SDK version: {sdkVersion}</Text>

      {/* The preview is a native view; size/position it with plain RN styles. */}
      <View style={styles.previewCard}>
        {granted ? (
          <CameraPreview
            position={position}
            aspectMode="fill"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {error ?? 'Requesting camera permission…'}
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={[styles.button, !granted && styles.buttonDisabled]}
        onPress={flip}
        disabled={!granted}
      >
        <Text style={styles.buttonText}>Flip camera (now: {position})</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>
        Discovered devices ({devices.length})
      </Text>
      <ScrollView style={styles.deviceList}>
        {devices.map((d) => (
          <Text key={d.id} style={styles.deviceRow}>
            {d.type} · {d.position} · {d.name}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  meta: { color: '#9aa0a6', marginTop: 4, marginBottom: 12 },
  previewCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: {
    color: '#9aa0a6',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2f6fed',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#333' },
  buttonText: { color: '#fff', fontWeight: '600' },
  sectionTitle: {
    color: '#fff',
    marginTop: 20,
    marginBottom: 6,
    fontWeight: '600',
  },
  deviceList: { flex: 1 },
  deviceRow: { color: '#c8ccd0', paddingVertical: 4, fontFamily: 'monospace' },
});
