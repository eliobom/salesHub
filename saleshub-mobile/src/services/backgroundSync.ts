import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import SyncService from './sync';
import OfflineStorage from './offline';

const BACKGROUND_SYNC_TASK = 'background-sync';

// Define the background task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log('Background sync task started');

    // Check if we have pending operations or need to sync
    const pendingCount = await SyncService.getPendingOperationsCount();
    const syncStatus = await OfflineStorage.getSyncStatus();

    // Only sync if we have pending items or it's been more than 30 minutes since last sync
    const shouldSync = pendingCount > 0 ||
      (syncStatus && Date.now() - syncStatus.lastSync > 30 * 60 * 1000);

    if (!shouldSync) {
      console.log('No sync needed, skipping background sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Perform the sync
    const result = await SyncService.syncAll();

    if (result.success) {
      console.log(`Background sync completed successfully: ${result.syncedItems} items synced`);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      console.log(`Background sync completed with failures: ${result.failedItems} items failed`);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error) {
    console.error('Background sync task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

class BackgroundSyncService {
  private static isRegistered = false;

  // Register the background sync task
  static async register(): Promise<void> {
    if (this.isRegistered) {
      console.log('Background sync already registered');
      return;
    }

    try {
      // Check if the task is already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

      if (!isRegistered) {
        // Register the task
        await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false, // Continue after app terminates
          startOnBoot: true, // Start after device reboot
        });

        console.log('Background sync task registered successfully');
      } else {
        console.log('Background sync task already registered');
      }

      this.isRegistered = true;
    } catch (error) {
      console.error('Failed to register background sync task:', error);
      throw error;
    }
  }

  // Unregister the background sync task
  static async unregister(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
        console.log('Background sync task unregistered');
      }

      this.isRegistered = false;
    } catch (error) {
      console.error('Failed to unregister background sync task:', error);
      throw error;
    }
  }

  // Check if background sync is available on this device
  static async isAvailable(): Promise<boolean> {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      return status === BackgroundFetch.BackgroundFetchStatus.Available;
    } catch (error) {
      console.error('Failed to check background fetch availability:', error);
      return false;
    }
  }

  // Get the current status of background fetch
  static async getStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      return status || BackgroundFetch.BackgroundFetchStatus.Denied;
    } catch (error) {
      console.error('Failed to get background fetch status:', error);
      return BackgroundFetch.BackgroundFetchStatus.Denied;
    }
  }

  // Force a background sync (for testing)
  static async forceBackgroundSync(): Promise<void> {
    try {
      await BackgroundFetch.setMinimumIntervalAsync(1); // Set to minimum for testing
      console.log('Forced background sync interval to 1 minute for testing');
    } catch (error) {
      console.error('Failed to force background sync:', error);
    }
  }

  // Reset to normal sync interval
  static async resetSyncInterval(): Promise<void> {
    try {
      await BackgroundFetch.setMinimumIntervalAsync(15 * 60); // Back to 15 minutes
      console.log('Reset background sync interval to 15 minutes');
    } catch (error) {
      console.error('Failed to reset sync interval:', error);
    }
  }

  // Smart sync based on app state and connectivity
  static async smartSync(): Promise<void> {
    try {
      const isOnline = await SyncService.checkOnlineStatus();
      const pendingCount = await SyncService.getPendingOperationsCount();

      if (!isOnline) {
        console.log('Device offline, skipping smart sync');
        return;
      }

      // Prioritize sync if we have pending operations
      if (pendingCount > 0) {
        console.log(`Smart sync: ${pendingCount} pending operations, syncing now`);
        await SyncService.syncAll();
        return;
      }

      // Check last sync time
      const syncStatus = await OfflineStorage.getSyncStatus();
      const timeSinceLastSync = syncStatus ? Date.now() - syncStatus.lastSync : Infinity;

      // Sync if it's been more than 2 hours
      if (timeSinceLastSync > 2 * 60 * 60 * 1000) {
        console.log('Smart sync: Data is stale, syncing now');
        await SyncService.syncAll();
      } else {
        console.log('Smart sync: Data is fresh, no sync needed');
      }
    } catch (error) {
      console.error('Smart sync failed:', error);
    }
  }
}

export default BackgroundSyncService;