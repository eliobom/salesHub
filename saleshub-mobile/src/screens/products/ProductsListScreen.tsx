import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FAB, Text, useTheme, IconButton } from 'react-native-paper';
import { useProductsStore } from '../../stores/productsStore';
import { useOffline } from '../../hooks/useOffline';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductSearch } from '../../components/products/ProductSearch';
import { CategoryFilter } from '../../components/products/CategoryFilter';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import { SyncStatus } from '../../components/common/SyncStatus';
import { ApiService } from '../../services/api';
import OfflineStorage from '../../services/offline';
import type { ProductWithCategory } from '../../services/products';
import type { Database } from '../../lib/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

export default function ProductsListScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  const {
    products,
    isLoading,
    error,
    currentPage,
    hasMore,
    searchQuery,
    selectedCategory,
    lastFetched,
    fetchProducts,
    searchProducts,
    filterByCategory,
    clearError,
    setCurrentProduct,
  } = useProductsStore();

  const { isOnline, lastSyncText } = useOffline();

  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories with offline support
  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);

      // Try to get cached categories first
      const cachedCategories = await OfflineStorage.getCachedCategories();
      if (cachedCategories && cachedCategories.data.length > 0) {
        setCategories(cachedCategories.data);
      }

      // If online, fetch fresh data
      if (isOnline) {
        try {
          const cats = await ApiService.getAll('categories');
          setCategories(cats);
          // Cache the categories
          await OfflineStorage.cacheCategories(cats);
        } catch (error) {
          console.error('Failed to load fresh categories:', error);
          // Keep cached data if available
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, [isOnline]);

  // Load products
  const loadProducts = useCallback(async (page = 1, refresh = false) => {
    try {
      await fetchProducts({
        page,
        forceRefresh: refresh,
      });
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }, [fetchProducts]);

  // Initial load
  useEffect(() => {
    loadCategories();
    loadProducts(1, true);
  }, [loadCategories, loadProducts]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isOnline) {
        loadProducts(1, true);
      }
    }, [isOnline, loadProducts])
  );

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    try {
      await searchProducts(query);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [searchProducts]);

  // Handle category filter
  const handleCategoryFilter = useCallback(async (categoryId: string | undefined) => {
    try {
      await filterByCategory(categoryId || null);
    } catch (error) {
      console.error('Filter failed:', error);
    }
  }, [filterByCategory]);

  // Handle product press
  const handleProductPress = useCallback((product: ProductWithCategory) => {
    setCurrentProduct(product);
    navigation.navigate('ProductDetail' as never);
  }, [setCurrentProduct, navigation]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts(1, true);
    setRefreshing(false);
  }, [loadProducts]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && isOnline) {
      loadProducts(currentPage + 1);
    }
  }, [isLoading, hasMore, isOnline, currentPage, loadProducts]);

  // Handle search navigation
  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search' as never);
  }, [navigation]);

  // Render product item
  const renderProduct = useCallback(({ item }: { item: ProductWithCategory }) => (
    <TouchableOpacity
      style={viewMode === 'grid' ? styles.gridItem : styles.listItem}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <ProductCard
        product={item}
        onPress={handleProductPress}
        compact={viewMode === 'list'}
      />
    </TouchableOpacity>
  ), [viewMode, handleProductPress]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <EmptyState
        icon="package-variant-closed"
        title="No products found"
        message={
          searchQuery || selectedCategory
            ? "Try adjusting your search or filters"
            : "No products are available at the moment"
        }
        actionLabel={searchQuery || selectedCategory ? "Clear filters" : undefined}
        onActionPress={() => {
          if (searchQuery) {
            handleSearch('');
          }
          if (selectedCategory) {
            handleCategoryFilter(undefined);
          }
        }}
      />
    );
  }, [isLoading, searchQuery, selectedCategory, handleSearch, handleCategoryFilter]);

  // Render footer for loading more
  const renderFooter = useCallback(() => {
    if (!isLoading || !hasMore) return null;

    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          Loading more products...
        </Text>
      </View>
    );
  }, [isLoading, hasMore, theme.colors.onSurfaceVariant]);

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Sync status */}
      <SyncStatus />

      {/* Header with search and view toggle */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <ProductSearch
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search products..."
          />
          <IconButton
            icon="magnify"
            size={20}
            onPress={handleSearchPress}
            style={styles.searchIcon}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.headerActions}>
          <IconButton
            icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            size={20}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>

      {/* Data freshness indicator */}
      {lastFetched && (
        <View style={styles.freshnessContainer}>
          <Text
            variant="bodySmall"
            style={[
              styles.freshnessText,
              { color: theme.colors.onSurfaceVariant }
            ]}
          >
            Last updated: {new Date(lastFetched).toLocaleString()}
            {!isOnline && ' (Offline)'}
          </Text>
        </View>
      )}

      {/* Category filter */}
      {!loadingCategories && categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategory || undefined}
          onCategorySelect={handleCategoryFilter}
        />
      )}

      {/* Products list */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={
          products.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Products list"
      />

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={[styles.errorAction, { color: theme.colors.primary }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FAB for search */}
      <FAB
        icon="magnify"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleSearchPress}
        accessible={true}
        accessibilityLabel="Advanced search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContainer: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
    padding: 4,
  },
  listItem: {
    width: '100%',
    padding: 4,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  errorAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  freshnessContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  freshnessText: {
    fontSize: 12,
    textAlign: 'center',
  },
});