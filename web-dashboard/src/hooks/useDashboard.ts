import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  totalSellers: number;
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

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface TopSeller {
  id: string;
  full_name: string;
  email: string;
  total_sales: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const [salesRes, productsRes, sellersRes] = await Promise.all([
    supabase.from('sales').select('total_amount'),
    supabase.from('products').select('id'),
    supabase.from('sellers').select('id'),
  ]);

  const totalRevenue = salesRes.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  const totalSales = salesRes.data?.length || 0;
  const totalProducts = productsRes.data?.length || 0;
  const totalSellers = sellersRes.data?.length || 0;

  return {
    totalRevenue,
    totalSales,
    totalProducts,
    totalSellers,
  };
};

const fetchMonthlySales = async (): Promise<MonthlySalesData[]> => {
  const { data: sales } = await supabase
    .from('sales')
    .select('total_amount, created_at')
    .order('created_at', { ascending: false });

  if (!sales) return [];

  // Group by month
  const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};

  sales.forEach((sale) => {
    const date = new Date(sale.created_at);
    const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { sales: 0, revenue: 0 };
    }

    monthlyData[monthKey].sales += 1;
    monthlyData[monthKey].revenue += Number(sale.total_amount);
  });

  // Convert to array and sort by date
  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const dateA = new Date(a.month + ' 1, 2024');
      const dateB = new Date(b.month + ' 1, 2024');
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-6); // Last 6 months
};

const fetchCategorySales = async (): Promise<CategorySalesData[]> => {
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select(`
      quantity,
      products!inner (
        categories!inner (
          name
        )
      )
    `);

  if (!saleItems) return [];

  // Group by category
  const categoryData: { [key: string]: number } = {};

  saleItems.forEach((item: any) => {
    const categoryName = item.products?.categories?.name;
    if (categoryName) {
      categoryData[categoryName] = (categoryData[categoryName] || 0) + item.quantity;
    }
  });

  return Object.entries(categoryData).map(([category, sales]) => ({
    category,
    sales,
  }));
};

const fetchTopProducts = async (): Promise<TopProduct[]> => {
  const { data } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
};

const fetchTopSellers = async (): Promise<TopSeller[]> => {
  const { data: sellersData } = await supabase
    .from('sellers')
    .select('id, full_name, email')
    .eq('is_active', true)
    .limit(5);

  if (!sellersData) return [];

  const sellersWithSales = await Promise.all(
    sellersData.map(async (seller) => {
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('seller_id', seller.id);

      const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      return { ...seller, total_sales: totalSales };
    })
  );

  return sellersWithSales.sort((a, b) => b.total_sales - a.total_sales);
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
}

export function useMonthlySales() {
  return useQuery({
    queryKey: ['monthly-sales'],
    queryFn: fetchMonthlySales,
  });
}

export function useCategorySales() {
  return useQuery({
    queryKey: ['category-sales'],
    queryFn: fetchCategorySales,
  });
}

export function useTopProducts() {
  return useQuery({
    queryKey: ['top-products'],
    queryFn: fetchTopProducts,
  });
}

export function useTopSellers() {
  return useQuery({
    queryKey: ['top-sellers'],
    queryFn: fetchTopSellers,
  });
}