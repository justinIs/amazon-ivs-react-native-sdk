import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigate } from '../navigation';
import { colors, fontSize, radius, spacing } from '../theme';

interface Destination {
  key: string;
  icon: string;
  title: string;
  description: string;
}

// Order matches the drawer: Stage first.
const DESTINATIONS: Destination[] = [
  {
    key: 'stage',
    icon: '🎭',
    title: 'Stage connection',
    description:
      'Join an IVS stage with a token and watch participants + events.',
  },
  {
    key: 'camera',
    icon: '📷',
    title: 'Camera test',
    description: 'Preview the local camera and list discovered devices.',
  },
];

/** Splash / landing: pick what to do. The app's default screen. */
export function HomeScreen() {
  const navigate = useNavigate();

  return (
    <View style={styles.screen}>
      <Text style={styles.lead}>
        A proof-of-concept for the Amazon IVS Real-Time React Native SDK. Pick a
        area to explore, or open the menu any time.
      </Text>

      {DESTINATIONS.map((d) => (
        <Pressable
          key={d.key}
          onPress={() => navigate(d.key)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Text style={styles.icon}>{d.icon}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{d.title}</Text>
            <Text style={styles.cardDesc}>{d.description}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  lead: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.7 },
  icon: { fontSize: 28, marginRight: spacing.lg },
  cardBody: { flex: 1 },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardDesc: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 18 },
  chevron: {
    color: colors.textFaint,
    fontSize: fontSize.xl,
    marginLeft: spacing.sm,
  },
});
