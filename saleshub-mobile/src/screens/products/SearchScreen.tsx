import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, useTheme, Chip, Text } from 'react-native-paper';
import { useProductsStore } from '../../stores/productsStore';
import { useOffline } from '../../hooks/useOffline';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductSearch } from '../../components/products/ProductSearch';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import { SyncStatus } from '../../components/common/SyncStatus';
import { ApiService } from '../../services/api';
import OfflineStorage from '../../services/offline';
import type { ProductWithCategory } from '../../services/products';
import type { Database } from '../../lib/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

export default function SearchScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { isOnline } = useOffline();

  const {
    products: searchResults,
    isLoading,
    error,
    searchProducts,
    filterByCategory,
    clearError,
  } = useProductsStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState<string[]>([
    'laptop',
    'phone',
    'headphones',
    'tablet',
  ]);

  // Load categories with offline support
  const loadCategories = useCallback(async () => {
    try {
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
    }
  }, [isOnline]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        await searchProducts(query);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  }, [searchProducts]);

  // Handle category filter
  const handleCategoryFilter = useCallback(async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    try {
      await filterByCategory(categoryId);
    } catch (error) {
      console.error('Filter failed:', error);
    }
  }, [filterByCategory]);

  // Handle product press
  const handleProductPress = useCallback((product: ProductWithCategory) => {
    (navigation as any).navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  // Handle recent search press
  const handleRecentSearchPress = useCallback((query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  }, [handleSearch]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
  }, []);

  // Render product item
  const renderProduct = useCallback(({ item }: { item: ProductWithCategory }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <ProductCard
        product={item}
        onPress={handleProductPress}
        compact={true}
      />
    </TouchableOpacity>
  ), [handleProductPress]);

  // Render recent searches
  const renderRecentSearches = useCallback(() => {
    if (searchQuery || selectedCategory || searchResults.length > 0) return null;

    return (
      <View style={styles.section}>
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          Recent Searches
        </Text>
        <View style={styles.recentSearches}>
          {recentSearches.map((search) => (
            <Chip
              key={search}
              mode="outlined"
              onPress={() => handleRecentSearchPress(search)}
              style={styles.recentSearchChip}
              textStyle={{ color: theme.colors.onSurfaceVariant }}
            >
              {search}
            </Chip>
          ))}
        </View>
      </View>
    );
  }, [searchQuery, selectedCategory, searchResults.length, recentSearches, theme.colors, handleRecentSearchPress]);

  // Render categories
  const renderCategories = useCallback(() => {
    if (categories.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          Browse by Category
        </Text>
        <View style={styles.categories}>
          <TouchableOpacity
            onPress={() => handleCategoryFilter(null)}
            style={styles.categoryTouchable}
          >
            <Chip
              mode={selectedCategory === null ? 'flat' : 'outlined'}
              style={[
                styles.categoryChip,
                selectedCategory === null && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              textStyle={{
                color: selectedCategory === null
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
              }}
            >
              All
            </Chip>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryFilter(category.id)}
              style={styles.categoryTouchable}
            >
              <Chip
                mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && {
                    backgroundColor: theme.colors.primaryContainer,
                  },
                ]}
                textStyle={{
                  color: selectedCategory === category.id
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceVariant,
                }}
              >
                {category.name}
              </Chip>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [categories, selectedCategory, theme.colors, handleCategoryFilter]);

  // Render search results
  const renderSearchResults = useCallback(() => {
    if (!searchQuery && !selectedCategory) return null;

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
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
      );
    }

    if (searchResults.length === 0) {
      return (
        <EmptyState
          icon="magnify"
          title="No results found"
          message={`No products match "${searchQuery}"${selectedCategory ? ` in selected category` : ''}`}
          actionLabel="Clear search"
          onActionPress={handleClearSearch}
        />
      );
    }

    return (
      <View style={styles.resultsSection}>
        <Text
          variant="titleMedium"
          style={[styles.resultsTitle, { color: theme.colors.onSurface }]}
        >
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
        </Text>
        <FlatList
          data={searchResults}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      </View>
    );
  }, [
    searchQuery,
    selectedCategory,
    isLoading,
    error,
    searchResults,
    theme.colors,
    clearError,
    handleClearSearch,
    renderProduct,
  ]);

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Sync status */}
      <SyncStatus />

      {/* App bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Search Products" />
      </Appbar.Header>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <ProductSearch
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search products, categories..."
          autoFocus={true}
        />
      </View>

      {/* Content */}
      <FlatList
        data={[]} // Empty data for header-only list
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {renderRecentSearches()}
            {renderCategories()}
            {renderSearchResults()}
          </>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  appbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  recentSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTouchable: {
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChip: {
    height: 36,
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  resultsList: {
    paddingBottom: 32,
  },
  productItem: {
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorAction: {
    fontSize: 16,
    fontWeight: '600',
  },
});