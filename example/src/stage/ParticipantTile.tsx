import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ParticipantVideo,
  type StageParticipant,
} from 'amazon-ivs-react-native-sdk';
import { colors, fontSize, radius, spacing } from '../theme';
import { displayName, initials, showsVideo } from './participantDisplay';

interface ParticipantTileProps {
  participant: StageParticipant;
  width: number;
  height: number;
  onPress: () => void;
}

/**
 * One cell in the call grid: a participant's live video (when available) or an
 * avatar placeholder, with their name and a muted-mic indicator overlaid. Tap
 * for full details. Sized by the grid, so it stays a dumb presentational cell.
 */
export function ParticipantTile({
  participant: p,
  width,
  height,
  onPress,
}: ParticipantTileProps) {
  const video = showsVideo(p);
  const micOff = !p.hasAudio || p.audioMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width, height },
        pressed && styles.pressed,
      ]}
    >
      {video ? (
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
        </View>
      )}

      <View style={styles.footer}>
        {micOff && <Text style={styles.mic}>🔇</Text>}
        <Text style={styles.name} numberOfLines={1}>
          {p.isLocal ? '★ ' : ''}
          {displayName(p)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#000',
    borderRadius: radius.md,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mic: { fontSize: fontSize.xs },
  name: {
    flex: 1,
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
