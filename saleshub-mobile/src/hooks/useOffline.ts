import { useState, useEffect, useCallback } from 'react';
import SyncService from '../services/sync';
import OfflineStorage from '../services/offline';
import { useUiStore } from '../stores/uiStore';
import NetInfo from '@react-native-community/netinfo';

interface OfflineStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingItems: number;
  isSyncing: boolean;
}

export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    lastSync: null,
    pendingItems: 0,
    isSyncing: false,
  });

  const uiStore = useUiStore();

  // Initialize offline functionality
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        await SyncService.initialize();

        // Get initial sync status
        const syncStatus = await SyncService.getSyncStatus();
        const pendingCount = await SyncService.getPendingOperationsCount();

        setStatus(prev => ({
          ...prev,
          lastSync: syncStatus?.lastSync || null,
          pendingItems: pendingCount,
        }));
      } catch (error) {
        console.error('Failed to initialize offline functionality:', error);
      }
    };

    initializeOffline();
  }, []);

  // Check online status periodically
  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        const isOnline = await SyncService.checkOnlineStatus();
        setStatus(prev => ({ ...prev, isOnline }));
      } catch (error) {
        console.error('Failed to check online status:', error);
      }
    };

    // Check immediately
    checkOnlineStatus();

    // Set up NetInfo listener for real-time connectivity changes
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isOnline = state.isConnected === true && state.isInternetReachable === true;
      setStatus(prev => ({ ...prev, isOnline }));
    });

    // Check every 30 seconds as backup
    const interval = setInterval(checkOnlineStatus, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Sync data
  const sync = useCallback(async () => {
    if (status.isSyncing) return;

    setStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const result = await SyncService.syncAll();

      // Update status
      const syncStatus = await SyncService.getSyncStatus();
      const pendingCount = await SyncService.getPendingOperationsCount();

      setStatus(prev => ({
        ...prev,
        lastSync: syncStatus?.lastSync || null,
        pendingItems: pendingCount,
        isSyncing: false,
      }));

      return result;
    } catch (error) {
      setStatus(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [status.isSyncing]);

  // Force sync
  const forceSync = useCallback(async () => {
    setStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const result = await SyncService.forceSync();

      // Update status
      const syncStatus = await SyncService.getSyncStatus();
      const pendingCount = await SyncService.getPendingOperationsCount();

      setStatus(prev => ({
        ...prev,
        lastSync: syncStatus?.lastSync || null,
        pendingItems: pendingCount,
        isSyncing: false,
      }));

      return result;
    } catch (error) {
      setStatus(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, []);

  // Queue operation for offline
  const queueOperation = useCallback(async (
    table: 'products' | 'sales' | 'sellers',
    type: 'create' | 'update' | 'delete',
    data: any
  ) => {
    try {
      await SyncService.queueOperation(table, type, data);

      // Update pending count
      const pendingCount = await SyncService.getPendingOperationsCount();
      setStatus(prev => ({ ...prev, pendingItems: pendingCount }));

      // Show offline notification if offline
      if (!status.isOnline) {
        uiStore.showToast('Operation queued for when online', 'info');
      }
    } catch (error) {
      console.error('Failed to queue operation:', error);
      throw error;
    }
  }, [status.isOnline, uiStore]);

  // Get cached data
  const getCachedData = useCallback(async (table: 'products' | 'sales' | 'sellers') => {
    return await SyncService.getCachedData(table);
  }, []);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await SyncService.clearOfflineData();
      setStatus(prev => ({
        ...prev,
        lastSync: null,
        pendingItems: 0,
      }));
      uiStore.showToast('Offline data cleared', 'success');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      uiStore.showToast('Failed to clear offline data', 'error');
      throw error;
    }
  }, [uiStore]);

  // Get storage info
  const getStorageInfo = useCallback(async () => {
    return await OfflineStorage.getStorageSize();
  }, []);

  // Get queue statistics
  const getQueueStats = useCallback(async () => {
    return await OfflineStorage.getQueueStats();
  }, []);

  // Clean up old queue items
  const cleanupQueue = useCallback(async (hoursOld: number = 24) => {
    try {
      await OfflineStorage.cleanupOldQueueItems(hoursOld);
      const pendingCount = await SyncService.getPendingOperationsCount();
      setStatus(prev => ({ ...prev, pendingItems: pendingCount }));
      uiStore.showToast('Queue cleaned up', 'success');
    } catch (error) {
      console.error('Failed to cleanup queue:', error);
      uiStore.showToast('Failed to cleanup queue', 'error');
    }
  }, [uiStore]);

  // Deduplicate queue
  const deduplicateQueue = useCallback(async () => {
    try {
      await OfflineStorage.deduplicateQueue();
      const pendingCount = await SyncService.getPendingOperationsCount();
      setStatus(prev => ({ ...prev, pendingItems: pendingCount }));
      uiStore.showToast('Queue deduplicated', 'success');
    } catch (error) {
      console.error('Failed to deduplicate queue:', error);
      uiStore.showToast('Failed to deduplicate queue', 'error');
    }
  }, [uiStore]);

  // Retry failed operations
  const retryFailedOperations = useCallback(async () => {
    try {
      const result = await SyncService.retryFailedOperations();

      // Update pending count
      const pendingCount = await SyncService.getPendingOperationsCount();
      setStatus(prev => ({ ...prev, pendingItems: pendingCount }));

      if (result.success) {
        uiStore.showToast(`Retried ${result.syncedItems} operations`, 'success');
      } else {
        uiStore.showToast(`${result.failedItems} operations still failed`, 'warning');
      }

      return result;
    } catch (error) {
      uiStore.showToast('Failed to retry operations', 'error');
      throw error;
    }
  }, [uiStore]);

  return {
    // Status
    isOnline: status.isOnline,
    isOffline: !status.isOnline,
    lastSync: status.lastSync,
    pendingItems: status.pendingItems,
    isSyncing: status.isSyncing,
    hasPendingItems: status.pendingItems > 0,

    // Actions
    sync,
    forceSync,
    queueOperation,
    getCachedData,
    clearOfflineData,
    getStorageInfo,
    retryFailedOperations,
    getQueueStats,
    cleanupQueue,
    deduplicateQueue,

    // Computed
    lastSyncText: status.lastSync
      ? new Date(status.lastSync).toLocaleString()
      : 'Never',
    canSync: status.isOnline && !status.isSyncing,
  };
};