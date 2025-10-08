import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme, Portal } from 'react-native-paper';

const { height: screenHeight } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  height?: number;
  showHandle?: boolean;
  dismissOnBackdropPress?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onDismiss,
  children,
  height = screenHeight * 0.6,
  showHandle = true,
  dismissOnBackdropPress = true,
}) => {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(height)).current;
  const lastGestureY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastGestureY.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        lastGestureY.current = dy;

        if (dy > 0) {
          // Only allow dragging down
          translateY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        if (dy > height * 0.3 || vy > 0.5) {
          // Dismiss if dragged down more than 30% or fast swipe down
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDismiss();
            translateY.setValue(height);
          });
        } else {
          // Snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  );

  useEffect(() => {
    if (visible) {
      translateY.setValue(height);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, height, translateY]);

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={dismissOnBackdropPress ? onDismiss : undefined}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              height,
              backgroundColor: theme.colors.surface,
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.current.panHandlers}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: theme.colors.onSurfaceVariant }]} />
            </View>
          )}
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});