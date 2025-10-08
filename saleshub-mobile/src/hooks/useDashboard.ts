import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  totalSellers: number;
  revenueChange: number;
  salesChange: number;
  productsChange: number;
  sellersChange: number;
}

export interface MonthlySalesData {
  month: string;
  sales: number;
  revenue: number;
}

export interface CategorySalesData {
  category: string;
  sales: number;
}

export interface TopSeller {
  id: string;
  full_name: string;
  email: string;
  total_sales: number;
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Fetch current period data
  const [currentSalesRes, currentProductsRes, currentSellersRes] = await Promise.all([
    supabase
      .from('sales')
      .select('total_amount')
      .gte('created_at', currentMonth.toISOString()),
    supabase.from('products').select('id'),
    supabase.from('sellers').select('id'),
  ]);

  // Fetch previous period data
  const [previousSalesRes] = await Promise.all([
    supabase
      .from('sales')
      .select('total_amount')
      .gte('created_at', previousMonth.toISOString())
      .lt('created_at', currentMonth.toISOString()),
  ]);

  const currentRevenue = currentSalesRes.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  const currentSales = currentSalesRes.data?.length || 0;
  const totalProducts = currentProductsRes.data?.length || 0;
  const totalSellers = currentSellersRes.data?.length || 0;

  const previousRevenue = previousSalesRes.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  const previousSales = previousSalesRes.data?.length || 0;

  const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const salesChange = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;
  const productsChange = 0; // No historical data for products/sellers in this simple implementation
  const sellersChange = 0;

  return {
    totalRevenue: currentRevenue,
    totalSales: currentSales,
    totalProducts,
    totalSellers,
    revenueChange,
    salesChange,
    productsChange,
    sellersChange,
  };
};

export function useDashboardStats() {
  const { data: stats, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  return { stats, loading, error: error?.message || null, refetch };
}

const fetchMonthlySales = async (): Promise<MonthlySalesData[]> => {
  const { data: salesData, error } = await supabase
    .from('sales')
    .select('total_amount, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Aggregate by month
  const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};

  salesData?.forEach((sale) => {
    const date = new Date(sale.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { sales: 0, revenue: 0 };
    }

    monthlyData[monthKey].sales += 1;
    monthlyData[monthKey].revenue += Number(sale.total_amount);
  });

  const result: MonthlySalesData[] = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([key, value]) => ({
      month: new Date(key + '-01').toLocaleDateString('es-ES', { month: 'short' }),
      sales: value.sales,
      revenue: value.revenue,
    }));

  return result;
};

export function useMonthlySales() {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['monthly-sales'],
    queryFn: fetchMonthlySales,
  });

  return { data: data || [], loading, error: error?.message || null, refetch };
}

const fetchCategorySales = async (): Promise<CategorySalesData[]> => {
  const { data: salesData, error } = await supabase
    .from('sale_items')
    .select(`
      quantity,
      products!inner (
        categories!inner (
          name
        )
      )
    `);

  if (error) throw error;

  const categoryTotals: { [key: string]: number } = {};

  salesData?.forEach((item: any) => {
    const categoryName = item.products?.categories?.name;
    if (categoryName) {
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + item.quantity;
    }
  });

  const result: CategorySalesData[] = Object.entries(categoryTotals)
    .map(([category, sales]) => ({ category, sales }))
    .sort((a, b) => b.sales - a.sales);

  return result;
};

export function useCategorySales() {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['category-sales'],
    queryFn: fetchCategorySales,
  });

  return { data: data || [], loading, error: error?.message || null, refetch };
}

const fetchTopSellers = async (): Promise<TopSeller[]> => {
  // Use optimized server-side aggregation function
  const { data: sellersData, error } = await supabase
    .rpc('get_top_sellers', { limit_count: 5 });

  if (error) throw error;

  const result: TopSeller[] = (sellersData || []).map((seller: any) => ({
    id: seller.id,
    full_name: seller.full_name,
    email: seller.email,
    total_sales: Number(seller.total_sales_amount),
  }));

  return result;
};

export function useTopSellers() {
  const { data: sellers, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['top-sellers'],
    queryFn: fetchTopSellers,
  });

  return { sellers: sellers || [], loading, error: error?.message || null, refetch };
}

const fetchTopProducts = async (): Promise<TopProduct[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data || [];
};

export function useTopProducts() {
  const { data: products, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['top-products'],
    queryFn: fetchTopProducts,
  });

  return { products: products || [], loading, error: error?.message || null, refetch };
}