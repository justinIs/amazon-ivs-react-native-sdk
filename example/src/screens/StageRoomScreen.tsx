import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useIvsStage,
  type StageConnectionState,
} from 'amazon-ivs-react-native-sdk';
import { useNavigate } from '../navigation';
import { ParticipantGrid } from '../stage/ParticipantGrid';
import { colors, fontSize, mono, radius, spacing } from '../theme';

const CONNECTION_COLOR: Record<StageConnectionState, string> = {
  disconnected: colors.textFaint,
  connecting: colors.warning,
  connected: colors.success,
};

/** A round call-control toggle (mic/camera). Red when muted. */
function ControlButton({
  icon,
  muted,
  disabled,
  onPress,
}: {
  icon: string;
  muted: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.control,
        muted && styles.controlMuted,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.controlIcon}>{icon}</Text>
    </Pressable>
  );
}

/**
 * The call: a full-bleed grid of participants with floating overlays — a
 * connection-status pill up top and call controls (mic, camera, leave) at the
 * bottom. The stage id lives in the app header as "Call · <id>".
 */
export function StageRoomScreen() {
  const {
    connectionState,
    participants,
    error,
    leave,
    videoMuted,
    audioMuted,
    toggleVideo,
    toggleAudio,
  } = useIvsStage();
  const navigate = useNavigate();

  const onLeave = useCallback(() => {
    leave();
    navigate('stage');
  }, [leave, navigate]);

  const connecting = connectionState === 'connecting';
  const connected = connectionState === 'connected';
  const empty = participants.length === 0;

  return (
    <View style={styles.screen}>
      {empty ? (
        <View style={styles.emptyState}>
          {connecting ? (
            <>
              <ActivityIndicator color={colors.warning} />
              <Text style={styles.emptyText}>Connecting…</Text>
            </>
          ) : (
            <Text style={styles.emptyText}>
              {connectionState === 'connected'
                ? 'Waiting for participants…'
                : 'Not connected.'}
            </Text>
          )}
        </View>
      ) : (
        <ParticipantGrid participants={participants} />
      )}

      {/* Floating connection status. */}
      <View style={styles.statusFloat} pointerEvents="none">
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: CONNECTION_COLOR[connectionState] },
            ]}
          />
          <Text style={styles.statusText}>{connectionState}</Text>
        </View>
      </View>

      {/* Floating error toast. */}
      {error ? (
        <View style={styles.errorFloat} pointerEvents="none">
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
        </View>
      ) : null}

      {/* Floating controls: mic, camera, leave. */}
      <View style={styles.controls}>
        <ControlButton
          icon={audioMuted ? '🔇' : '🎤'}
          muted={audioMuted}
          disabled={!connected}
          onPress={toggleAudio}
        />
        <ControlButton
          icon={videoMuted ? '🚫' : '🎥'}
          muted={videoMuted}
          disabled={!connected}
          onPress={toggleVideo}
        />
        <Pressable
          onPress={onLeave}
          disabled={connectionState === 'disconnected'}
          style={({ pressed }) => [
            styles.leaveButton,
            pressed && styles.pressed,
            connectionState === 'disconnected' && styles.disabled,
          ]}
        >
          <Text style={styles.leaveIcon}>📞</Text>
          <Text style={styles.leaveLabel}>Leave</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm },
  statusFloat: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  statusText: {
    color: '#fff',
    fontFamily: mono,
    fontSize: fontSize.xs,
  },
  errorFloat: {
    position: 'absolute',
    top: spacing.xl + spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: { color: '#fff', fontSize: fontSize.xs },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  control: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,31,39,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  controlMuted: { backgroundColor: colors.danger, borderColor: colors.danger },
  controlIcon: { fontSize: fontSize.lg },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    // Lift the control bar off the grid.
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: '#2a2b33', opacity: 0.6 },
  leaveIcon: { fontSize: fontSize.md },
  leaveLabel: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
});
