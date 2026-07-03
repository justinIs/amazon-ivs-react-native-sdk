import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useIvsStage } from 'amazon-ivs-react-native-sdk';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useNow } from '../hooks/useNow';
import { useNavigate } from '../navigation';
import { useTokenStore, type StageToken } from '../stage/TokenStore';
import { expiryStatus, formatExpiry, type ExpiryStatus } from '../stage/token';
import { colors, fontSize, mono, radius, spacing } from '../theme';

const STATUS_COLOR: Record<ExpiryStatus, string> = {
  valid: colors.success,
  expired: colors.danger,
  unknown: colors.textFaint,
};

/** Saved stages: paste a token, then join any non-expired stage. */
export function StageListScreen() {
  const {
    stages,
    processing,
    error,
    addToken,
    removeStage,
    select,
    selectedId,
  } = useTokenStore();
  const { connectionState, join } = useIvsStage();
  const navigate = useNavigate();
  const now = useNow();
  const [input, setInput] = useState('');

  const onAdd = useCallback(async () => {
    try {
      await addToken(input);
      setInput('');
    } catch {
      // error is surfaced via the store's `error`.
    }
  }, [addToken, input]);

  const onJoin = useCallback(
    (stage: StageToken) => {
      select(stage.id);
      navigate('stage-room');
      join(stage.raw).catch(() => {});
    },
    [join, navigate, select]
  );

  return (
    <View style={styles.screen}>
      <Card title="Add a participant token">
        <TextInput
          style={styles.input}
          placeholder="Paste a token (JWT)"
          placeholderTextColor={colors.textFaint}
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          editable={!processing}
        />
        <View style={styles.addRow}>
          <Button
            label="Add"
            onPress={onAdd}
            disabled={processing || !input.trim()}
            fill
          />
          {processing && (
            <ActivityIndicator color={colors.primary} style={styles.spinner} />
          )}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <Text style={styles.sectionLabel}>Stages ({stages.length})</Text>
      {stages.length === 0 ? (
        <Text style={styles.muted}>
          No stages yet. Paste a participant token above — mint one with{' '}
          <Text style={styles.code}>./scripts/ivs token</Text>.
        </Text>
      ) : (
        stages.map((stage) => {
          const status = expiryStatus(stage.expiresAt, now);
          // A single connection at a time: the selected stage while connected.
          const isActiveCall =
            stage.id === selectedId && connectionState !== 'disconnected';
          return (
            <Card key={stage.id} style={styles.stageCard}>
              <View style={styles.stageHeader}>
                <Text style={styles.stageId} numberOfLines={1}>
                  {stage.stageId ?? stage.stageArn}
                </Text>
                <Pressable onPress={() => removeStage(stage.id)} hitSlop={10}>
                  <Text style={styles.remove}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.meta} numberOfLines={1}>
                {stage.username ?? stage.userId ?? 'no user'}
                {stage.capabilities.length > 0
                  ? ` · ${stage.capabilities.join(', ')}`
                  : ''}
              </Text>

              <View style={styles.expiryRow}>
                <Badge label={status} color={STATUS_COLOR[status]} />
                <Text style={styles.expiryText}>
                  {formatExpiry(stage.expiresAt, now)}
                </Text>
              </View>

              <Button
                label={isActiveCall ? 'Open call' : 'Join'}
                onPress={() =>
                  isActiveCall ? navigate('stage-room') : onJoin(stage)
                }
                disabled={status === 'expired' && !isActiveCall}
                style={styles.join}
              />
            </Card>
          );
        })
      )}
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
    fontSize: fontSize.xs,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  spinner: { position: 'absolute', right: spacing.md },
  error: { color: colors.danger, marginTop: spacing.md },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  muted: { color: colors.textFaint, fontStyle: 'italic', lineHeight: 20 },
  code: { fontFamily: mono, color: colors.textMuted },
  stageCard: { gap: spacing.sm },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageId: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    fontFamily: mono,
    flex: 1,
    marginRight: spacing.md,
  },
  remove: { color: colors.textFaint, fontSize: fontSize.md },
  meta: { color: colors.textMuted, fontSize: fontSize.sm },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  expiryText: { color: colors.textMuted, fontSize: fontSize.sm },
  join: { marginTop: spacing.sm },
});
