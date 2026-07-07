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
import { MenuContext, NavigationContext } from './navigation';
import { CameraScreen } from './screens/CameraScreen';
import { HomeScreen } from './screens/HomeScreen';
import { StageListScreen } from './screens/StageListScreen';
import { StageRoomScreen } from './screens/StageRoomScreen';
import { TokenStoreProvider, useTokenStore } from './stage/TokenStore';
import { colors, fontSize, spacing } from './theme';

interface Screen {
  key: string;
  label: string;
  icon: string;
  title: string;
  component: ComponentType;
  /**
   * Render the screen directly (flex-filled) instead of inside the padded,
   * scrolling body — for full-bleed layouts like the call's video grid.
   */
  fullBleed?: boolean;
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
    title: 'Stages',
    component: StageListScreen,
  },
  {
    key: 'camera',
    label: 'Camera',
    icon: '📷',
    title: 'Camera test',
    component: CameraScreen,
  },
];

// The call room is reachable by joining a stage, not from the drawer.
const STAGE_ROOM: Screen = {
  key: 'stage-room',
  label: 'Call',
  icon: '🎭',
  title: 'Call',
  component: StageRoomScreen,
  fullBleed: true,
};

const SCREENS: Screen[] = [HOME, ...DESTINATIONS, STAGE_ROOM];

export default function App() {
  // Providers wrap the shell so the shell can read Stage/token state (e.g. to
  // title the call screen with the connected stage).
  return (
    <IvsStageProvider>
      <TokenStoreProvider>
        <AppShell />
      </TokenStoreProvider>
    </IvsStageProvider>
  );
}

function AppShell() {
  const [activeKey, setActiveKey] = useState(HOME.key);
  const [menuOpen, setMenuOpen] = useState(false);
  const { selected } = useTokenStore();

  const active = SCREENS.find((s) => s.key === activeKey) ?? HOME;
  const ActiveScreen = active.component;

  const navigate = useCallback((key: string) => {
    setActiveKey(key);
    setMenuOpen(false);
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);

  // The call screen is titled with the stage it's connected to; everything else
  // uses its static title.
  const title =
    active.key === STAGE_ROOM.key
      ? `Call · ${selected?.stageId ?? 'Stage'}`
      : active.title;

  return (
    <NavigationContext.Provider value={navigate}>
      <MenuContext.Provider value={openMenu}>
        <View style={styles.root}>
          <View style={styles.header}>
            <Pressable
              onPress={openMenu}
              hitSlop={12}
              style={styles.menuButton}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </Pressable>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {active.fullBleed ? (
            <View style={styles.body}>
              <ActiveScreen />
            </View>
          ) : (
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
            >
              <ActiveScreen />
            </ScrollView>
          )}
        </View>

        <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
          <Pressable onPress={() => navigate(HOME.key)} style={styles.brand}>
            <Text style={styles.brandTitle}>IVS Real-Time</Text>
            <Text style={styles.brandSubtitle}>Stages PoC</Text>
          </Pressable>
          <View style={styles.divider} />
          <NavItem
            icon={HOME.icon}
            label={HOME.label}
            active={HOME.key === activeKey}
            onPress={() => navigate(HOME.key)}
          />
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
      </MenuContext.Provider>
    </NavigationContext.Provider>
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
  title: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
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
