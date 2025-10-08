import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Icon, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

interface Seller {
  id: string;
  full_name: string;
  email: string;
  total_sales: number;
}

interface TopSellersProps {
  sellers: Seller[];
  loading?: boolean;
  error?: string | null;
}

export const TopSellers: React.FC<TopSellersProps> = React.memo(({
  sellers,
  loading = false,
  error = null,
}) => {
  const theme = useTheme();

  const renderSeller = useCallback(({ item, index }: { item: Seller; index: number }) => (
    <View style={styles.sellerItem}>
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        style={styles.rankBadge}
      >
        <Text style={styles.rankText}>{index + 1}</Text>
      </LinearGradient>
      <View style={styles.sellerInfo}>
        <Text style={[styles.sellerName, { color: theme.colors.onSurface }]}>
          {item.full_name}
        </Text>
        <Text style={[styles.sellerEmail, { color: theme.colors.onSurfaceVariant }]}>
          {item.email}
        </Text>
      </View>
      <View style={styles.salesInfo}>
        <Text style={[styles.salesAmount, { color: theme.colors.onSurface }]}>
          ${item.total_sales.toLocaleString()}
        </Text>
        <Text style={[styles.salesLabel, { color: theme.colors.onSurfaceVariant }]}>
          en ventas
        </Text>
      </View>
    </View>
  ), [theme.colors.onSurface, theme.colors.onSurfaceVariant]);

  const renderLoading = useCallback(() => (
    <View style={styles.loadingContainer}>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={styles.loadingItem}>
          <View style={styles.loadingBadge} />
          <View style={styles.loadingInfo}>
            <View style={styles.loadingName} />
            <View style={styles.loadingEmail} />
          </View>
          <View style={styles.loadingSales}>
            <View style={styles.loadingAmount} />
            <View style={styles.loadingLabel} />
          </View>
        </View>
      ))}
    </View>
  ), []);

  const renderError = useCallback(() => (
    <View style={styles.errorContainer}>
      <Icon source="alert-circle" size={48} color={theme.colors.error} />
      <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
        Error al cargar vendedores
      </Text>
      {error && (
        <Text style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}>
          {error}
        </Text>
      )}
    </View>
  ), [theme.colors.error, theme.colors.onSurface, theme.colors.onSurfaceVariant, error]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Icon source="account-group" size={48} color={theme.colors.onSurfaceVariant} />
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        No hay vendedores disponibles
      </Text>
    </View>
  ), [theme.colors.onSurfaceVariant]);

  return (
    <Card style={styles.card}>
      <Card.Title title="Top Vendedores" />
      <Card.Content>
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : sellers.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={sellers}
            keyExtractor={(item) => item.id}
            renderItem={renderSeller}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
  list: {
    maxHeight: 300,
  },
  sellerItem: {
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
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sellerEmail: {
    fontSize: 14,
  },
  salesInfo: {
    alignItems: 'flex-end',
  },
  salesAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  salesLabel: {
    fontSize: 12,
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
  loadingEmail: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    width: '70%',
  },
  loadingSales: {
    alignItems: 'flex-end',
  },
  loadingAmount: {
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    width: 60,
    marginBottom: 4,
  },
  loadingLabel: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    width: 50,
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