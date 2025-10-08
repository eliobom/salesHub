import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import type { Database } from '../../lib/supabase';

type SaleItem = Database['public']['Tables']['sale_items']['Row'];

interface SaleItemProps {
  item: SaleItem & { products?: { id: string; name: string; price: number } };
  showProductName?: boolean;
}

export const SaleItem: React.FC<SaleItemProps> = ({
  item,
  showProductName = true,
}) => {
  const theme = useTheme();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          {showProductName && item.products && (
            <Text
              variant="bodyLarge"
              style={[styles.productName, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {item.products.name}
            </Text>
          )}
          <Text
            variant="bodyLarge"
            style={[styles.subtotal, { color: theme.colors.primary }]}
          >
            {formatCurrency(item.subtotal)}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Quantity:
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.value, { color: theme.colors.onSurface }]}
            >
              {item.quantity}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              Unit Price:
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.value, { color: theme.colors.onSurface }]}
            >
              {formatCurrency(item.unit_price)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    marginRight: 16,
    fontWeight: '500',
  },
  subtotal: {
    fontWeight: 'bold',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {},
  value: {
    fontWeight: '500',
  },
});