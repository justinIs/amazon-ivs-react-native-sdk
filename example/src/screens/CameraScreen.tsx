import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CameraPreview,
  type CameraPosition,
} from 'amazon-ivs-react-native-sdk';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useCameraDevices } from '../hooks/useCameraDevices';
import { colors, fontSize, mono, radius, spacing } from '../theme';

/** Local camera test: live preview, flip, and the discovered device list. */
export function CameraScreen() {
  const { granted, devices, error } = useCameraDevices();
  const [position, setPosition] = useState<CameraPosition>('front');

  const flip = useCallback(() => {
    setPosition((p) => (p === 'front' ? 'back' : 'front'));
  }, []);

  return (
    <View style={styles.screen}>
      <Card title="Local preview">
        <View style={styles.previewCard}>
          {granted ? (
            <CameraPreview
              position={position}
              aspectMode="fill"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                {error ?? 'Requesting camera permission…'}
              </Text>
            </View>
          )}
        </View>
        <Button
          label={`Flip camera (now: ${position})`}
          onPress={flip}
          disabled={!granted}
          style={styles.flip}
        />
      </Card>

      <Card title={`Devices (${devices.length})`}>
        {devices.length === 0 ? (
          <Text style={styles.muted}>None discovered yet.</Text>
        ) : (
          devices.map((d) => (
            <Text key={d.id} style={styles.deviceRow}>
              {d.type} · {d.position} · {d.name}
            </Text>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  previewCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  flip: { marginTop: spacing.md },
  muted: { color: colors.textFaint, fontStyle: 'italic' },
  deviceRow: {
    color: '#c8ccd0',
    paddingVertical: spacing.xs,
    fontFamily: mono,
    fontSize: fontSize.sm,
  },
});
