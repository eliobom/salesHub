import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, Divider, useTheme } from 'react-native-paper';
import type { ProductWithCategory } from '../../services/products';

interface ProductDetailProps {
  product: ProductWithCategory;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const theme = useTheme();

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getStockStatus = () => {
    if (product.stock <= 0) return { text: 'Out of stock', color: theme.colors.error };
    if (product.stock <= 5) return { text: 'Low stock', color: theme.colors.tertiary };
    return { text: 'In stock', color: theme.colors.primary };
  };

  const stockStatus = getStockStatus();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text
              variant="headlineMedium"
              style={[styles.name, { color: theme.colors.onSurface }]}
            >
              {product.name}
            </Text>
            <Text
              variant="headlineLarge"
              style={[styles.price, { color: theme.colors.primary }]}
            >
              {formatPrice(product.price)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Description
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {product.description || 'No description available.'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text
                variant="bodyMedium"
                style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Stock
              </Text>
              <Chip
                mode="flat"
                style={[styles.stockChip, { backgroundColor: stockStatus.color + '20' }]}
                textStyle={{ color: stockStatus.color }}
              >
                {stockStatus.text} ({product.stock})
              </Chip>
            </View>

            {product.categories && (
              <View style={styles.detailItem}>
                <Text
                  variant="bodyMedium"
                  style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}
                >
                  Category
                </Text>
                <Chip
                  mode="flat"
                  style={[styles.categoryChip, { backgroundColor: theme.colors.secondaryContainer }]}
                  textStyle={{ color: theme.colors.onSecondaryContainer }}
                >
                  {product.categories.name}
                </Chip>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text
                variant="bodyMedium"
                style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                SKU
              </Text>
              <Text
                variant="bodyLarge"
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {product.sku || 'N/A'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text
                variant="bodyMedium"
                style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                Status
              </Text>
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  {
                    borderColor: product.is_active ? theme.colors.primary : theme.colors.error,
                  },
                ]}
                textStyle={{
                  color: product.is_active ? theme.colors.primary : theme.colors.error,
                }}
              >
                {product.is_active ? 'Active' : 'Inactive'}
              </Chip>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.metadata}>
            <Text
              variant="bodySmall"
              style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}
            >
              Created: {new Date(product.created_at).toLocaleDateString()}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}
            >
              Updated: {new Date(product.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 8,
  },
  price: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
  },
  detailsGrid: {
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontWeight: '500',
  },
  stockChip: {
    alignSelf: 'flex-start',
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadataText: {
    fontSize: 12,
  },
});