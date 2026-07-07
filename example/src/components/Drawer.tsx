import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { colors, spacing } from '../theme';

const WIDTH = Math.min(300, Dimensions.get('window').width * 0.82);
const DURATION = 200;

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A left slide-in drawer with a dimming backdrop, built on Animated (no nav
 * dependency). Stays mounted; visibility is driven by `open` so the slide
 * animates both ways. Tap the backdrop to close.
 */
export function Drawer({ open, onClose, children }: DrawerProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: DURATION,
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-WIDTH, 0],
  });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={open ? 'auto' : 'none'}
    >
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: WIDTH,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    paddingTop: (StatusBar.currentHeight ?? 0) + spacing.lg,
  },
});
