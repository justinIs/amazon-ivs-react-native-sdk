import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

/** One entry in the bottom tab bar. */
export interface TabItem {
  key: string;
  label: string;
  /** Emoji used as the tab icon (keeps the app icon-font-free). */
  icon: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

/** A fixed bottom tab bar. Purely presentational and data-driven. */
export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.icon, active && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
  icon: { fontSize: fontSize.lg, opacity: 0.5 },
  iconActive: { opacity: 1 },
  label: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: '600' },
});
