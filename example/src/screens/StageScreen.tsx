import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  useIvsStage,
  type StageConnectionState,
} from 'amazon-ivs-react-native-sdk';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors, fontSize, mono, radius, spacing } from '../theme';

const CONNECTION_COLOR: Record<StageConnectionState, string> = {
  disconnected: colors.textFaint,
  connecting: colors.warning,
  connected: colors.success,
};

/** How many log lines to render (the provider keeps more in memory). */
const LOG_VISIBLE = 50;

/** Stage details: connect with a token and observe participants + events. */
export function StageScreen() {
  const { connectionState, participants, log, error, join, leave } =
    useIvsStage();
  const [token, setToken] = useState('');
  const connected = connectionState !== 'disconnected';

  const onConnect = useCallback(() => {
    // Errors surface through the provider's `error`/log; swallow the reject.
    join(token.trim()).catch(() => {});
  }, [join, token]);

  return (
    <View style={styles.screen}>
      <Card
        title="Connection"
        right={
          <Badge
            label={connectionState}
            color={CONNECTION_COLOR[connectionState]}
          />
        }
      >
        <TextInput
          style={styles.input}
          placeholder="Paste a participant token"
          placeholderTextColor={colors.textFaint}
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!connected}
        />
        <View style={styles.buttonRow}>
          <Button
            label="Connect"
            onPress={onConnect}
            disabled={connected || !token.trim()}
            fill
          />
          <Button
            label="Leave"
            onPress={leave}
            variant="secondary"
            disabled={!connected}
            fill
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: mono,
    fontSize: fontSize.sm,
  },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  error: { color: colors.danger, marginTop: spacing.md },
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
