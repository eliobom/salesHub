import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Chip, Button, useTheme, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSalesStore } from '../../stores/salesStore';
import { SaleItem } from '../../components/sales/SaleItem';
import { SaleSummary } from '../../components/sales/SaleSummary';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import type { SaleWithItems } from '../../services/sales';

export default function SaleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  const { currentSale, isLoading, fetchSaleById, updateSaleStatus } = useSalesStore();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const saleId = (route.params as any)?.saleId;

  useEffect(() => {
    if (saleId) {
      fetchSaleById(saleId);
    }
  }, [saleId, fetchSaleById]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!currentSale) return;

    try {
      setIsUpdatingStatus(true);
      await updateSaleStatus(currentSale.id, newStatus);
      Alert.alert('Success', `Sale status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update sale status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canUpdateStatus = (currentStatus: string, newStatus: string) => {
    // Define valid status transitions
    const transitions: Record<string, string[]> = {
      pending: ['completed', 'cancelled'],
      completed: ['cancelled'],
      cancelled: ['pending'],
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  if (!currentSale) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="receipt"
          title="Sale Not Found"
          message="The requested sale could not be found or may have been deleted."
          actionLabel="Back to Sales"
          onActionPress={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <OfflineIndicator />

      <ScrollView style={styles.container}>
        {/* Sale Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Text
                variant="headlineMedium"
                style={[styles.saleAmount, { color: theme.colors.primary }]}
              >
                {formatCurrency(currentSale.total_amount)}
              </Text>
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(currentSale.status) + '20' },
                ]}
                textStyle={{ color: getStatusColor(currentSale.status) }}
              >
                {currentSale.status}
              </Chip>
            </View>

            <Text
              variant="bodyLarge"
              style={[styles.saleId, { color: theme.colors.onSurfaceVariant }]}
            >
              Sale ID: {currentSale.id}
            </Text>

            <Text
              variant="bodyMedium"
              style={[styles.saleDate, { color: theme.colors.onSurfaceVariant }]}
            >
              {formatDate(currentSale.created_at)}
            </Text>
          </Card.Content>
        </Card>

        {/* Sale Details */}
        <Card style={styles.detailsCard}>
          <Card.Title title="Sale Details" />
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Seller:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {currentSale.sellers?.full_name || 'Unknown'}
              </Text>
            </View>

            {currentSale.payment_method && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Payment Method:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {currentSale.payment_method}
                </Text>
              </View>
            )}

            {currentSale.notes && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Notes:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {currentSale.notes}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Items */}
        <Card style={styles.itemsCard}>
          <Card.Title title="Items" />
          <Card.Content>
            {currentSale.sale_items?.map((item) => (
              <SaleItem
                key={item.id}
                item={item}
                showProductName={true}
              />
            )) || (
              <Text style={[styles.noItems, { color: theme.colors.onSurfaceVariant }]}>
                No items found
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Summary */}
        <SaleSummary
          items={currentSale.sale_items?.filter(item => item.product_id).map(item => ({
            id: item.id,
            product_id: item.product_id!,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
            products: item.products,
          })) || []}
        />

        {/* Status Update Actions */}
        <Card style={styles.actionsCard}>
          <Card.Title title="Actions" />
          <Card.Content>
            <Text style={[styles.actionsDescription, { color: theme.colors.onSurfaceVariant }]}>
              Update sale status:
            </Text>

            <View style={styles.statusButtons}>
              {canUpdateStatus(currentSale.status, 'completed') && (
                <Button
                  mode="contained"
                  onPress={() => handleStatusUpdate('completed')}
                  loading={isUpdatingStatus}
                  disabled={isUpdatingStatus}
                  style={styles.statusButton}
                >
                  Mark as Completed
                </Button>
              )}

              {canUpdateStatus(currentSale.status, 'cancelled') && (
                <Button
                  mode="contained"
                  onPress={() => handleStatusUpdate('cancelled')}
                  loading={isUpdatingStatus}
                  disabled={isUpdatingStatus}
                  style={[styles.statusButton, { backgroundColor: theme.colors.error }]}
                  buttonColor={theme.colors.error}
                >
                  Cancel Sale
                </Button>
              )}

              {canUpdateStatus(currentSale.status, 'pending') && (
                <Button
                  mode="outlined"
                  onPress={() => handleStatusUpdate('pending')}
                  loading={isUpdatingStatus}
                  disabled={isUpdatingStatus}
                  style={styles.statusButton}
                >
                  Mark as Pending
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saleAmount: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 32,
  },
  saleId: {
    fontSize: 14,
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 14,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
  },
  itemsCard: {
    marginBottom: 16,
  },
  noItems: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionsDescription: {
    marginBottom: 16,
    fontSize: 14,
  },
  statusButtons: {
    gap: 8,
  },
  statusButton: {
    width: '100%',
  },
});