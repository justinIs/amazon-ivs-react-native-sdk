import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface CardProps {
  /** Optional card title, shown in the header row. */
  title?: string;
  /** Optional element pinned to the right of the header (e.g. a Badge). */
  right?: ReactNode;
  children?: ReactNode;
  style?: ViewStyle;
}

/** A surface container with an optional titled header. The app's base panel. */
export function Card({ title, right, children, style }: CardProps) {
  const hasHeader = title != null || right != null;
  return (
    <View style={[styles.card, style]}>
      {hasHeader && (
        <View style={styles.header}>
          {title != null ? <Text style={styles.title}>{title}</Text> : <View />}
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
