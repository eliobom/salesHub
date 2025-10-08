import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import { useOffline } from '../../hooks/useOffline';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = false,
  compact = false,
}) => {
  const theme = useTheme();
  const { isOnline, pendingItems, lastSyncText } = useOffline();

  if (isOnline && !showDetails) {
    return null;
  }

  const statusColor = isOnline ? theme.colors.primary : theme.colors.error;
  const statusText = isOnline ? 'Online' : 'Offline';
  const icon = isOnline ? 'wifi' : 'wifi-off';

  if (compact) {
    return (
      <Chip
        icon={icon}
        mode="outlined"
        style={[styles.compactChip, { borderColor: statusColor }]}
        textStyle={{ color: statusColor }}
        accessibilityLabel={`Network status: ${statusText}`}
      >
        {statusText}
      </Chip>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}
      accessible={true}
      accessibilityLabel={`Network status: ${statusText}`}
    >
      <View style={styles.statusRow}>
        <Text
          variant="bodyMedium"
          style={[styles.statusText, { color: statusColor }]}
        >
          {statusText}
        </Text>
        {pendingItems > 0 && (
          <Chip
            mode="flat"
            style={[styles.pendingChip, { backgroundColor: theme.colors.secondaryContainer }]}
            textStyle={{ color: theme.colors.onSecondaryContainer }}
          >
            {pendingItems} pending
          </Chip>
        )}
      </View>

      {showDetails && (
        <Text
          variant="bodySmall"
          style={[styles.detailsText, { color: theme.colors.onSurfaceVariant }]}
        >
          Last sync: {lastSyncText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontWeight: '500',
  },
  pendingChip: {
    height: 24,
  },
  detailsText: {
    marginTop: 4,
  },
  compactChip: {
    height: 32,
    alignSelf: 'flex-start',
  },
});