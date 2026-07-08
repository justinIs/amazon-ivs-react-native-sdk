import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import {
  ParticipantVideo,
  type StageParticipant,
} from 'amazon-ivs-react-native-sdk';
import { colors, fontSize, radius, spacing } from '../theme';
import { initials, showsVideo } from './participantDisplay';

const POPOVER_WIDTH = 100;
const POPOVER_HEIGHT = 136;
const MARGIN = spacing.sm;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/**
 * The local publisher's self-view, floated as a small draggable popover over
 * the remote grid. Kept intentionally compact so it never blocks much of a
 * remote video. Dragging uses the built-in PanResponder/Animated APIs (no
 * gesture library dependency); the tile is clamped to stay inside the grid.
 *
 * Note: the initial corner is computed from the container size at mount. On a
 * rotation the tile keeps its last dragged spot rather than re-docking — good
 * enough for the example app.
 */
export function LocalPopover({
  participant: p,
  containerWidth,
  containerHeight,
}: {
  participant: StageParticipant;
  containerWidth: number;
  containerHeight: number;
}) {
  const video = showsVideo(p);
  const micOff = !p.hasAudio || p.audioMuted;

  // Furthest top-left the tile can sit while staying fully on screen.
  const maxX = Math.max(MARGIN, containerWidth - POPOVER_WIDTH - MARGIN);
  const maxY = Math.max(MARGIN, containerHeight - POPOVER_HEIGHT - MARGIN);

  // Start docked in the top-right corner. `pos` is the last committed spot;
  // `pan` is the live animated position (updated absolutely during a drag).
  const pos = useRef<{ x: number; y: number }>({ x: maxX, y: MARGIN });
  const pan = useRef(new Animated.ValueXY(pos.current)).current;

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderMove: (_, g) => {
        pan.setValue({
          x: clamp(pos.current.x + g.dx, MARGIN, maxX),
          y: clamp(pos.current.y + g.dy, MARGIN, maxY),
        });
      },
      onPanResponderRelease: (_, g) => {
        pos.current = {
          x: clamp(pos.current.x + g.dx, MARGIN, maxX),
          y: clamp(pos.current.y + g.dy, MARGIN, maxY),
        };
      },
    })
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[styles.popover, { left: pan.x, top: pan.y }]}
    >
      {video ? (
        <ParticipantVideo
          participantId={p.participantId}
          streamVersion={p.streamVersion}
          mirror={p.isLocal}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(p)}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        {micOff && <Text style={styles.mic}>🔇</Text>}
        <Text style={styles.name} numberOfLines={1}>
          You
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popover: {
    position: 'absolute',
    width: POPOVER_WIDTH,
    height: POPOVER_HEIGHT,
    backgroundColor: '#000',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    justifyContent: 'center',
    // Lift the tile off the grid so it reads as floating.
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mic: { fontSize: fontSize.xs },
  name: {
    flex: 1,
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
