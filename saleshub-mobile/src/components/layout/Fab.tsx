import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';

interface FabProps {
  icon: string;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  mode?: 'flat' | 'elevated';
  style?: any;
  visible?: boolean;
}

export const Fab: React.FC<FabProps> = ({
  icon,
  onPress,
  label,
  disabled = false,
  loading = false,
  size = 'large',
  mode = 'elevated',
  style,
  visible = true,
}) => {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <FAB
      icon={icon}
      onPress={onPress}
      label={label}
      disabled={disabled}
      loading={loading}
      size={size}
      mode={mode}
      style={[
        styles.fab,
        style,
      ]}
      theme={{
        colors: {
          primaryContainer: theme.colors.primaryContainer,
          onPrimaryContainer: theme.colors.onPrimaryContainer,
          surface: theme.colors.surface,
          onSurface: theme.colors.onSurface,
        },
      }}
      accessible={true}
      accessibilityLabel={label || `Action: ${icon}`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});