import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Appbar, useTheme, IconButton, FAB, Text, Button } from 'react-native-paper';
import { useProductsStore } from '../../stores/productsStore';
import { useOffline } from '../../hooks/useOffline';
import { ProductDetail } from '../../components/products/ProductDetail';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import { SyncStatus } from '../../components/common/SyncStatus';
import type { ProductWithCategory } from '../../services/products';

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { isOnline } = useOffline();

  const {
    currentProduct,
    isLoading,
    error,
    fetchProductById,
    clearError,
  } = useProductsStore();

  // Get product ID from route params or current product
  const productId = (route.params as { productId?: string })?.productId || currentProduct?.id;

  useEffect(() => {
    if (productId && (!currentProduct || currentProduct.id !== productId)) {
      fetchProductById(productId);
    }
  }, [productId, currentProduct, fetchProductById]);

  // Handle back navigation
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Handle favorite toggle (placeholder for now)
  const handleToggleFavorite = () => {
    Alert.alert(
      'Favorites',
      'Favorites functionality will be implemented soon!',
      [{ text: 'OK' }]
    );
  };

  // Handle share (placeholder)
  const handleShare = () => {
    Alert.alert(
      'Share',
      'Share functionality will be implemented soon!',
      [{ text: 'OK' }]
    );
  };

  // Handle add to cart/sale (placeholder)
  const handleAddToSale = () => {
    Alert.alert(
      'Add to Sale',
      'Add to sale functionality will be implemented soon!',
      [{ text: 'OK' }]
    );
  };

  if (isLoading && !currentProduct) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <OfflineIndicator />
        <SyncStatus />
        <Appbar.Header>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title="Product Details" />
        </Appbar.Header>
        <View style={styles.errorContent}>
          <IconButton
            icon="alert-circle"
            size={48}
            iconColor={theme.colors.error}
          />
          <Text
            variant="headlineSmall"
            style={[styles.errorTitle, { color: theme.colors.onSurface }]}
          >
            Error Loading Product
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}
          >
            {error}
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              clearError();
              if (productId) {
                fetchProductById(productId);
              }
            }}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </View>
    );
  }

  if (!currentProduct) {
    return (
      <View style={styles.errorContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title="Product Details" />
        </Appbar.Header>
        <View style={styles.errorContent}>
          <IconButton
            icon="package-variant-closed"
            size={48}
            iconColor={theme.colors.onSurfaceVariant}
          />
          <Text
            variant="headlineSmall"
            style={[styles.errorTitle, { color: theme.colors.onSurface }]}
          >
            Product Not Found
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}
          >
            The product you're looking for doesn't exist or has been removed.
          </Text>
          <Button
            mode="contained"
            onPress={handleGoBack}
            style={styles.retryButton}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Sync status */}
      <SyncStatus />

      {/* App bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title="Product Details" />
        <Appbar.Action
          icon="heart-outline"
          onPress={handleToggleFavorite}
          accessibilityLabel="Add to favorites"
        />
        <Appbar.Action
          icon="share"
          onPress={handleShare}
          accessibilityLabel="Share product"
        />
      </Appbar.Header>

      {/* Product detail content */}
      <ProductDetail product={currentProduct} />

      {/* FAB for add to sale */}
      <FAB
        icon="cart-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddToSale}
        accessible={true}
        accessibilityLabel="Add to sale"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  retryButton: {
    marginTop: 8,
  },
  appbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});