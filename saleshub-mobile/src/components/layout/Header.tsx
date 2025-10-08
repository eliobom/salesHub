import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onActionPress?: () => void;
  actionIcon?: string;
  actionLabel?: string;
  elevated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  onActionPress,
  actionIcon,
  actionLabel,
  elevated = false,
}) => {
  const theme = useTheme();

  return (
    <Appbar.Header
      style={[
        styles.header,
        elevated && { elevation: 4, shadowColor: '#000', shadowOpacity: 0.3 },
      ]}
      theme={{
        colors: {
          primary: theme.colors.primary,
          onPrimary: theme.colors.onPrimary,
          surface: theme.colors.surface,
          onSurface: theme.colors.onSurface,
        },
      }}
    >
      {onBackPress && (
        <Appbar.BackAction
          onPress={onBackPress}
          accessibilityLabel="Go back"
        />
      )}

      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
      />

      {onActionPress && actionIcon && (
        <Appbar.Action
          icon={actionIcon}
          onPress={onActionPress}
          accessibilityLabel={actionLabel || 'Action'}
        />
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'transparent',
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
});