import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import type { SaleWithItems } from '../../services/sales';

interface SaleCardProps {
  sale: SaleWithItems;
  onPress?: (sale: SaleWithItems) => void;
  compact?: boolean;
}

export const SaleCard: React.FC<SaleCardProps> = React.memo(({
  sale,
  onPress,
  compact = false,
}) => {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(sale);
  }, [onPress, sale]);

  const formatCurrency = useCallback((amount: number) => {
    return `$${amount.toFixed(2)}`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const getStatusColor = useCallback((status: string) => {
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
  }, [theme.colors.primary, theme.colors.tertiary, theme.colors.error, theme.colors.outline]);

  const itemCount = useMemo(() => {
    return sale.sale_items?.length || 0;
  }, [sale.sale_items]);

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.compactContainer, { backgroundColor: theme.colors.surface }]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Sale ${sale.id}, ${formatCurrency(sale.total_amount)}, ${sale.status}`}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactInfo}>
            <Text
              variant="bodyLarge"
              style={[styles.compactAmount, { color: theme.colors.primary }]}
            >
              {formatCurrency(sale.total_amount)}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.compactDate, { color: theme.colors.onSurfaceVariant }]}
            >
              {formatDate(sale.created_at)}
            </Text>
          </View>
          <View style={styles.compactRight}>
            <Chip
              mode="flat"
              style={[
                styles.compactStatusChip,
                { backgroundColor: getStatusColor(sale.status) + '20' },
              ]}
              textStyle={{ color: getStatusColor(sale.status) }}
            >
              {sale.status}
            </Chip>
            <Text
              variant="bodySmall"
              style={[styles.compactItems, { color: theme.colors.onSurfaceVariant }]}
            >
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Card
      style={styles.card}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Sale ${sale.id}, ${formatCurrency(sale.total_amount)}, ${sale.status}`}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text
            variant="titleMedium"
            style={[styles.amount, { color: theme.colors.primary }]}
          >
            {formatCurrency(sale.total_amount)}
          </Text>
          <Chip
            mode="flat"
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(sale.status) + '20' },
            ]}
            textStyle={{ color: getStatusColor(sale.status) }}
          >
            {sale.status}
          </Chip>
        </View>

        <View style={styles.details}>
          <Text
            variant="bodyMedium"
            style={[styles.date, { color: theme.colors.onSurfaceVariant }]}
          >
            {formatDate(sale.created_at)}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.items, { color: theme.colors.onSurfaceVariant }]}
          >
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {sale.sellers && (
          <Text
            variant="bodySmall"
            style={[styles.seller, { color: theme.colors.onSurfaceVariant }]}
          >
            Seller: {sale.sellers.full_name}
          </Text>
        )}

        {sale.payment_method && (
          <Text
            variant="bodySmall"
            style={[styles.payment, { color: theme.colors.onSurfaceVariant }]}
          >
            Payment: {sale.payment_method}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {},
  items: {},
  seller: {
    marginBottom: 4,
  },
  payment: {},
  compactContainer: {
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactInfo: {
    flex: 1,
  },
  compactAmount: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  compactDate: {},
  compactRight: {
    alignItems: 'flex-end',
  },
  compactStatusChip: {
    height: 24,
    marginBottom: 4,
  },
  compactItems: {},
});