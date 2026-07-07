import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Stretch to fill a flex row. */
  fill?: boolean;
  style?: ViewStyle;
}

const VARIANT_COLOR: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.surfaceAlt,
  danger: colors.danger,
};

/** A themed pressable. Variants keep call sites declarative and consistent. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fill = false,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: VARIANT_COLOR[variant] },
        fill && styles.fill,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: { flex: 1 },
  pressed: { opacity: 0.7 },
  disabled: { backgroundColor: '#2a2b33', opacity: 0.6 },
  label: {
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
