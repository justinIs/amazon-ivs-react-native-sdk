import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, mono, radius, spacing } from '../theme';

interface BadgeProps {
  label: string;
  /** Dot/accent color — pass a theme color (e.g. colors.success). */
  color: string;
}

/** A small status pill: a colored dot plus a monospace label. */
export function Badge({ label, color }: BadgeProps) {
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  label: { color: colors.textMuted, fontFamily: mono, fontSize: fontSize.xs },
});
