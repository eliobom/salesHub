import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { useUiStore } from '../../stores/uiStore';

export const Toast: React.FC = () => {
  const theme = useTheme();
  const { toast, hideToast } = useUiStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [toast.visible, fadeAnim]);

  if (!toast.visible) {
    return null;
  }

  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.tertiary;
      case 'info':
      default:
        return theme.colors.secondary;
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'info':
      default:
        return 'information';
    }
  };

  const backgroundColor = theme.dark
    ? theme.colors.elevation.level3
    : theme.colors.surface;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor,
          borderColor: getToastColor(),
          borderLeftColor: getToastColor(),
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Toast notification: ${toast.message}`}
    >
      <View style={styles.content}>
        <Text
          variant="bodyMedium"
          style={[styles.icon, { color: getToastColor() }]}
        >
          {getToastIcon()}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.message, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {toast.message}
        </Text>
        <IconButton
          icon="close"
          size={20}
          onPress={hideToast}
          style={styles.closeButton}
          accessibilityLabel="Close toast"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 12,
    fontSize: 20,
  },
  message: {
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    margin: 0,
  },
});