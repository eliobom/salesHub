import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Icon, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface TopProductsProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

export const TopProducts: React.FC<TopProductsProps> = ({
  products,
  loading = false,
  error = null,
}) => {
  const theme = useTheme();

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.productItem}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.rankBadge}
      >
        <Text style={styles.rankText}>{index + 1}</Text>
      </LinearGradient>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.colors.onSurface }]}>
          {item.name}
        </Text>
        <Text style={[styles.productStock, { color: theme.colors.onSurfaceVariant }]}>
          Stock: {item.stock}
        </Text>
      </View>
      <Text style={[styles.productPrice, { color: theme.colors.onSurface }]}>
        ${item.price}
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={styles.loadingItem}>
          <View style={styles.loadingBadge} />
          <View style={styles.loadingInfo}>
            <View style={styles.loadingName} />
            <View style={styles.loadingStock} />
          </View>
          <View style={styles.loadingPrice} />
        </View>
      ))}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon source="alert-circle" size={48} color={theme.colors.error} />
      <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
        Error al cargar productos
      </Text>
      {error && (
        <Text style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}>
          {error}
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon source="package-variant" size={48} color={theme.colors.onSurfaceVariant} />
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        No hay productos disponibles
      </Text>
    </View>
  );

  return (
    <Card style={styles.card}>
      <Card.Title title="Productos Destacados" />
      <Card.Content>
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : products.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
  list: {
    maxHeight: 300,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 14,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 8,
  },
  loadingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  loadingBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginRight: 12,
  },
  loadingInfo: {
    flex: 1,
  },
  loadingName: {
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 6,
  },
  loadingStock: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    width: '60%',
  },
  loadingPrice: {
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    width: 60,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});