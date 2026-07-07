import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigate, useOpenMenu } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme';

// Feature shortcuts. `key` matches the target screen (see SCREENS in App.tsx).
const FEATURES: {
  key: string;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    key: 'stage',
    icon: '🎭',
    title: 'Stage',
    description: 'Join an IVS stage and watch participants + events live.',
  },
  {
    key: 'camera',
    icon: '📷',
    title: 'Camera',
    description: 'Preview the local camera and list discovered devices.',
  },
];

/** Splash / landing: brand the app and jump into a feature. The default screen. */
export function HomeScreen() {
  const openMenu = useOpenMenu();
  const navigate = useNavigate();

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoGlyph}>📡</Text>
        </View>
        <Text style={styles.title}>IVS Real-Time</Text>
        <Text style={styles.subtitle}>Stages PoC</Text>
        <Text style={styles.lead}>
          A proof-of-concept for the Amazon IVS Real-Time React Native SDK.
        </Text>

        <Pressable
          onPress={openMenu}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaIcon}>☰</Text>
          <Text style={styles.ctaLabel}>Open the menu to get started</Text>
        </Pressable>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => navigate(f.key)}
            style={({ pressed }) => [styles.feature, pressed && styles.pressed]}
          >
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl, paddingTop: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoGlyph: { fontSize: 44 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: {
    color: colors.textFaint,
    fontSize: fontSize.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  lead: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: spacing.sm,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  pressed: { opacity: 0.8 },
  ctaIcon: { color: colors.onPrimary, fontSize: fontSize.lg },
  ctaLabel: {
    color: colors.onPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  features: { gap: spacing.md },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  featureIcon: { fontSize: 24, marginRight: spacing.lg },
  featureBody: { flex: 1 },
  featureTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  chevron: {
    color: colors.textFaint,
    fontSize: fontSize.xl,
    marginLeft: spacing.sm,
  },
});
