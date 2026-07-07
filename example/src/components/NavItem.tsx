import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

/** A drawer menu row. Shows an accent bar + tint when it's the active screen. */
export function NavItem({ icon, label, active, onPress }: NavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        active && styles.itemActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.accent, active && styles.accentActive]} />
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
  },
  itemActive: { backgroundColor: colors.surfaceAlt },
  pressed: { opacity: 0.6 },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
    marginRight: spacing.lg - 3,
  },
  accentActive: { backgroundColor: colors.primary },
  icon: { fontSize: fontSize.lg, marginRight: spacing.md },
  label: { color: colors.textMuted, fontSize: fontSize.md },
  labelActive: { color: colors.text, fontWeight: '600' },
});
