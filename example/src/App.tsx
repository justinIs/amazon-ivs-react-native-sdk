import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  IVSLocalPreviewView,
  IVSParticipantVideoView,
  IVSStageProvider,
  getCameraPermission,
  getMicrophonePermission,
  getSdkVersion,
  requestCameraPermission,
  requestMicrophonePermission,
  useAudioRoute,
  useLocalMedia,
  useParticipants,
  useStage,
  useStageContext,
  type AudioOutput,
  type IVSParticipantInfo,
  type PermissionStatus,
  type SubscribeType,
} from 'amazon-ivs-react-native-sdk';
import { AUTO_JOIN_ON_LAUNCH, STAGE_PARTICIPANT_TOKEN } from './stage.config';

const DEFAULT_TOKEN = STAGE_PARTICIPANT_TOKEN;
const SUBSCRIBE_CYCLE: SubscribeType[] = ['audio-video', 'audio-only', 'none'];

const SUBSCRIBE_LABEL: Record<SubscribeType, string> = {
  'audio-video': 'Watching',
  'audio-only': 'Audio only',
  'none': 'Hidden',
};

const PERMISSION_LABEL: Record<PermissionStatus, string> = {
  granted: 'Granted',
  denied: 'Denied',
  restricted: 'Restricted',
  undetermined: 'Not asked',
};

const AUDIO_OUTPUT_LABEL: Record<AudioOutput, string> = {
  auto: 'Auto',
  speaker: 'Speaker',
  earpiece: 'Earpiece',
  bluetooth: 'Bluetooth',
  wired: 'Wired',
};

function ControlButton({
  label,
  hint,
  onPress,
  active,
  danger,
  disabled,
  primary,
  flex,
}: {
  label: string;
  hint?: string;
  onPress: () => void | Promise<void>;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  primary?: boolean;
  flex?: number;
}) {
  const [busy, setBusy] = useState(false);

  const handlePress = useCallback(async () => {
    if (busy || disabled) {
      return;
    }
    setBusy(true);
    try {
      await onPress();
    } catch (e) {
      console.error(`${label} failed`, e);
    } finally {
      setBusy(false);
    }
  }, [busy, disabled, label, onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      disabled={disabled || busy}
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.controlBtn,
        flex != null ? { flex } : null,
        primary && styles.controlBtnPrimary,
        active && styles.controlBtnActive,
        danger && styles.controlBtnDanger,
        (disabled || busy) && styles.controlBtnDisabled,
        pressed && !disabled && !busy && styles.controlBtnPressed,
      ]}
    >
      <Text
        style={[
          styles.controlBtnLabel,
          primary && styles.controlBtnLabelOnPrimary,
          danger && styles.controlBtnLabelOnDanger,
        ]}
      >
        {busy ? '…' : label}
      </Text>
      {hint ? (
        <Text
          style={[
            styles.controlBtnHint,
            primary && styles.controlBtnHintOnPrimary,
            danger && styles.controlBtnHintOnDanger,
          ]}
          numberOfLines={1}
        >
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'live' | 'connecting' | 'viewer';
}) {
  return (
    <View
      style={[
        styles.pill,
        tone === 'live' && styles.pillLive,
        tone === 'connecting' && styles.pillConnecting,
        tone === 'viewer' && styles.pillViewer,
      ]}
    >
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function PermissionsSection({
  onPermissionsChange,
}: {
  onPermissionsChange?: () => void;
}) {
  const [camera, setCamera] = useState<PermissionStatus>('undetermined');
  const [microphone, setMicrophone] =
    useState<PermissionStatus>('undetermined');
  const [busy, setBusy] = useState<'camera' | 'microphone' | null>(null);

  const refresh = useCallback(async () => {
    const [cam, mic] = await Promise.all([
      getCameraPermission(),
      getMicrophonePermission(),
    ]);
    setCamera(cam);
    setMicrophone(mic);
    onPermissionsChange?.();
  }, [onPermissionsChange]);

  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh().catch(console.error);
      }
    });
    return () => sub.remove();
  }, [refresh]);

  const request = useCallback(
    async (kind: 'camera' | 'microphone') => {
      setBusy(kind);
      try {
        if (kind === 'camera') {
          setCamera(await requestCameraPermission());
        } else {
          setMicrophone(await requestMicrophonePermission());
        }
        onPermissionsChange?.();
      } finally {
        setBusy(null);
      }
    },
    [onPermissionsChange]
  );

  const rows: {
    kind: 'camera' | 'microphone';
    label: string;
    status: PermissionStatus;
  }[] = [
    { kind: 'camera', label: 'Camera', status: camera },
    { kind: 'microphone', label: 'Microphone', status: microphone },
  ];

  return (
    <View style={styles.permissionsCard}>
      <Text style={styles.permissionsTitle}>Permissions</Text>
      <Text style={styles.permissionsBody}>
        Watch-only join does not need camera or mic. Go live and preview require
        both.
      </Text>
      {rows.map((row) => (
        <View key={row.kind} style={styles.permissionRow}>
          <View style={styles.permissionMeta}>
            <Text style={styles.permissionLabel}>{row.label}</Text>
            <Text style={styles.permissionStatus}>
              {PERMISSION_LABEL[row.status]}
            </Text>
          </View>
          {row.status === 'undetermined' ? (
            <Pressable
              style={styles.permissionAction}
              disabled={busy != null}
              onPress={() => request(row.kind)}
            >
              {busy === row.kind ? (
                <ActivityIndicator color="#fafafa" size="small" />
              ) : (
                <Text style={styles.permissionActionText}>Allow</Text>
              )}
            </Pressable>
          ) : row.status === 'denied' || row.status === 'restricted' ? (
            <Pressable
              style={styles.permissionAction}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.permissionActionText}>Open Settings</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function Lobby({
  token,
  onChangeToken,
  onJoinViewer,
  onJoinPublisher,
  joining,
  error,
}: {
  token: string;
  onChangeToken: (value: string) => void;
  onJoinViewer: () => void;
  onJoinPublisher: () => void;
  joining: boolean;
  error: string | null;
}) {
  const [sdkVersion, setSdkVersion] = useState('…');
  const [showPreview, setShowPreview] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const canJoin = token.trim().length > 0 && !joining;

  useEffect(() => {
    getSdkVersion().then(setSdkVersion).catch(console.error);
  }, []);

  const setupPreview = useCallback(async () => {
    setPreviewBusy(true);
    try {
      const cam = await requestCameraPermission();
      await requestMicrophonePermission();
      setShowPreview(cam === 'granted');
    } finally {
      setPreviewBusy(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.lobbyScroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>IVS Real-Time</Text>
        <Text style={styles.headline}>Join a stage</Text>
        <Text style={styles.lede}>
          Watch without sharing your camera, or go live so others can see you.
        </Text>

        <PermissionsSection />

        <Text style={styles.fieldLabel}>Participant token</Text>
        <TextInput
          style={styles.tokenInput}
          placeholder="Paste token from AWS console or your backend"
          placeholderTextColor="#6b7280"
          value={token}
          onChangeText={onChangeToken}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          editable={!joining}
        />
        <Text style={styles.fieldHelp}>
          One token = one seat on the stage. SDK {sdkVersion}
        </Text>

        <View style={styles.previewShell}>
          {showPreview ? (
            <IVSLocalPreviewView style={styles.previewFill} />
          ) : (
            <View style={styles.previewEmpty}>
              <Text style={styles.previewEmptyTitle}>Camera preview</Text>
              <Text style={styles.previewEmptyBody}>
                Optional. Watching does not need camera access.
              </Text>
              <Pressable
                style={styles.secondaryChip}
                onPress={setupPreview}
                disabled={previewBusy}
              >
                {previewBusy ? (
                  <ActivityIndicator color="#f3f4f6" />
                ) : (
                  <Text style={styles.secondaryChipText}>Turn on preview</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        <ControlButton
          primary
          label="Watch only"
          hint="Join without camera or mic"
          onPress={onJoinViewer}
          disabled={!canJoin}
        />
        <ControlButton
          label="Join and go live"
          hint="Share camera and microphone"
          onPress={onJoinPublisher}
          disabled={!canJoin}
        />

        {joining ? (
          <View style={styles.joiningRow}>
            <ActivityIndicator color="#f59e0b" />
            <Text style={styles.joiningText}>Connecting…</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function RemoteParticipantTile({
  participant,
  subscribeType,
  onCycleSubscribe,
}: {
  participant: IVSParticipantInfo;
  subscribeType: SubscribeType;
  onCycleSubscribe: (participantId: string) => void;
}) {
  const name = participant.userId || participant.participantId.slice(0, 8);
  const hidden = subscribeType === 'none';
  const isScreenShare = participant.attributes['screen-share'] === 'true';

  return (
    <View style={styles.remoteTile}>
      {hidden ? (
        <View style={styles.remoteHidden}>
          <Text style={styles.remoteHiddenText}>Hidden</Text>
        </View>
      ) : (
        <IVSParticipantVideoView
          participantId={participant.participantId}
          style={styles.remoteVideo}
        />
      )}
      <View style={styles.remoteFooter}>
        <View style={styles.remoteMeta}>
          <Text style={styles.remoteLabel} numberOfLines={1}>
            {isScreenShare ? `${name} · screen` : name}
          </Text>
          <Text style={styles.remoteSub}>
            {SUBSCRIBE_LABEL[subscribeType]}
            {participant.publishState === 'published' ? '' : ' · not live'}
          </Text>
        </View>
        <Pressable
          style={styles.remoteAction}
          onPress={() => onCycleSubscribe(participant.participantId)}
        >
          <Text style={styles.remoteActionText}>Media</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AudioOutputPicker() {
  const { audioRoute, setAudioOutput } = useAudioRoute();
  const options: AudioOutput[] = [
    'auto',
    ...audioRoute.availableOutputs.filter((o) => o !== 'auto'),
  ];

  return (
    <View style={styles.audioSection}>
      <Text style={styles.audioTitle}>Audio output</Text>
      <Text style={styles.audioSub}>
        Requested {AUDIO_OUTPUT_LABEL[audioRoute.output]} · active{' '}
        {AUDIO_OUTPUT_LABEL[audioRoute.activeOutput]}
      </Text>
      <View style={styles.audioRow}>
        {options.map((output) => (
          <Pressable
            key={output}
            style={[
              styles.audioChip,
              audioRoute.output === output && styles.audioChipActive,
            ]}
            onPress={() => setAudioOutput(output)}
          >
            <Text
              style={[
                styles.audioChipText,
                audioRoute.output === output && styles.audioChipTextActive,
              ]}
            >
              {AUDIO_OUTPUT_LABEL[output]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StageRoom({ onLeave }: { onLeave: () => void }) {
  const { connectionState, error, clearError, renewToken } = useStage();
  const participants = useParticipants();
  const {
    publishEnabled,
    publishState,
    microphoneEnabled,
    cameraEnabled,
    cameraPosition,
    setPublishEnabled,
    setMicrophoneEnabled,
    setCameraEnabled,
    flipCamera,
  } = useLocalMedia();
  const { setSubscribeType } = useStageContext();
  const subscribeIndex = useRef<Record<string, number>>({});
  const [subscribeById, setSubscribeById] = useState<
    Record<string, SubscribeType>
  >({});
  const [renewTokenInput, setRenewTokenInput] = useState('');
  const [showRenew, setShowRenew] = useState(false);

  const remote = participants.filter((p) => !p.isLocal);
  const connecting = connectionState === 'connecting';
  const live = publishEnabled && publishState === 'published';

  const cycleSubscribe = useCallback(
    async (participantId: string) => {
      const prev = subscribeIndex.current[participantId] ?? 0;
      const nextIndex = (prev + 1) % SUBSCRIBE_CYCLE.length;
      const next = SUBSCRIBE_CYCLE[nextIndex]!;
      subscribeIndex.current[participantId] = nextIndex;
      setSubscribeById((current) => ({ ...current, [participantId]: next }));
      await setSubscribeType(participantId, next);
    },
    [setSubscribeType]
  );

  const handleRenewToken = useCallback(async () => {
    const next = renewTokenInput.trim();
    if (!next) {
      return;
    }
    await renewToken(next);
    setRenewTokenInput('');
    setShowRenew(false);
  }, [renewToken, renewTokenInput]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.stageHeader}>
        <View>
          <Text style={styles.brandSmall}>On stage</Text>
          <View style={styles.pillRow}>
            {connecting ? (
              <StatusPill label="Connecting" tone="connecting" />
            ) : live ? (
              <StatusPill label="You are live" tone="live" />
            ) : publishEnabled ? (
              <StatusPill label="Going live…" tone="connecting" />
            ) : (
              <StatusPill label="Watching" tone="viewer" />
            )}
            <StatusPill label={`${remote.length} others`} />
          </View>
        </View>
        <Pressable style={styles.leaveChip} onPress={onLeave}>
          <Text style={styles.leaveChipText}>Leave</Text>
        </Pressable>
      </View>

      {error ? (
        <Pressable onPress={clearError}>
          <Text style={styles.errorText}>
            {error.code}: {error.message} (tap to dismiss)
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.stageBody}>
        {publishEnabled ? (
          <View style={styles.selfPreview}>
            {/* Keep the native preview mounted — unmounting while publishing
                churns the IVS camera session and can crash. */}
            <IVSLocalPreviewView style={styles.previewFill} />
            {!cameraEnabled ? (
              <View style={styles.cameraOffOverlay}>
                <Text style={styles.cameraOffTitle}>Camera off</Text>
                <Text style={styles.cameraOffBody}>
                  Others on the stage cannot see you.
                </Text>
              </View>
            ) : null}
            <View style={styles.selfBadge}>
              <Text style={styles.selfBadgeText}>
                You · {cameraPosition}
                {!cameraEnabled ? ' · cam off' : ''}
                {!microphoneEnabled ? ' · muted' : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.viewerBanner}>
            <Text style={styles.viewerBannerTitle}>You are watching</Text>
            <Text style={styles.viewerBannerBody}>
              Others cannot see or hear you until you go live.
            </Text>
          </View>
        )}

        <AudioOutputPicker />

        <View style={styles.renewSection}>
          <Pressable onPress={() => setShowRenew((v) => !v)}>
            <Text style={styles.renewToggle}>
              {showRenew ? 'Hide renew token' : 'Renew token'}
            </Text>
          </Pressable>
          {showRenew ? (
            <>
              <TextInput
                style={styles.renewInput}
                placeholder="Paste a fresh participant token"
                placeholderTextColor="#6b7280"
                value={renewTokenInput}
                onChangeText={setRenewTokenInput}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />
              <ControlButton
                label="Apply token"
                hint="Rebuilds local participant"
                onPress={handleRenewToken}
                disabled={renewTokenInput.trim().length === 0}
              />
            </>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>
          {remote.length === 0 ? 'Waiting for others' : 'People on stage'}
        </Text>

        <FlatList
          style={styles.remoteListFlex}
          data={remote}
          keyExtractor={(item) => item.participantId}
          numColumns={2}
          columnWrapperStyle={remote.length > 0 ? styles.gridRow : undefined}
          contentContainerStyle={styles.remoteList}
          renderItem={({ item }) => (
            <RemoteParticipantTile
              participant={item}
              subscribeType={subscribeById[item.participantId] ?? 'audio-video'}
              onCycleSubscribe={cycleSubscribe}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyRemote}>
              When someone else joins and goes live, they appear here.
            </Text>
          }
        />
      </View>

      <View style={styles.dock}>
        <Text style={styles.dockHint}>
          {publishEnabled
            ? !microphoneEnabled
              ? 'Mic muted · tap Unmute to speak'
              : 'Tap a control below'
            : 'Tap Go live to share your camera'}
        </Text>
        <View style={styles.dockRow}>
          <ControlButton
            flex={publishEnabled ? 1.2 : 1}
            primary={!publishEnabled}
            danger={publishEnabled}
            label={publishEnabled ? 'Stop live' : 'Go live'}
            hint={publishEnabled ? 'Stop sharing' : 'Share cam + mic'}
            onPress={async () => {
              await setPublishEnabled(!publishEnabled);
            }}
          />
          {publishEnabled ? (
            <>
              <ControlButton
                flex={1}
                label={microphoneEnabled ? 'Mute' : 'Unmute'}
                hint="Mic"
                active={!microphoneEnabled}
                onPress={async () => {
                  await setMicrophoneEnabled(!microphoneEnabled);
                }}
              />
              <ControlButton
                flex={1}
                label={cameraEnabled ? 'Cam off' : 'Cam on'}
                hint="Video"
                active={!cameraEnabled}
                onPress={async () => {
                  await setCameraEnabled(!cameraEnabled);
                }}
              />
              <ControlButton
                flex={1}
                label="Flip"
                hint={cameraPosition}
                onPress={async () => {
                  await flipCamera();
                }}
              />
            </>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function AppContent({ initialToken }: { initialToken: string }) {
  const [token, setToken] = useState(initialToken);
  const [sessionActive, setSessionActive] = useState(
    AUTO_JOIN_ON_LAUNCH && initialToken.trim().length > 0
  );
  const [joining, setJoining] = useState(false);
  const { connectionState, join, leave, error, clearError } = useStage();

  useEffect(() => {
    if (
      sessionActive &&
      connectionState === 'disconnected' &&
      error != null &&
      AUTO_JOIN_ON_LAUNCH
    ) {
      setSessionActive(false);
      setJoining(false);
    }
  }, [sessionActive, connectionState, error]);

  useEffect(() => {
    if (sessionActive && connectionState === 'connected') {
      setJoining(false);
    }
  }, [sessionActive, connectionState]);

  const handleJoinViewer = useCallback(async () => {
    clearError();
    setJoining(true);
    setSessionActive(true);
    try {
      await join(token.trim(), { publish: false });
    } catch (e) {
      console.error('Join as viewer failed', e);
      setSessionActive(false);
      setJoining(false);
    }
  }, [clearError, join, token]);

  const handleJoinPublisher = useCallback(async () => {
    clearError();
    setJoining(true);
    setSessionActive(true);
    try {
      await join(token.trim(), { publish: true });
    } catch (e) {
      console.error('Join and go live failed', e);
      setSessionActive(false);
      setJoining(false);
    }
  }, [clearError, join, token]);

  const handleLeave = useCallback(async () => {
    setJoining(false);
    await leave();
    setSessionActive(false);
  }, [leave]);

  if (!sessionActive) {
    return (
      <Lobby
        token={token}
        onChangeToken={setToken}
        onJoinViewer={handleJoinViewer}
        onJoinPublisher={handleJoinPublisher}
        joining={joining}
        error={error ? `${error.code}: ${error.message}` : null}
      />
    );
  }

  return <StageRoom onLeave={handleLeave} />;
}

export default function App() {
  const token = DEFAULT_TOKEN;
  const autoJoin = AUTO_JOIN_ON_LAUNCH && token.trim().length > 0;

  return (
    <IVSStageProvider
      token={autoJoin ? token : undefined}
      joinOptions={{ publish: false }}
      subscribe="audio-video"
    >
      <AppContent initialToken={token} />
    </IVSStageProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  lobbyScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  brand: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#f59e0b',
  },
  brandSmall: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#a1a1aa',
  },
  headline: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '700',
    color: '#fafafa',
  },
  lede: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 22,
    color: '#a1a1aa',
  },
  permissionsCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
    gap: 10,
  },
  permissionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fafafa',
  },
  permissionsBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#a1a1aa',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  permissionMeta: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e4e4e7',
  },
  permissionStatus: {
    marginTop: 2,
    fontSize: 12,
    color: '#71717a',
  },
  permissionAction: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#27272a',
    minWidth: 110,
    alignItems: 'center',
  },
  permissionActionText: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e4e4e7',
    marginBottom: 8,
  },
  fieldHelp: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 12,
    color: '#71717a',
  },
  tokenInput: {
    minHeight: 88,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    color: '#fafafa',
    fontSize: 13,
    lineHeight: 18,
  },
  previewShell: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  previewFill: {
    flex: 1,
  },
  previewEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  previewEmptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafafa',
  },
  previewEmptyBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 8,
  },
  secondaryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#27272a',
    minWidth: 140,
    alignItems: 'center',
  },
  secondaryChipText: {
    color: '#f4f4f5',
    fontWeight: '600',
    fontSize: 13,
  },
  controlBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 10,
    minWidth: 72,
    minHeight: 64,
    justifyContent: 'center',
  },
  controlBtnPrimary: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  controlBtnActive: {
    backgroundColor: '#3f3f46',
    borderColor: '#52525b',
  },
  controlBtnDanger: {
    backgroundColor: '#7f1d1d',
    borderColor: '#991b1b',
  },
  controlBtnDisabled: {
    opacity: 0.45,
  },
  controlBtnPressed: {
    opacity: 0.85,
  },
  controlBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fafafa',
    textAlign: 'center',
  },
  controlBtnLabelOnPrimary: {
    color: '#18181b',
  },
  controlBtnLabelOnDanger: {
    color: '#fecaca',
  },
  controlBtnHint: {
    marginTop: 2,
    fontSize: 11,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  controlBtnHintOnPrimary: {
    color: '#422006',
  },
  controlBtnHintOnDanger: {
    color: '#fca5a5',
  },
  joiningRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  joiningText: {
    color: '#f59e0b',
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    color: '#f87171',
    fontSize: 13,
    lineHeight: 18,
  },
  stageHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#27272a',
  },
  pillLive: {
    backgroundColor: '#7f1d1d',
  },
  pillConnecting: {
    backgroundColor: '#78350f',
  },
  pillViewer: {
    backgroundColor: '#1e3a5f',
  },
  pillText: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '600',
  },
  leaveChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#27272a',
  },
  leaveChipText: {
    color: '#fafafa',
    fontWeight: '600',
    fontSize: 13,
  },
  stageBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  selfPreview: {
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    marginBottom: 16,
    // Required: with borderRadius + overflow hidden and no border, Android clips
    // this container in a way the TextureView preview cannot draw under, and the
    // whole subtree renders blank.
    borderWidth: 1,
    borderColor: '#27272a',
  },
  selfBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  selfBadgeText: {
    color: '#fafafa',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraOffOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9,9,11,0.92)',
    paddingHorizontal: 20,
  },
  cameraOffTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fafafa',
  },
  cameraOffBody: {
    marginTop: 6,
    fontSize: 13,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  viewerBanner: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 16,
  },
  viewerBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fafafa',
  },
  viewerBannerBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#a1a1aa',
  },
  audioSection: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 12,
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e4e4e7',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  audioSub: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    color: '#71717a',
  },
  audioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audioChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#27272a',
  },
  audioChipActive: {
    backgroundColor: '#f59e0b',
  },
  audioChipText: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '600',
  },
  audioChipTextActive: {
    color: '#18181b',
  },
  renewSection: {
    marginBottom: 12,
  },
  renewToggle: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  renewInput: {
    minHeight: 72,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    color: '#fafafa',
    fontSize: 13,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  remoteListFlex: {
    flex: 1,
  },
  remoteList: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  gridRow: {
    gap: 10,
  },
  remoteTile: {
    flex: 1,
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  remoteVideo: {
    height: 130,
    backgroundColor: '#09090b',
  },
  remoteHidden: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090b',
  },
  remoteHiddenText: {
    color: '#71717a',
    fontSize: 13,
  },
  remoteFooter: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remoteMeta: {
    flex: 1,
  },
  remoteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fafafa',
  },
  remoteSub: {
    marginTop: 2,
    fontSize: 11,
    color: '#a1a1aa',
  },
  remoteAction: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#27272a',
  },
  remoteActionText: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyRemote: {
    color: '#71717a',
    fontSize: 14,
    lineHeight: 20,
  },
  dock: {
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: '#09090b',
    zIndex: 20,
    elevation: 20,
  },
  dockHint: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 8,
    textAlign: 'center',
  },
  dockRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
});
