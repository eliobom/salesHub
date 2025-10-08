import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, IconButton, useTheme } from 'react-native-paper';
import { useOffline } from '../../hooks/useOffline';

interface SyncStatusProps {
  compact?: boolean;
  showLastSync?: boolean;
  onSyncPress?: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  compact = false,
  showLastSync = true,
  onSyncPress,
}) => {
  const theme = useTheme();
  const {
    isOnline,
    isSyncing,
    pendingItems,
    lastSyncText,
    sync,
    canSync
  } = useOffline();

  const handleSync = async () => {
    try {
      await sync();
      onSyncPress?.();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const getStatusColor = () => {
    if (isSyncing) return theme.colors.primary;
    if (!isOnline) return theme.colors.error;
    if (pendingItems > 0) return theme.colors.tertiary;
    return theme.colors.primary;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (pendingItems > 0) return `${pendingItems} pending`;
    return 'Synced';
  };

  const getStatusIcon = () => {
    if (isSyncing) return 'sync';
    if (!isOnline) return 'wifi-off';
    if (pendingItems > 0) return 'cloud-upload';
    return 'check-circle';
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <IconButton
          icon={getStatusIcon()}
          size={20}
          iconColor={getStatusColor()}
          onPress={canSync ? handleSync : undefined}
          disabled={!canSync}
          accessibilityLabel={`Sync status: ${getStatusText()}`}
        />
        {pendingItems > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.badgeText}>{pendingItems}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.statusRow}>
          <View style={styles.statusInfo}>
            <Text
              variant="bodyMedium"
              style={[styles.statusText, { color: getStatusColor() }]}
            >
              {getStatusText()}
            </Text>
            {showLastSync && (
              <Text
                variant="bodySmall"
                style={[styles.lastSyncText, { color: theme.colors.onSurfaceVariant }]}
              >
                Last sync: {lastSyncText}
              </Text>
            )}
          </View>
          <Button
            mode="outlined"
            onPress={handleSync}
            disabled={!canSync}
            loading={isSyncing}
            style={styles.syncButton}
            accessibilityLabel="Sync data"
          >
            {isSyncing ? 'Syncing' : 'Sync'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    paddingVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontWeight: '500',
  },
  lastSyncText: {
    marginTop: 2,
  },
  syncButton: {
    minWidth: 80,
  },
  compactContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});