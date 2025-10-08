import { ApiService } from './api';
import { ProductService } from './products';
import { SaleService } from './sales';
import { SellerService } from './sellers';
import OfflineStorage from './offline';
import { useUiStore } from '../stores/uiStore';
import NetInfo from '@react-native-community/netinfo';

interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
}

class SyncService {
  private static isOnline: boolean = true; // Assume online by default
  private static syncInProgress: boolean = false;

  // Initialize sync service
  static async initialize(): Promise<void> {
    // Basic initialization - in a real app, you'd set up network monitoring
    this.isOnline = true;
  }

  // Check if device is online
  static async checkOnlineStatus(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected === true && netInfo.isInternetReachable === true;
    } catch (error) {
      console.error('Failed to check network status:', error);
      // Fallback to assuming online if we can't check
      return true;
    }
  }

  // Main sync function
  static async syncAll(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: ['Sync already in progress'],
      };
    }

    if (!this.isOnline) {
      console.log('Device is offline, skipping sync');
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: ['Device is offline'],
      };
    }

    this.syncInProgress = true;
    const uiStore = useUiStore.getState();

    try {
      uiStore.setLoading(true, 'Syncing data...');

      const result = await this.performSync();

      // Update sync status
      await OfflineStorage.setSyncStatus({
        lastSync: Date.now(),
        isOnline: true,
        pendingItems: result.failedItems,
      });

      uiStore.setLoading(false);

      if (result.success) {
        uiStore.showToast(`Synced ${result.syncedItems} items successfully`, 'success');
      } else if (result.failedItems > 0) {
        uiStore.showToast(`${result.failedItems} items failed to sync`, 'warning');
      }

      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      uiStore.setLoading(false);
      uiStore.showToast('Sync failed', 'error');

      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Perform the actual sync operations
  private static async performSync(): Promise<SyncResult> {
    const errors: string[] = [];
    let syncedItems = 0;
    let failedItems = 0;

    try {
      // 1. Sync offline queue (pending operations)
      const queueResult = await this.syncOfflineQueue();
      syncedItems += queueResult.syncedItems;
      failedItems += queueResult.failedItems;
      errors.push(...queueResult.errors);

      // 2. Sync data from server to local cache
      const cacheResult = await this.syncFromServer();
      syncedItems += cacheResult.syncedItems;
      failedItems += cacheResult.failedItems;
      errors.push(...cacheResult.errors);

      return {
        success: failedItems === 0,
        syncedItems,
        failedItems,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        syncedItems,
        failedItems: failedItems + 1,
        errors: [...errors, error instanceof Error ? error.message : 'Sync error'],
      };
    }
  }

  // Sync offline queue (pending operations)
  private static async syncOfflineQueue(): Promise<SyncResult> {
    // Clean up old items and deduplicate before processing
    await OfflineStorage.cleanupOldQueueItems();
    await OfflineStorage.deduplicateQueue();

    const queue = await OfflineStorage.getPrioritizedQueue();
    const errors: string[] = [];
    let syncedItems = 0;
    let failedItems = 0;

    // Check for conflicts first
    const { conflicts } = await OfflineStorage.detectConflicts();
    if (conflicts.length > 0) {
      console.warn('Detected queue conflicts:', conflicts);
      // For now, log conflicts but continue processing
      // In a more advanced implementation, you might want to resolve conflicts
    }

    for (const item of queue) {
      try {
        await this.processQueueItem(item);
        await OfflineStorage.removeFromQueue(item.id);
        syncedItems++;
      } catch (error) {
        console.error(`Failed to sync queue item ${item.id}:`, error);

        if (OfflineStorage.shouldRetryItem(item)) {
          // Increment retry count
          await OfflineStorage.updateQueueItem(item.id, {
            retryCount: item.retryCount + 1,
          });
        } else {
          // Max retries reached, mark as failed
          failedItems++;
          errors.push(`Failed to sync ${item.type} ${item.table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return {
      success: failedItems === 0,
      syncedItems,
      failedItems,
      errors,
    };
  }

  // Process individual queue item
  private static async processQueueItem(item: any): Promise<void> {
    switch (item.table) {
      case 'products':
        switch (item.type) {
          case 'create':
            await ApiService.create('products', item.data);
            break;
          case 'update':
            await ApiService.update('products', item.data.id, item.data);
            break;
          case 'delete':
            await ApiService.delete('products', item.data.id);
            break;
        }
        break;

      case 'sales':
        switch (item.type) {
          case 'create':
            await ApiService.create('sales', item.data);
            break;
          case 'update':
            await ApiService.update('sales', item.data.id, item.data);
            break;
          case 'delete':
            await ApiService.delete('sales', item.data.id);
            break;
        }
        break;

      case 'sellers':
        switch (item.type) {
          case 'create':
            await ApiService.create('sellers', item.data);
            break;
          case 'update':
            await ApiService.update('sellers', item.data.id, item.data);
            break;
          case 'delete':
            await ApiService.delete('sellers', item.data.id);
            break;
        }
        break;

      default:
        throw new Error(`Unknown table: ${item.table}`);
    }
  }

  // Sync data from server to local cache with conflict resolution
  private static async syncFromServer(): Promise<SyncResult> {
    const errors: string[] = [];
    let syncedItems = 0;
    let failedItems = 0;

    try {
      // Sync products with conflict resolution
      const products = await ProductService.getAll();
      await this.syncProductsWithConflictResolution(products);
      syncedItems += products.length;
    } catch (error) {
      failedItems++;
      errors.push(`Failed to sync products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Sync sales with conflict resolution
      const sales = await SaleService.getAll({ includeItems: false, includeSeller: false });
      await this.syncSalesWithConflictResolution(sales);
      syncedItems += sales.length;
    } catch (error) {
      failedItems++;
      errors.push(`Failed to sync sales: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Sync sellers
      const sellers = await SellerService.getAll();
      await OfflineStorage.cacheSellers(sellers);
      syncedItems += sellers.length;
    } catch (error) {
      failedItems++;
      errors.push(`Failed to sync sellers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Sync categories
      const categories = await ApiService.getAll('categories');
      await OfflineStorage.cacheCategories(categories);
      syncedItems += categories.length;
    } catch (error) {
      failedItems++;
      errors.push(`Failed to sync categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      success: failedItems === 0,
      syncedItems,
      failedItems,
      errors,
    };
  }

  // Sync products with conflict resolution
  private static async syncProductsWithConflictResolution(serverProducts: any[]): Promise<void> {
    const cachedProducts = await OfflineStorage.getCachedProducts();
    const localProducts = cachedProducts?.data || [];

    // Create maps for efficient lookup
    const serverMap = new Map(serverProducts.map(p => [p.id, p]));
    const localMap = new Map(localProducts.map(p => [p.id, p]));

    // Check for conflicts (products modified both locally and on server)
    const conflicts: Array<{server: any, local: any, resolution: string}> = [];

    for (const serverProduct of serverProducts) {
      const localProduct = localMap.get(serverProduct.id);

      if (localProduct) {
        // Check if both have been modified since last sync
        const lastSync = cachedProducts?.lastUpdated || 0;
        const serverModified = new Date(serverProduct.created_at).getTime();
        const localModified = new Date(localProduct.created_at).getTime();

        if (serverModified > lastSync && localModified > lastSync) {
          // Conflict detected
          conflicts.push({
            server: serverProduct,
            local: localProduct,
            resolution: 'server_wins' // Default: server wins
          });
        }
      }
    }

    // Resolve conflicts (for now, server always wins)
    const resolvedProducts = [...serverProducts];

    // Log conflicts for debugging
    if (conflicts.length > 0) {
      console.warn(`Resolved ${conflicts.length} product conflicts (server wins):`, conflicts);
    }

    await OfflineStorage.cacheProducts(resolvedProducts);
  }

  // Sync sales with conflict resolution
  private static async syncSalesWithConflictResolution(serverSales: any[]): Promise<void> {
    const cachedSales = await OfflineStorage.getCachedSales();
    const localSales = cachedSales?.data || [];

    // Create maps for efficient lookup
    const serverMap = new Map(serverSales.map(s => [s.id, s]));
    const localMap = new Map(localSales.map(s => [s.id, s]));

    // Check for conflicts (sales modified both locally and on server)
    const conflicts: Array<{server: any, local: any, resolution: string}> = [];

    for (const serverSale of serverSales) {
      const localSale = localMap.get(serverSale.id);

      if (localSale && !localSale.id.startsWith('temp_')) {
        // Check if both have been modified since last sync
        const lastSync = cachedSales?.lastUpdated || 0;
        const serverModified = new Date(serverSale.created_at).getTime();
        const localModified = new Date(localSale.created_at).getTime();

        if (serverModified > lastSync && localModified > lastSync) {
          // Conflict detected
          conflicts.push({
            server: serverSale,
            local: localSale,
            resolution: 'server_wins' // Default: server wins
          });
        }
      }
    }

    // For sales, we need to be more careful - don't overwrite local pending sales
    const resolvedSales = serverSales.filter(serverSale => {
      const localSale = localMap.get(serverSale.id);
      // Keep local sales that are pending (not yet synced)
      return !(localSale && localSale.status === 'pending' && localSale.id.startsWith('temp_'));
    });

    // Add back local pending sales
    const pendingLocalSales = localSales.filter(sale =>
      sale.id.startsWith('temp_') && sale.status === 'pending'
    );
    resolvedSales.push(...pendingLocalSales);

    // Log conflicts for debugging
    if (conflicts.length > 0) {
      console.warn(`Resolved ${conflicts.length} sales conflicts (server wins, pending sales preserved):`, conflicts);
    }

    await OfflineStorage.cacheSales(resolvedSales);
  }

  // Add operation to offline queue (for when offline)
  static async queueOperation(
    table: 'products' | 'sales' | 'sellers',
    type: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    if (this.isOnline) {
      // If online, execute immediately
      try {
        await this.processQueueItem({ table, type, data });
      } catch (error) {
        // If it fails, add to queue for retry
        await OfflineStorage.addToQueue({ table, type, data });
        throw error;
      }
    } else {
      // If offline, add to queue
      await OfflineStorage.addToQueue({ table, type, data });
    }
  }

  // Get cached data when offline
  static async getCachedData(table: 'products' | 'sales' | 'sellers'): Promise<any[]> {
    if (this.isOnline) {
      // If online, return empty array (should fetch from server)
      return [];
    }

    switch (table) {
      case 'products':
        const productsCache = await OfflineStorage.getCachedProducts();
        return productsCache?.data || [];
      case 'sales':
        const salesCache = await OfflineStorage.getCachedSales();
        return salesCache?.data || [];
      case 'sellers':
        const sellersCache = await OfflineStorage.getCachedSellers();
        return sellersCache?.data || [];
      default:
        return [];
    }
  }

  // Get sync status
  static async getSyncStatus() {
    return await OfflineStorage.getSyncStatus();
  }

  // Force sync (manual trigger)
  static async forceSync(): Promise<SyncResult> {
    return await this.syncAll();
  }

  // Clear all offline data
  static async clearOfflineData(): Promise<void> {
    await OfflineStorage.clearAllCache();
    await OfflineStorage.clearQueue();
  }

  // Get pending operations count
  static async getPendingOperationsCount(): Promise<number> {
    const queue = await OfflineStorage.getQueue();
    return queue.length;
  }

  // Retry failed operations
  static async retryFailedOperations(): Promise<SyncResult> {
    const failedItems = await OfflineStorage.getFailedItems();
    const errors: string[] = [];
    let syncedItems = 0;
    let failedItemsCount = 0;

    for (const item of failedItems) {
      try {
        await this.processQueueItem(item);
        await OfflineStorage.removeFromQueue(item.id);
        syncedItems++;
      } catch (error) {
        failedItemsCount++;
        errors.push(`Failed to retry ${item.type} ${item.table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: failedItemsCount === 0,
      syncedItems,
      failedItems: failedItemsCount,
      errors,
    };
  }
}

export default SyncService;