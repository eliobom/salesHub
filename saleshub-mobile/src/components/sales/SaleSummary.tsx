import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider, useTheme } from 'react-native-paper';

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products?: {
    id: string;
    name: string;
    price: number;
  };
}

interface SaleSummaryProps {
  items: SaleItem[];
  taxRate?: number;
  discount?: number;
  showBreakdown?: boolean;
}

export const SaleSummary: React.FC<SaleSummaryProps> = ({
  items,
  taxRate = 0,
  discount = 0,
  showBreakdown = true,
}) => {
  const theme = useTheme();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const discountAmount = discount;
  const total = subtotal + taxAmount - discountAmount;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Sale Summary
        </Text>

        {showBreakdown && (
          <>
            <View style={styles.row}>
              <Text
                variant="bodyMedium"
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
              >
                Items ({totalItems}):
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.value, { color: theme.colors.onSurface }]}
              >
                {formatCurrency(subtotal)}
              </Text>
            </View>

            {taxRate > 0 && (
              <View style={styles.row}>
                <Text
                  variant="bodyMedium"
                  style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
                >
                  Tax ({taxRate}%):
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.value, { color: theme.colors.onSurface }]}
                >
                  {formatCurrency(taxAmount)}
                </Text>
              </View>
            )}

            {discount > 0 && (
              <View style={styles.row}>
                <Text
                  variant="bodyMedium"
                  style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
                >
                  Discount:
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.value, { color: theme.colors.error }]}
                >
                  -{formatCurrency(discountAmount)}
                </Text>
              </View>
            )}

            <Divider style={styles.divider} />
          </>
        )}

        <View style={styles.totalRow}>
          <Text
            variant="titleLarge"
            style={[styles.totalLabel, { color: theme.colors.onSurface }]}
          >
            Total:
          </Text>
          <Text
            variant="headlineMedium"
            style={[styles.totalValue, { color: theme.colors.primary }]}
          >
            {formatCurrency(total)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {},
  value: {
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalValue: {
    fontWeight: 'bold',
  },
});