import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useDashboardStats, useMonthlySales, useCategorySales } from '../../hooks/useDashboard';
import { StatCard } from './StatCard';
import { SalesChart } from './SalesChart';
import { CategoryChart } from './CategoryChart';
import { TopProducts } from './TopProducts';
import { TopSellers } from './TopSellers';

export function DashboardView() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: salesData, isLoading: salesLoading } = useMonthlySales();
  const { data: categoryData, isLoading: categoryLoading } = useCategorySales();

  const isLoading = statsLoading || salesLoading || categoryLoading;

  const defaultStats = {
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
    totalSellers: 0,
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={`$${currentStats.totalRevenue.toLocaleString()}`}
          change={12.5}
          icon={<DollarSign className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Ventas Totales"
          value={currentStats.totalSales}
          change={8.2}
          icon={<ShoppingCart className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          title="Productos"
          value={currentStats.totalProducts}
          change={-2.4}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Vendedores"
          value={currentStats.totalSellers}
          change={5.1}
          icon={<Users className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData || []} />
        <CategoryChart data={categoryData || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts />
        <TopSellers />
      </div>
    </div>
  );
}
