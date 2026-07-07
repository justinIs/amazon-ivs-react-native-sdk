import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import type { StageParticipant } from 'amazon-ivs-react-native-sdk';
import { spacing } from '../theme';
import { ParticipantDetails } from './ParticipantDetails';
import { ParticipantTile } from './ParticipantTile';

const GAP = 6;

/**
 * Pick a column count that keeps tiles reasonably square on a portrait phone.
 * Tuned by hand rather than ceil(sqrt(n)) so 2 stacks vertically (call-like)
 * and mid-size calls stay at 2 columns.
 */
function columnsFor(count: number): number {
  if (count <= 2) return 1;
  if (count <= 6) return 2;
  return 3;
}

/**
 * A gap-filling grid of participant tiles. Measures itself and divides the
 * space into an N-column grid so every tile is visible without scrolling.
 * Tapping a tile opens that participant's details.
 *
 * Rendering limits (cap the number of live videos, minified overflow row,
 * active-speaker prioritisation) will slot in here on top of this layout.
 */
export function ParticipantGrid({
  participants,
}: {
  participants: StageParticipant[];
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  };

  const count = participants.length;
  const cols = columnsFor(count);
  const rows = Math.max(1, Math.ceil(count / cols));
  const tileWidth = (size.width - GAP * (cols - 1)) / cols;
  const tileHeight = (size.height - GAP * (rows - 1)) / rows;
  const ready = size.width > 0 && size.height > 0;

  const selected =
    participants.find((p) => p.participantId === selectedId) ?? null;

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {ready &&
        participants.map((p) => (
          <ParticipantTile
            key={p.participantId}
            participant={p}
            width={tileWidth}
            height={tileHeight}
            onPress={() => setSelectedId(p.participantId)}
          />
        ))}

      <Modal
        visible={selected != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedId(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelectedId(null)}>
          <Pressable style={styles.sheet}>
            {selected && (
              <ParticipantDetails
                participant={selected}
                onClose={() => setSelectedId(null)}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    paddingBottom: spacing.xl,
  },
});
