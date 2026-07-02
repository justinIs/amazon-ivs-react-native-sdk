import { useState, type ComponentType } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { IvsStageProvider } from 'amazon-ivs-react-native-sdk';
import { Tabs, type TabItem } from './components/Tabs';
import { CameraScreen } from './screens/CameraScreen';
import { StageScreen } from './screens/StageScreen';
import { colors, fontSize, spacing } from './theme';

/**
 * App shell: a header, a scrollable screen area, and a bottom tab bar.
 *
 * Screens are declared as data — adding a feature area (e.g. a future
 * "Video chat" screen) is one entry here plus a component under `screens/`.
 * The Stage provider wraps the whole shell so a Stage connection persists
 * while you switch tabs.
 */
interface Screen extends TabItem {
  title: string;
  component: ComponentType;
}

const SCREENS: Screen[] = [
  {
    key: 'camera',
    label: 'Camera',
    icon: '📷',
    title: 'Camera test',
    component: CameraScreen,
  },
  {
    key: 'stage',
    label: 'Stage',
    icon: '🎭',
    title: 'Stage',
    component: StageScreen,
  },
];

export default function App() {
  const [activeKey, setActiveKey] = useState<string>(SCREENS[0]?.key ?? '');
  const active = SCREENS.find((s) => s.key === activeKey) ?? SCREENS[0];
  // SCREENS is non-empty, so this is unreachable; it narrows `active` for TS.
  if (!active) return null;
  const ActiveScreen = active.component;

  return (
    <IvsStageProvider>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.brand}>IVS Real-Time</Text>
          <Text style={styles.title}>{active.title}</Text>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          <ActiveScreen />
        </ScrollView>

        <Tabs tabs={SCREENS} activeKey={activeKey} onChange={setActiveKey} />
      </View>
    </IvsStageProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: (StatusBar.currentHeight ?? 0) + spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  brand: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
