import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import {
  useDashboardStats,
  useMonthlySales,
  useCategorySales,
  useTopSellers,
  useTopProducts,
} from '../hooks/useDashboard';
import { StatCard } from '../components/dashboard/StatCard';
import { TopProducts } from '../components/dashboard/TopProducts';
import { TopSellers } from '../components/dashboard/TopSellers';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { SyncStatus } from '../components/common/SyncStatus';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function HomeScreen() {
  const { user, userName } = useAuth();
  const theme = useTheme();

  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { data: salesData, loading: salesLoading, error: salesError } = useMonthlySales();
  const { data: categoryData, loading: categoryLoading, error: categoryError } = useCategorySales();
  const { sellers, loading: sellersLoading, error: sellersError } = useTopSellers();
  const { products, loading: productsLoading, error: productsError } = useTopProducts();

  const [SalesChart, setSalesChart] = useState<any>(null);
  const [CategoryChart, setCategoryChart] = useState<any>(null);

  useEffect(() => {
    const loadCharts = async () => {
      const [SalesChartModule, CategoryChartModule] = await Promise.all([
        import('../components/dashboard/SalesChart'),
        import('../components/dashboard/CategoryChart'),
      ]);
      setSalesChart(() => SalesChartModule.SalesChart);
      setCategoryChart(() => CategoryChartModule.CategoryChart);
    };
    loadCharts();
  }, []);

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Sync status */}
      <SyncStatus />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Dashboard
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Resumen general de tu negocio
          </Text>
          {user && (
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
                Hola, {userName}!
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>
                {user.email}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Ingresos Totales"
            value={stats ? `$${stats.totalRevenue.toLocaleString()}` : '0'}
            change={stats?.revenueChange}
            icon="cash"
            gradient={['#6366f1', '#6366f1']}
          />
          <StatCard
            title="Ventas Totales"
            value={stats?.totalSales || 0}
            change={stats?.salesChange}
            icon="shopping"
            gradient={['#8b5cf6', '#8b5cf6']}
          />
          <StatCard
            title="Productos"
            value={stats?.totalProducts || 0}
            change={stats?.productsChange}
            icon="trending-up"
            gradient={['#3b82f6', '#3b82f6']}
          />
          <StatCard
            title="Vendedores"
            value={stats?.totalSellers || 0}
            change={stats?.sellersChange}
            icon="account-group"
            gradient={['#a855f7', '#a855f7']}
          />
        </View>

        <View style={styles.chartsContainer}>
          {SalesChart ? <SalesChart data={salesData} /> : <LoadingSpinner />}
          {CategoryChart ? <CategoryChart data={categoryData} /> : <LoadingSpinner />}
        </View>

        <View style={styles.listsContainer}>
          <TopProducts
            products={products}
            loading={productsLoading}
            error={productsError}
          />
          <TopSellers
            sellers={sellers}
            loading={sellersLoading}
            error={sellersError}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  userInfo: {
    marginTop: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartsContainer: {
    marginBottom: 24,
  },
  listsContainer: {
    marginBottom: 24,
  },
});