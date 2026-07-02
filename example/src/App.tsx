import { useCallback, useState, type ComponentType } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { IvsStageProvider } from 'amazon-ivs-react-native-sdk';
import { Drawer } from './components/Drawer';
import { NavItem } from './components/NavItem';
import { NavigationContext } from './navigation';
import { CameraScreen } from './screens/CameraScreen';
import { HomeScreen } from './screens/HomeScreen';
import { StageScreen } from './screens/StageScreen';
import { colors, fontSize, spacing } from './theme';

interface Screen {
  key: string;
  label: string;
  icon: string;
  title: string;
  component: ComponentType;
}

const HOME: Screen = {
  key: 'home',
  label: 'Home',
  icon: '🏠',
  title: 'Home',
  component: HomeScreen,
};

// Destinations shown in the drawer, in order. Stage first. Add a feature area
// by dropping a component in `screens/` and appending an entry here.
const DESTINATIONS: Screen[] = [
  {
    key: 'stage',
    label: 'Stage',
    icon: '🎭',
    title: 'Stage',
    component: StageScreen,
  },
  {
    key: 'camera',
    label: 'Camera',
    icon: '📷',
    title: 'Camera test',
    component: CameraScreen,
  },
];

const SCREENS: Screen[] = [HOME, ...DESTINATIONS];

export default function App() {
  const [activeKey, setActiveKey] = useState(HOME.key);
  const [menuOpen, setMenuOpen] = useState(false);

  const active = SCREENS.find((s) => s.key === activeKey) ?? HOME;
  const ActiveScreen = active.component;

  const navigate = useCallback((key: string) => {
    setActiveKey(key);
    setMenuOpen(false);
  }, []);

  return (
    <IvsStageProvider>
      <NavigationContext.Provider value={navigate}>
        <View style={styles.root}>
          <View style={styles.header}>
            <Pressable
              onPress={() => setMenuOpen(true)}
              hitSlop={12}
              style={styles.menuButton}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </Pressable>
            <Text style={styles.title}>{active.title}</Text>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
          >
            <ActiveScreen />
          </ScrollView>
        </View>

        <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
          <Pressable onPress={() => navigate(HOME.key)} style={styles.brand}>
            <Text style={styles.brandTitle}>IVS Real-Time</Text>
            <Text style={styles.brandSubtitle}>Stages PoC</Text>
          </Pressable>
          <View style={styles.divider} />
          {DESTINATIONS.map((s) => (
            <NavItem
              key={s.key}
              icon={s.icon}
              label={s.label}
              active={s.key === activeKey}
              onPress={() => navigate(s.key)}
            />
          ))}
        </Drawer>
      </NavigationContext.Provider>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  menuButton: { marginRight: spacing.md },
  menuIcon: { color: colors.text, fontSize: fontSize.xl },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  brand: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  brandTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  brandSubtitle: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
});
