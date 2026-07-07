import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ParticipantVideo,
  type StageParticipant,
} from 'amazon-ivs-react-native-sdk';
import { colors, fontSize, mono, radius, spacing } from '../theme';
import { displayName, initials, showsVideo } from './participantDisplay';

/** A labelled pill for media state (green = on, amber = muted, grey = off). */
function MediaPill({
  label,
  on,
  muted,
}: {
  label: string;
  on: boolean;
  muted: boolean;
}) {
  const color = !on
    ? colors.textFaint
    : muted
      ? colors.warning
      : colors.success;
  const state = !on ? 'off' : muted ? 'muted' : 'on';
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.pillText}>
        {label} {state}
      </Text>
    </View>
  );
}

interface ParticipantDetailsProps {
  participant: StageParticipant;
  onClose: () => void;
}

/**
 * The full metadata for one participant, shown in a bottom sheet: a larger video
 * (or placeholder), media state, capabilities, and all custom token attributes.
 * This is where the SDK's participant metadata is surfaced in depth; the grid
 * tile stays clean.
 */
export function ParticipantDetails({
  participant: p,
  onClose,
}: ParticipantDetailsProps) {
  const attributeEntries = Object.entries(p.attributes);

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {p.isLocal ? '★ ' : ''}
          {displayName(p)}
        </Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        {showsVideo(p) ? (
          <ParticipantVideo
            participantId={p.participantId}
            streamVersion={p.streamVersion}
            mirror={p.isLocal}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(p)}</Text>
            </View>
            <Text style={styles.placeholderNote}>
              {p.videoMuted
                ? 'camera muted'
                : p.isLocal
                  ? 'camera off'
                  : 'no video'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.pills}>
        <MediaPill label="cam" on={p.hasVideo} muted={p.videoMuted} />
        <MediaPill label="mic" on={p.hasAudio} muted={p.audioMuted} />
      </View>

      <View style={styles.block}>
        <Text style={styles.line}>
          <Text style={styles.key}>id </Text>
          {p.participantId}
        </Text>
        <Text style={styles.line}>
          <Text style={styles.key}>publish </Text>
          {p.publishState}
          <Text style={styles.key}> · subscribe </Text>
          {p.subscribeState}
        </Text>
        <Text style={styles.line}>
          <Text style={styles.key}>can </Text>
          {[p.canPublish && 'publish', p.canSubscribe && 'subscribe']
            .filter(Boolean)
            .join(', ') || 'nothing'}
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockLabel}>attributes</Text>
        {attributeEntries.length === 0 ? (
          <Text style={styles.empty}>none</Text>
        ) : (
          attributeEntries.map(([key, value]) => (
            <Text key={key} style={styles.line}>
              <Text style={styles.key}>{key} </Text>
              {value}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginRight: spacing.md,
  },
  close: { color: colors.textMuted, fontSize: fontSize.lg },
  hero: {
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  placeholderNote: { color: colors.textFaint, fontSize: fontSize.xs },
  pills: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  pillText: {
    color: colors.textMuted,
    fontFamily: mono,
    fontSize: fontSize.xs,
  },
  block: { gap: 2 },
  blockLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  line: { color: '#c8ccd0', fontFamily: mono, fontSize: fontSize.xs },
  key: { color: colors.textFaint },
  empty: {
    color: colors.textFaint,
    fontStyle: 'italic',
    fontSize: fontSize.xs,
  },
});
