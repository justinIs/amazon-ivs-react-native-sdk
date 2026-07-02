import { useCallback, useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CameraPreview,
  enumerateDevices,
  getSdkVersion,
  IvsStageProvider,
  useIvsStage,
  type CameraPosition,
  type DeviceInfo,
  type StageConnectionState,
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

const CONNECTION_COLOR: Record<StageConnectionState, string> = {
  disconnected: '#6b7280',
  connecting: '#d9a300',
  connected: '#1f9d55',
};

/** Connect/observe panel driven entirely by the Stage provider's state. */
function StagePanel() {
  const { connectionState, participants, log, error, join, leave } =
    useIvsStage();
  const [token, setToken] = useState('');
  const connected = connectionState !== 'disconnected';

  const onConnect = useCallback(() => {
    // Errors are surfaced through the provider's `error`/log; swallow the reject.
    join(token.trim()).catch(() => {});
  }, [join, token]);

  return (
    <View style={styles.stagePanel}>
      <View style={styles.stageHeader}>
        <Text style={styles.sectionTitle}>Stage</Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badgeDot,
              { backgroundColor: CONNECTION_COLOR[connectionState] },
            ]}
          />
          <Text style={styles.badgeText}>{connectionState}</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Paste a participant token"
        placeholderTextColor="#6b7280"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!connected}
      />

      <View style={styles.stageButtons}>
        <Pressable
          style={[
            styles.button,
            styles.buttonFlex,
            (connected || !token.trim()) && styles.buttonDisabled,
          ]}
          onPress={onConnect}
          disabled={connected || !token.trim()}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            styles.buttonFlex,
            styles.buttonSecondary,
            !connected && styles.buttonDisabled,
          ]}
          onPress={leave}
          disabled={!connected}
        >
          <Text style={styles.buttonText}>Leave</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.subTitle}>Participants ({participants.length})</Text>
      {participants.length === 0 ? (
        <Text style={styles.muted}>None yet.</Text>
      ) : (
        participants.map((p) => (
          <Text key={p.participantId} style={styles.deviceRow}>
            {p.isLocal ? '★ ' : '• '}
            {p.participantId.slice(0, 8)}… · pub:{p.publishState} · sub:
            {p.subscribeState}
          </Text>
        ))
      )}

      <Text style={styles.subTitle}>Event log</Text>
      {log.length === 0 ? (
        <Text style={styles.muted}>No events yet.</Text>
      ) : (
        log.map((entry) => (
          <Text key={entry.id} style={styles.logRow}>
            {entry.message}
          </Text>
        ))
      )}
    </View>
  );
}

function AppContent() {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>IVS Real-Time — Stage PoC</Text>
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
      {devices.map((d) => (
        <Text key={d.id} style={styles.deviceRow}>
          {d.type} · {d.position} · {d.name}
        </Text>
      ))}

      <StagePanel />
    </ScrollView>
  );
}

export default function App() {
  return (
    <IvsStageProvider>
      <AppContent />
    </IvsStageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  content: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 32,
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
  buttonFlex: { flex: 1, marginTop: 0 },
  buttonSecondary: { backgroundColor: '#3a3f4b' },
  buttonDisabled: { backgroundColor: '#333' },
  buttonText: { color: '#fff', fontWeight: '600' },
  sectionTitle: {
    color: '#fff',
    marginTop: 20,
    marginBottom: 6,
    fontWeight: '600',
  },
  deviceRow: { color: '#c8ccd0', paddingVertical: 4, fontFamily: 'monospace' },
  stagePanel: {
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#26272e',
    paddingTop: 12,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  badgeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  badgeText: { color: '#c8ccd0', fontFamily: 'monospace' },
  input: {
    marginTop: 10,
    backgroundColor: '#16171d',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontFamily: 'monospace',
  },
  stageButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  subTitle: {
    color: '#fff',
    marginTop: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  muted: { color: '#6b7280', fontStyle: 'italic' },
  errorText: { color: '#f97066', marginTop: 8 },
  logRow: {
    color: '#9aa0a6',
    fontFamily: 'monospace',
    fontSize: 12,
    paddingVertical: 1,
  },
});
