import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, useTheme, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSalesStore } from '../../stores/salesStore';
import { useOffline } from '../../hooks/useOffline';
import { SaleCard } from '../../components/sales/SaleCard';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import type { SaleWithItems } from '../../services/sales';

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PAYMENT_FILTERS = [
  { label: 'All Payments', value: null },
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'Transfer', value: 'transfer' },
];

export default function SalesHistoryScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  const {
    sales,
    isLoading,
    lastFetched,
    fetchSales,
    filterByStatus,
    filterByDateRange,
    statusFilter,
    dateRange,
    clearCache,
  } = useSalesStore();

  const { isOnline } = useOffline();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSales({ forceRefresh: true });
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = async (status: string | null) => {
    await filterByStatus(status);
    setStatusMenuVisible(false);
  };

  const handlePaymentFilter = (payment: string | null) => {
    setSelectedPaymentFilter(payment);
    setPaymentMenuVisible(false);
  };

  const handleSalePress = (sale: SaleWithItems) => {
    (navigation as any).navigate('SaleDetail', { saleId: sale.id });
  };

  const getFilteredSales = () => {
    let filtered = sales;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.id.toLowerCase().includes(query) ||
        sale.sellers?.full_name.toLowerCase().includes(query) ||
        sale.payment_method?.toLowerCase().includes(query)
      );
    }

    // Payment method filter
    if (selectedPaymentFilter) {
      filtered = filtered.filter(sale => sale.payment_method === selectedPaymentFilter);
    }

    return filtered;
  };

  const filteredSales = getFilteredSales();

  const getStatusFilterLabel = () => {
    const filter = STATUS_FILTERS.find(f => f.value === statusFilter);
    return filter?.label || 'All Status';
  };

  const getPaymentFilterLabel = () => {
    const filter = PAYMENT_FILTERS.find(f => f.value === selectedPaymentFilter);
    return filter?.label || 'All Payments';
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Searchbar
        placeholder="Search sales..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterChips}>
        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Chip
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              style={styles.filterChip}
              icon="filter-variant"
            >
              {getStatusFilterLabel()}
            </Chip>
          }
        >
          {STATUS_FILTERS.map((filter) => (
            <Menu.Item
              key={filter.value || 'all'}
              onPress={() => handleStatusFilter(filter.value)}
              title={filter.label}
            />
          ))}
        </Menu>

        <Menu
          visible={paymentMenuVisible}
          onDismiss={() => setPaymentMenuVisible(false)}
          anchor={
            <Chip
              mode="outlined"
              onPress={() => setPaymentMenuVisible(true)}
              style={styles.filterChip}
              icon="credit-card"
            >
              {getPaymentFilterLabel()}
            </Chip>
          }
        >
          {PAYMENT_FILTERS.map((filter) => (
            <Menu.Item
              key={filter.value || 'all'}
              onPress={() => handlePaymentFilter(filter.value)}
              title={filter.label}
            />
          ))}
        </Menu>

        {(statusFilter || selectedPaymentFilter || searchQuery) && (
          <Chip
            mode="flat"
            onPress={() => {
              setSearchQuery('');
              setSelectedPaymentFilter(null);
              filterByStatus(null);
            }}
            style={[styles.clearChip, { backgroundColor: theme.colors.errorContainer }]}
            icon="close"
          >
            Clear Filters
          </Chip>
        )}
      </View>
    </View>
  );

  const renderSaleItem = ({ item }: { item: SaleWithItems }) => (
    <SaleCard
      sale={item}
      onPress={handleSalePress}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="receipt"
      title="No Sales Found"
      message={
        searchQuery || statusFilter || selectedPaymentFilter
          ? "No sales match your current filters. Try adjusting your search criteria."
          : "You haven't recorded any sales yet. Start by creating your first sale."
      }
      actionLabel={
        searchQuery || statusFilter || selectedPaymentFilter
          ? "Clear Filters"
          : "Create First Sale"
      }
      onActionPress={() => {
        if (searchQuery || statusFilter || selectedPaymentFilter) {
          setSearchQuery('');
          setSelectedPaymentFilter(null);
          filterByStatus(null);
        } else {
          (navigation as any).navigate('RecordSale');
        }
      }}
    />
  );

  if (isLoading && sales.length === 0) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <OfflineIndicator />

      {renderFilters()}

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

      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredSales.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          filteredSales.length > 0 ? (
            <View style={styles.summaryContainer}>
              <Text style={[styles.summaryText, { color: theme.colors.onSurfaceVariant }]}>
                Showing {filteredSales.length} of {sales.length} sales
              </Text>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  searchBar: {
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  clearChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  summaryText: {
    fontSize: 14,
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