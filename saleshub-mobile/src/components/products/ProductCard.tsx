import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import type { ProductWithCategory } from '../../services/products';

interface ProductCardProps {
  product: ProductWithCategory;
  onPress?: (product: ProductWithCategory) => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onPress,
  compact = false,
}) => {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(product);
  }, [onPress, product]);

  const formatPrice = useCallback((price: number) => {
    return `$${price.toFixed(2)}`;
  }, []);

  const stockStatus = useMemo(() => {
    if (product.stock <= 0) return { text: 'Out of stock', color: theme.colors.error };
    if (product.stock <= 5) return { text: 'Low stock', color: theme.colors.tertiary };
    return { text: 'In stock', color: theme.colors.primary };
  }, [product.stock, theme.colors.error, theme.colors.tertiary, theme.colors.primary]);

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.compactContainer, { backgroundColor: theme.colors.surface }]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatPrice(product.price)}, ${stockStatus.text}`}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactInfo}>
            <Text
              variant="bodyLarge"
              style={[styles.compactName, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {product.name}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.compactPrice, { color: theme.colors.primary }]}
            >
              {formatPrice(product.price)}
            </Text>
          </View>
          <Chip
            mode="outlined"
            style={[styles.compactStockChip, { borderColor: stockStatus.color }]}
            textStyle={{ color: stockStatus.color }}
          >
            {product.stock}
          </Chip>
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
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}, ${stockStatus.text}`}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text
            variant="titleMedium"
            style={[styles.name, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <Text
            variant="headlineSmall"
            style={[styles.price, { color: theme.colors.primary }]}
          >
            {formatPrice(product.price)}
          </Text>
        </View>

        {product.description && (
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {product.description}
          </Text>
        )}

        <View style={styles.footer}>
          {product.categories && (
            <Chip
              mode="flat"
              style={[styles.categoryChip, { backgroundColor: theme.colors.secondaryContainer }]}
              textStyle={{ color: theme.colors.onSecondaryContainer }}
            >
              {product.categories.name}
            </Chip>
          )}
          <Chip
            mode="outlined"
            style={[styles.stockChip, { borderColor: stockStatus.color }]}
            textStyle={{ color: stockStatus.color }}
          >
            {stockStatus.text} ({product.stock})
          </Chip>
        </View>
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    marginRight: 16,
  },
  price: {
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    flex: 1,
    marginRight: 8,
  },
  stockChip: {
    height: 32,
  },
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
    marginRight: 12,
  },
  compactName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  compactPrice: {
    fontWeight: 'bold',
  },
  compactStockChip: {
    height: 28,
  },
});