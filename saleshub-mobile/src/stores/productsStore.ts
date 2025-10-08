import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductService, ProductWithCategory } from '../services/products';
import SyncService from '../services/sync';
import OfflineStorage from '../services/offline';
import type { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

interface ProductsState {
  // State
  products: ProductWithCategory[];
  currentProduct: ProductWithCategory | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Filters
  searchQuery: string;
  selectedCategory: string | null;

  // Cache
  lastFetched: number | null;
  cacheExpiry: number; // 5 minutes

  // Actions
  fetchProducts: (options?: {
    page?: number;
    search?: string;
    categoryId?: string;
    forceRefresh?: boolean;
  }) => Promise<void>;

  fetchProductById: (id: string) => Promise<void>;
  createProduct: (product: ProductInsert) => Promise<Product>;
  updateProduct: (id: string, updates: ProductUpdate) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  filterByCategory: (categoryId: string | null) => Promise<void>;

  // Cache management
  clearCache: () => void;
  isCacheValid: () => boolean;

  // UI actions
  setCurrentProduct: (product: ProductWithCategory | null) => void;
  clearError: () => void;
  setError: (error: string | null) => void;
}

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      currentProduct: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      hasMore: false,
      searchQuery: '',
      selectedCategory: null,
      lastFetched: null,
      cacheExpiry: CACHE_EXPIRY,

      // Fetch products with offline support
      fetchProducts: async (options = {}) => {
        const {
          page = 1,
          search,
          categoryId,
          forceRefresh = false
        } = options;
    
        const state = get();
        const isOnline = await SyncService.checkOnlineStatus();
    
        // Check cache validity or if we should use cached data
        if (!forceRefresh && state.isCacheValid() && page === 1) {
          return;
        }
    
        // If offline and we have cached data, use it
        if (!isOnline && !forceRefresh) {
          try {
            const cachedProducts = await OfflineStorage.getCachedProducts();
            if (cachedProducts && cachedProducts.data.length > 0) {
              // Filter cached data based on search and category
              let filteredData = cachedProducts.data;
    
              const searchTerm = search || state.searchQuery;
              if (searchTerm) {
                filteredData = filteredData.filter(product =>
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.description?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
    
              const categoryFilter = categoryId ?? state.selectedCategory;
              if (categoryFilter) {
                filteredData = filteredData.filter(product =>
                  product.category_id === categoryFilter
                );
              }
    
              set({
                products: page === 1 ? filteredData : [...state.products, ...filteredData],
                currentPage: page,
                totalPages: Math.ceil(filteredData.length / 20),
                hasMore: page * 20 < filteredData.length,
                isLoading: false,
                // Don't update lastFetched for cached data
              });
              return;
            }
          } catch (cacheError) {
            console.warn('Failed to load cached products:', cacheError);
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
    
          const result = await ProductService.getPaginated(page, 20, {
            search: search || state.searchQuery,
            categoryId: categoryId ?? state.selectedCategory ?? undefined,
            includeCategory: true,
          });
    
          // Cache the products for offline use
          if (page === 1) {
            await OfflineStorage.cacheProducts(result.data);
          }
    
          set({
            products: page === 1 ? result.data : [...state.products, ...result.data],
            currentPage: page,
            totalPages: result.totalPages,
            hasMore: page < result.totalPages,
            lastFetched: Date.now(),
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Fetch single product
      fetchProductById: async (id: string) => {
        try {
          set({ isLoading: true, error: null });

          const product = await ProductService.getById(id, true);

          if (product) {
            set({
              currentProduct: product,
              isLoading: false,
            });
          } else {
            throw new Error('Product not found');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Create product with offline support
      createProduct: async (product: ProductInsert) => {
        const isOnline = await SyncService.checkOnlineStatus();
    
        try {
          set({ isCreating: true, error: null });
    
          if (isOnline) {
            const newProduct = await ProductService.create(product);
    
            // Add to local state
            const state = get();
            set({
              products: [newProduct as ProductWithCategory, ...state.products],
              isCreating: false,
              // Invalidate cache
              lastFetched: null,
            });
    
            return newProduct;
          } else {
            // Queue operation for offline
            await SyncService.queueOperation('products', 'create', product);
    
            // Create optimistic local product
            const optimisticProduct = {
              ...product,
              id: `temp_${Date.now()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              category: null, // Will be populated when synced
            } as ProductWithCategory;
    
            // Add to local state optimistically
            const state = get();
            set({
              products: [optimisticProduct, ...state.products],
              isCreating: false,
            });
    
            return optimisticProduct as any;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
          set({
            error: errorMessage,
            isCreating: false,
          });
          throw error;
        }
      },

      // Update product with offline support
      updateProduct: async (id: string, updates: ProductUpdate) => {
        const isOnline = await SyncService.checkOnlineStatus();
    
        try {
          set({ isUpdating: true, error: null });
    
          if (isOnline) {
            const updatedProduct = await ProductService.update(id, updates);
    
            // Update in local state
            const state = get();
            set({
              products: state.products.map(p =>
                p.id === id ? { ...p, ...updatedProduct } : p
              ),
              currentProduct: state.currentProduct?.id === id
                ? { ...state.currentProduct, ...updatedProduct }
                : state.currentProduct,
              isUpdating: false,
              // Invalidate cache
              lastFetched: null,
            });
    
            return updatedProduct;
          } else {
            // Queue operation for offline
            await SyncService.queueOperation('products', 'update', { id, ...updates });
    
            // Update optimistically in local state
            const state = get();
            set({
              products: state.products.map(p =>
                p.id === id ? { ...p, ...updates } : p
              ),
              currentProduct: state.currentProduct?.id === id
                ? { ...state.currentProduct, ...updates }
                : state.currentProduct,
              isUpdating: false,
            });
    
            return { id, ...updates } as any;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
          set({
            error: errorMessage,
            isUpdating: false,
          });
          throw error;
        }
      },

      // Delete product with offline support
      deleteProduct: async (id: string) => {
        const isOnline = await SyncService.checkOnlineStatus();
    
        try {
          set({ isDeleting: true, error: null });
    
          if (isOnline) {
            await ProductService.delete(id);
    
            // Remove from local state
            const state = get();
            set({
              products: state.products.filter(p => p.id !== id),
              currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
              isDeleting: false,
              // Invalidate cache
              lastFetched: null,
            });
          } else {
            // Queue operation for offline
            await SyncService.queueOperation('products', 'delete', { id });
    
            // Remove optimistically from local state
            const state = get();
            set({
              products: state.products.filter(p => p.id !== id),
              currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
              isDeleting: false,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
          set({
            error: errorMessage,
            isDeleting: false,
          });
          throw error;
        }
      },

      // Search products
      searchProducts: async (query: string) => {
        set({ searchQuery: query });
        await get().fetchProducts({ search: query, forceRefresh: true });
      },

      // Filter by category
      filterByCategory: async (categoryId: string | null) => {
        set({ selectedCategory: categoryId });
        await get().fetchProducts({ categoryId: categoryId ?? undefined, forceRefresh: true });
      },

      // Cache management
      clearCache: () => set({
        products: [],
        lastFetched: null,
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
      }),

      isCacheValid: () => {
        const state = get();
        if (!state.lastFetched) return false;
        return Date.now() - state.lastFetched < state.cacheExpiry;
      },

      // UI actions
      setCurrentProduct: (product: ProductWithCategory | null) => set({ currentProduct: product }),
      clearError: () => set({ error: null }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'products-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields
      partialize: (state) => ({
        products: state.products.slice(0, 50), // Keep only recent products
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        lastFetched: state.lastFetched,
      }),
    }
  )
);