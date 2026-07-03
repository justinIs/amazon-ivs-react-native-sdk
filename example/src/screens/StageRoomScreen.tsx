import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  useIvsStage,
  type StageConnectionState,
} from 'amazon-ivs-react-native-sdk';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useNavigate } from '../navigation';
import { useTokenStore } from '../stage/TokenStore';
import { colors, fontSize, mono, spacing } from '../theme';

const CONNECTION_COLOR: Record<StageConnectionState, string> = {
  disconnected: colors.textFaint,
  connecting: colors.warning,
  connected: colors.success,
};

const LOG_VISIBLE = 50;

/** The call: the joined stage's participants and event log, with Leave. */
export function StageRoomScreen() {
  const { connectionState, participants, log, error, leave } = useIvsStage();
  const { selected } = useTokenStore();
  const navigate = useNavigate();

  const onLeave = useCallback(() => {
    leave();
    navigate('stage');
  }, [leave, navigate]);

  return (
    <View style={styles.screen}>
      <Card
        title={selected?.stageId ?? 'Stage'}
        right={
          <Badge
            label={connectionState}
            color={CONNECTION_COLOR[connectionState]}
          />
        }
      >
        {connectionState === 'connecting' && (
          <View style={styles.connecting}>
            <ActivityIndicator color={colors.warning} />
            <Text style={styles.connectingText}>Connecting…</Text>
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Leave"
          onPress={onLeave}
          variant="secondary"
          disabled={connectionState === 'disconnected'}
          style={styles.leave}
        />
      </Card>

      <Card title={`Participants (${participants.length})`}>
        {participants.length === 0 ? (
          <Text style={styles.muted}>None yet.</Text>
        ) : (
          participants.map((p) => (
            <Text key={p.participantId} style={styles.row}>
              {p.isLocal ? '★ ' : '• '}
              {p.participantId.slice(0, 8)}… · pub:{p.publishState} · sub:
              {p.subscribeState}
            </Text>
          ))
        )}
      </Card>

      <Card title="Event log">
        {log.length === 0 ? (
          <Text style={styles.muted}>No events yet.</Text>
        ) : (
          log.slice(0, LOG_VISIBLE).map((entry) => (
            <Text key={entry.id} style={styles.logRow}>
              {entry.message}
            </Text>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  connecting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  connectingText: { color: colors.textMuted, fontSize: fontSize.sm },
  error: { color: colors.danger, marginBottom: spacing.md },
  leave: { marginTop: spacing.xs },
  muted: { color: colors.textFaint, fontStyle: 'italic' },
  row: {
    color: '#c8ccd0',
    paddingVertical: spacing.xs,
    fontFamily: mono,
    fontSize: fontSize.sm,
  },
  logRow: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: fontSize.xs,
    paddingVertical: 1,
  },
});
