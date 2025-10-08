import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SaleService, SaleWithItems, CreateSaleData } from '../services/sales';
import SyncService from '../services/sync';
import OfflineStorage from '../services/offline';
import type { Database } from '../lib/supabase';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleUpdate = Database['public']['Tables']['sales']['Update'];

interface SalesState {
  // State
  sales: SaleWithItems[];
  currentSale: SaleWithItems | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Filters
  statusFilter: string | null;
  sellerFilter: string | null;
  dateRange: { startDate: string; endDate: string } | null;

  // Summary
  summary: {
    totalSales: number;
    totalRevenue: number;
    averageSale: number;
    salesByStatus: Record<string, number>;
  } | null;

  // Cache
  lastFetched: number | null;
  cacheExpiry: number;

  // Actions
  fetchSales: (options?: {
    forceRefresh?: boolean;
    includeItems?: boolean;
    includeSeller?: boolean;
  }) => Promise<void>;

  fetchSaleById: (id: string) => Promise<void>;
  createSale: (saleData: CreateSaleData) => Promise<SaleWithItems>;
  updateSale: (id: string, updates: SaleUpdate) => Promise<Sale>;
  deleteSale: (id: string) => Promise<void>;
  updateSaleStatus: (id: string, status: string) => Promise<Sale>;

  // Filtering
  filterByStatus: (status: string | null) => Promise<void>;
  filterBySeller: (sellerId: string | null) => Promise<void>;
  filterByDateRange: (dateRange: { startDate: string; endDate: string } | null) => Promise<void>;

  // Summary
  fetchSummary: (options?: {
    sellerId?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;

  // Cache management
  clearCache: () => void;
  isCacheValid: () => boolean;

  // UI actions
  setCurrentSale: (sale: SaleWithItems | null) => void;
  clearError: () => void;
  setError: (error: string | null) => void;
}

const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      // Initial state
      sales: [],
      currentSale: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
      statusFilter: null,
      sellerFilter: null,
      dateRange: null,
      summary: null,
      lastFetched: null,
      cacheExpiry: CACHE_EXPIRY,

      // Fetch sales with offline support
      fetchSales: async (options = {}) => {
        const { forceRefresh = false, includeItems = true, includeSeller = true } = options;
        const state = get();
        const isOnline = await SyncService.checkOnlineStatus();
    
        // Check cache validity
        if (!forceRefresh && state.isCacheValid()) {
          return;
        }
    
        // If offline and we have cached data, use it
        if (!isOnline && !forceRefresh) {
          try {
            const cachedSales = await OfflineStorage.getCachedSales();
            if (cachedSales && cachedSales.data.length > 0) {
              // Apply filters to cached data
              let filteredSales = cachedSales.data as SaleWithItems[];
    
              if (state.statusFilter) {
                filteredSales = filteredSales.filter(sale => sale.status === state.statusFilter);
              }
    
              if (state.sellerFilter) {
                filteredSales = filteredSales.filter(sale => sale.seller_id === state.sellerFilter);
              }
    
              if (state.dateRange) {
                filteredSales = filteredSales.filter(sale => {
                  const saleDate = new Date(sale.created_at);
                  return saleDate >= new Date(state.dateRange!.startDate) &&
                         saleDate <= new Date(state.dateRange!.endDate);
                });
              }
    
              set({
                sales: filteredSales,
                isLoading: false,
                // Don't update lastFetched for cached data
              });
              return;
            }
          } catch (cacheError) {
            console.warn('Failed to load cached sales:', cacheError);
          }
        }
    
        // Online fetch or forced refresh
        if (!isOnline && forceRefresh) {
          // Can't force refresh when offline
          set({
            error: 'Cannot refresh data while offline',
            isLoading: false,
          });
          return;
        }
    
        try {
          set({ isLoading: true, error: null });
    
          const sales = await SaleService.getAll({
            includeItems,
            includeSeller,
            orderBy: { column: 'created_at', ascending: false },
          });
    
          // Cache the sales for offline use
          await OfflineStorage.cacheSales(sales);
    
          // Apply filters
          let filteredSales = sales;
    
          if (state.statusFilter) {
            filteredSales = filteredSales.filter(sale => sale.status === state.statusFilter);
          }
    
          if (state.sellerFilter) {
            filteredSales = filteredSales.filter(sale => sale.seller_id === state.sellerFilter);
          }
    
          if (state.dateRange) {
            filteredSales = filteredSales.filter(sale => {
              const saleDate = new Date(sale.created_at);
              return saleDate >= new Date(state.dateRange!.startDate) &&
                     saleDate <= new Date(state.dateRange!.endDate);
            });
          }
    
          set({
            sales: filteredSales,
            lastFetched: Date.now(),
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sales';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Fetch single sale
      fetchSaleById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });

          const sale = await SaleService.getById(id, true, true);

          if (sale) {
            set({
              currentSale: sale,
              isLoading: false,
            });
          } else {
            throw new Error('Sale not found');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sale';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Create sale with offline support
      createSale: async (saleData: CreateSaleData) => {
        const isOnline = await SyncService.checkOnlineStatus();
    
        try {
          set({ isCreating: true, error: null });
    
          if (isOnline) {
            const newSale = await SaleService.create(saleData);
    
            // Add to local state
            const state = get();
            set({
              sales: [newSale, ...state.sales],
              isCreating: false,
              // Invalidate cache and summary
              lastFetched: null,
              summary: null,
            });
    
            return newSale;
          } else {
            // Queue operation for offline (high priority for sales)
            await SyncService.queueOperation('sales', 'create', {
              ...saleData,
              priority: 'high', // Sales are high priority
            });
    
            // Create optimistic local sale
            const tempSaleId = `temp_${Date.now()}`;
            const optimisticSale: SaleWithItems = {
              id: tempSaleId,
              seller_id: saleData.seller_id || null,
              total_amount: saleData.total_amount,
              status: 'pending',
              payment_method: saleData.payment_method || null,
              notes: saleData.notes || null,
              created_at: new Date().toISOString(),
              sale_items: saleData.items.map(item => ({
                id: `temp_item_${Date.now()}_${Math.random()}`,
                sale_id: tempSaleId,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.quantity * item.unit_price,
                products: undefined, // Will be populated when synced
              })),
              sellers: undefined, // Will be populated when synced
            };
    
            // Add to local state optimistically
            const state = get();
            set({
              sales: [optimisticSale, ...state.sales],
              isCreating: false,
            });
    
            return optimisticSale;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create sale';
          set({
            error: errorMessage,
            isCreating: false,
          });
          throw error;
        }
      },

      // Update sale
      updateSale: async (id: string, updates: SaleUpdate) => {
        try {
          set({ isUpdating: true, error: null });

          const updatedSale = await SaleService.update(id, updates);

          // Update in local state
          const state = get();
          set({
            sales: state.sales.map(s =>
              s.id === id ? { ...s, ...updatedSale } : s
            ),
            currentSale: state.currentSale?.id === id
              ? { ...state.currentSale, ...updatedSale }
              : state.currentSale,
            isUpdating: false,
            // Invalidate cache
            lastFetched: null,
          });

          return updatedSale;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update sale';
          set({
            error: errorMessage,
            isUpdating: false,
          });
          throw error;
        }
      },

      // Delete sale
      deleteSale: async (id: string) => {
        try {
          set({ isDeleting: true, error: null });

          await SaleService.delete(id);

          // Remove from local state
          const state = get();
          set({
            sales: state.sales.filter(s => s.id !== id),
            currentSale: state.currentSale?.id === id ? null : state.currentSale,
            isDeleting: false,
            // Invalidate cache and summary
            lastFetched: null,
            summary: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete sale';
          set({
            error: errorMessage,
            isDeleting: false,
          });
          throw error;
        }
      },

      // Update sale status
      updateSaleStatus: async (id: string, status: string) => {
        try {
          const updatedSale = await SaleService.updateStatus(id, status);

          // Update in local state
          const state = get();
          set({
            sales: state.sales.map(s =>
              s.id === id ? { ...s, ...updatedSale } : s
            ),
            currentSale: state.currentSale?.id === id
              ? { ...state.currentSale, ...updatedSale }
              : state.currentSale,
            // Invalidate cache
            lastFetched: null,
          });

          return updatedSale;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update sale status';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Filtering
      filterByStatus: async (status: string | null) => {
        set({ statusFilter: status });
        await get().fetchSales({ forceRefresh: true });
      },

      filterBySeller: async (sellerId: string | null) => {
        set({ sellerFilter: sellerId });
        await get().fetchSales({ forceRefresh: true });
      },

      filterByDateRange: async (dateRange: { startDate: string; endDate: string } | null) => {
        set({ dateRange });
        await get().fetchSales({ forceRefresh: true });
      },

      // Fetch summary
      fetchSummary: async (options = {}) => {
        try {
          const summary = await SaleService.getSummary(options);
          set({ summary });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch summary';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Cache management
      clearCache: () => set({
        sales: [],
        lastFetched: null,
        summary: null,
      }),

      isCacheValid: () => {
        const state = get();
        if (!state.lastFetched) return false;
        return Date.now() - state.lastFetched < state.cacheExpiry;
      },

      // UI actions
      setCurrentSale: (sale: SaleWithItems | null) => set({ currentSale: sale }),
      clearError: () => set({ error: null }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'sales-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields
      partialize: (state) => ({
        sales: state.sales.slice(0, 100), // Keep only recent sales
        statusFilter: state.statusFilter,
        sellerFilter: state.sellerFilter,
        dateRange: state.dateRange,
        lastFetched: state.lastFetched,
      }),
    }
  )
);