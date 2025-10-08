import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type Sale = Database['public']['Tables']['sales']['Row'];
type Seller = Database['public']['Tables']['sellers']['Row'];

interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'products' | 'sales' | 'sellers';
  data: any;
  timestamp: number;
  retryCount: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  dependencies?: string[]; // IDs of items this depends on
  conflictStrategy?: 'overwrite' | 'merge' | 'skip';
}

interface CachedData<T> {
  data: T[];
  lastUpdated: number;
  version: number;
}

class OfflineStorage {
  private static readonly QUEUE_KEY = '@offline_queue';
  private static readonly PRODUCTS_CACHE_KEY = '@products_cache';
  private static readonly SALES_CACHE_KEY = '@sales_cache';
  private static readonly SELLERS_CACHE_KEY = '@sellers_cache';
  private static readonly CATEGORIES_CACHE_KEY = '@categories_cache';
  private static readonly SYNC_STATUS_KEY = '@sync_status';
  private static readonly MAX_RETRY_COUNT = 3;

  // Queue management
  static async addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const queueItem: OfflineQueueItem = {
        ...item,
        id: `${item.table}_${item.type}_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
        priority: item.priority || 'normal',
      };

      queue.push(queueItem);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add item to offline queue:', error);
      throw error;
    }
  }

  static async getQueue(): Promise<OfflineQueueItem[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  }

  static async removeFromQueue(itemId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filteredQueue = queue.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Failed to remove item from queue:', error);
      throw error;
    }
  }

  static async updateQueueItem(itemId: string, updates: Partial<OfflineQueueItem>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const itemIndex = queue.findIndex(item => item.id === itemId);

      if (itemIndex !== -1) {
        queue[itemIndex] = { ...queue[itemIndex], ...updates };
        await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Failed to update queue item:', error);
      throw error;
    }
  }

  static async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
      throw error;
    }
  }

  // Cache management
  static async cacheProducts(products: Product[]): Promise<void> {
    try {
      const cache: CachedData<Product> = {
        data: products,
        lastUpdated: Date.now(),
        version: 1,
      };
      await AsyncStorage.setItem(this.PRODUCTS_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache products:', error);
      throw error;
    }
  }

  static async getCachedProducts(): Promise<CachedData<Product> | null> {
    try {
      const cacheData = await AsyncStorage.getItem(this.PRODUCTS_CACHE_KEY);
      return cacheData ? JSON.parse(cacheData) : null;
    } catch (error) {
      console.error('Failed to get cached products:', error);
      return null;
    }
  }

  static async cacheSales(sales: Sale[]): Promise<void> {
    try {
      const cache: CachedData<Sale> = {
        data: sales,
        lastUpdated: Date.now(),
        version: 1,
      };
      await AsyncStorage.setItem(this.SALES_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache sales:', error);
      throw error;
    }
  }

  static async getCachedSales(): Promise<CachedData<Sale> | null> {
    try {
      const cacheData = await AsyncStorage.getItem(this.SALES_CACHE_KEY);
      return cacheData ? JSON.parse(cacheData) : null;
    } catch (error) {
      console.error('Failed to get cached sales:', error);
      return null;
    }
  }

  static async cacheSellers(sellers: Seller[]): Promise<void> {
    try {
      const cache: CachedData<Seller> = {
        data: sellers,
        lastUpdated: Date.now(),
        version: 1,
      };
      await AsyncStorage.setItem(this.SELLERS_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache sellers:', error);
      throw error;
    }
  }

  static async getCachedSellers(): Promise<CachedData<Seller> | null> {
    try {
      const cacheData = await AsyncStorage.getItem(this.SELLERS_CACHE_KEY);
      return cacheData ? JSON.parse(cacheData) : null;
    } catch (error) {
      console.error('Failed to get cached sellers:', error);
      return null;
    }
  }

  static async cacheCategories(categories: any[]): Promise<void> {
    try {
      const cache: CachedData<any> = {
        data: categories,
        lastUpdated: Date.now(),
        version: 1,
      };
      await AsyncStorage.setItem(this.CATEGORIES_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache categories:', error);
      throw error;
    }
  }

  static async getCachedCategories(): Promise<CachedData<any> | null> {
    try {
      const cacheData = await AsyncStorage.getItem(this.CATEGORIES_CACHE_KEY);
      return cacheData ? JSON.parse(cacheData) : null;
    } catch (error) {
      console.error('Failed to get cached categories:', error);
      return null;
    }
  }

  // Sync status management
  static async setSyncStatus(status: {
    lastSync: number;
    isOnline: boolean;
    pendingItems: number;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to set sync status:', error);
      throw error;
    }
  }

  static async getSyncStatus(): Promise<{
    lastSync: number;
    isOnline: boolean;
    pendingItems: number;
  } | null> {
    try {
      const statusData = await AsyncStorage.getItem(this.SYNC_STATUS_KEY);
      return statusData ? JSON.parse(statusData) : null;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }

  // Utility methods
  static async clearAllCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.PRODUCTS_CACHE_KEY),
        AsyncStorage.removeItem(this.SALES_CACHE_KEY),
        AsyncStorage.removeItem(this.SELLERS_CACHE_KEY),
        AsyncStorage.removeItem(this.CATEGORIES_CACHE_KEY),
        AsyncStorage.removeItem(this.SYNC_STATUS_KEY),
      ]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  static async getStorageSize(): Promise<{
    queue: number;
    products: number;
    sales: number;
    sellers: number;
    categories: number;
    total: number;
  }> {
    try {
      const [
        queueData,
        productsData,
        salesData,
        sellersData,
        categoriesData,
      ] = await Promise.all([
        AsyncStorage.getItem(this.QUEUE_KEY),
        AsyncStorage.getItem(this.PRODUCTS_CACHE_KEY),
        AsyncStorage.getItem(this.SALES_CACHE_KEY),
        AsyncStorage.getItem(this.SELLERS_CACHE_KEY),
        AsyncStorage.getItem(this.CATEGORIES_CACHE_KEY),
      ]);

      const queue = queueData ? queueData.length : 0;
      const products = productsData ? productsData.length : 0;
      const sales = salesData ? salesData.length : 0;
      const sellers = sellersData ? sellersData.length : 0;
      const categories = categoriesData ? categoriesData.length : 0;
      const total = queue + products + sales + sellers + categories;

      return { queue, products, sales, sellers, categories, total };
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return { queue: 0, products: 0, sales: 0, sellers: 0, categories: 0, total: 0 };
    }
  }

  // Check if item should be retried
  static shouldRetryItem(item: OfflineQueueItem): boolean {
    return item.retryCount < this.MAX_RETRY_COUNT;
  }

  // Get failed items that need retry
  static async getFailedItems(): Promise<OfflineQueueItem[]> {
    const queue = await this.getQueue();
    return queue.filter(item => !this.shouldRetryItem(item));
  }

  // Get prioritized queue (sorted by priority and timestamp)
  static async getPrioritizedQueue(): Promise<OfflineQueueItem[]> {
    const queue = await this.getQueue();

    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };

    return queue.sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  // Remove duplicate operations (keep the latest for the same resource)
  static async deduplicateQueue(): Promise<void> {
    try {
      const queue = await this.getQueue();
      const seen = new Map<string, OfflineQueueItem>();

      // Process items in reverse order to keep the latest
      for (let i = queue.length - 1; i >= 0; i--) {
        const item = queue[i];
        const key = `${item.table}_${item.data?.id || item.data?.name || 'unknown'}`;

        if (!seen.has(key)) {
          seen.set(key, item);
        } else {
          // Check if this is a more recent operation
          const existing = seen.get(key)!;
          if (item.timestamp > existing.timestamp) {
            seen.set(key, item);
          }
        }
      }

      const deduplicatedQueue = Array.from(seen.values());
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(deduplicatedQueue));
    } catch (error) {
      console.error('Failed to deduplicate queue:', error);
    }
  }

  // Get queue statistics
  static async getQueueStats(): Promise<{
    total: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    byTable: Record<string, number>;
    oldestItem: number | null;
    failedItems: number;
  }> {
    const queue = await this.getQueue();
    const failedItems = await this.getFailedItems();

    const stats = {
      total: queue.length,
      byPriority: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byTable: {} as Record<string, number>,
      oldestItem: queue.length > 0 ? Math.min(...queue.map(item => item.timestamp)) : null,
      failedItems: failedItems.length,
    };

    queue.forEach(item => {
      const priority = item.priority || 'normal';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byTable[item.table] = (stats.byTable[item.table] || 0) + 1;
    });

    return stats;
  }

  // Clean up old queue items (older than specified hours)
  static async cleanupOldQueueItems(hoursOld: number = 24): Promise<void> {
    try {
      const queue = await this.getQueue();
      const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);

      const filteredQueue = queue.filter(item => item.timestamp > cutoffTime);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filteredQueue));

      const removedCount = queue.length - filteredQueue.length;
      if (removedCount > 0) {
        console.log(`Cleaned up ${removedCount} old queue items`);
      }
    } catch (error) {
      console.error('Failed to cleanup old queue items:', error);
    }
  }

  // Check for conflicts between queue items
  static async detectConflicts(): Promise<{
    conflicts: Array<{
      item1: OfflineQueueItem;
      item2: OfflineQueueItem;
      reason: string;
    }>;
  }> {
    const queue = await this.getQueue();
    const conflicts: Array<{
      item1: OfflineQueueItem;
      item2: OfflineQueueItem;
      reason: string;
    }> = [];

    // Check for multiple operations on the same resource
    const operationsByResource = new Map<string, OfflineQueueItem[]>();

    queue.forEach(item => {
      const resourceKey = `${item.table}_${item.data?.id || 'unknown'}`;
      if (!operationsByResource.has(resourceKey)) {
        operationsByResource.set(resourceKey, []);
      }
      operationsByResource.get(resourceKey)!.push(item);
    });

    operationsByResource.forEach((operations, resourceKey) => {
      if (operations.length > 1) {
        // Check for conflicting operations
        const hasCreate = operations.some(op => op.type === 'create');
        const hasUpdate = operations.some(op => op.type === 'update');
        const hasDelete = operations.some(op => op.type === 'delete');

        if (hasDelete && (hasCreate || hasUpdate)) {
          conflicts.push({
            item1: operations.find(op => op.type === 'delete')!,
            item2: operations.find(op => op.type !== 'delete')!,
            reason: 'Delete operation conflicts with create/update',
          });
        }
      }
    });

    return { conflicts };
  }

  // Clean up old cache data (older than specified days)
  static async cleanupOldCache(daysOld: number = 7): Promise<void> {
    try {
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

      const [productsCache, salesCache, sellersCache, categoriesCache] = await Promise.all([
        this.getCachedProducts(),
        this.getCachedSales(),
        this.getCachedSellers(),
        this.getCachedCategories(),
      ]);

      if (productsCache && productsCache.lastUpdated < cutoffTime) {
        await AsyncStorage.removeItem(this.PRODUCTS_CACHE_KEY);
      }

      if (salesCache && salesCache.lastUpdated < cutoffTime) {
        await AsyncStorage.removeItem(this.SALES_CACHE_KEY);
      }

      if (sellersCache && sellersCache.lastUpdated < cutoffTime) {
        await AsyncStorage.removeItem(this.SELLERS_CACHE_KEY);
      }

      if (categoriesCache && categoriesCache.lastUpdated < cutoffTime) {
        await AsyncStorage.removeItem(this.CATEGORIES_CACHE_KEY);
      }
    } catch (error) {
      console.error('Failed to cleanup old cache:', error);
    }
  }
}

export default OfflineStorage;