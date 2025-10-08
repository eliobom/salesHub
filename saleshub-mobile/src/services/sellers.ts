import { ApiService } from './api';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Seller = Database['public']['Tables']['sellers']['Row'];
type SellerInsert = Database['public']['Tables']['sellers']['Insert'];
type SellerUpdate = Database['public']['Tables']['sellers']['Update'];

export interface SellerWithStats extends Seller {
  sales_count?: number;
  total_sales_amount?: number;
  commission_earned?: number;
}

export class SellerService {
  // Get all sellers
  static async getAll(options?: {
    includeStats?: boolean;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }): Promise<SellerWithStats[]> {
    if (options?.includeStats) {
      // Use optimized query to get all sellers with stats in one go
      const { data, error } = await supabase
        .from('top_sellers_view')
        .select('*')
        .order('total_sales_amount', { ascending: false })
        .limit(options?.limit || 100);

      if (error) throw error;

      return (data || []).map((seller: any) => ({
        id: seller.id,
        full_name: seller.full_name,
        email: seller.email,
        phone: seller.phone,
        is_active: seller.is_active,
        avatar_url: seller.avatar_url,
        commission_rate: seller.commission_rate,
        created_at: seller.created_at,
        sales_count: seller.total_sales_count,
        total_sales_amount: Number(seller.total_sales_amount),
        commission_earned: Number(seller.total_sales_amount) * (seller.commission_rate || 0),
      }));
    }

    return await ApiService.getAll('sellers', options) as SellerWithStats[];
  }

  // Get seller by ID
  static async getById(id: string, includeStats = false): Promise<SellerWithStats | null> {
    const seller = await ApiService.getById('sellers', id);

    if (!seller || !includeStats) {
      return seller as SellerWithStats | null;
    }

    const stats = await this.getStats(id);
    return {
      ...seller,
      ...stats,
    };
  }

  // Create new seller
  static async create(seller: SellerInsert): Promise<Seller> {
    return await ApiService.create('sellers', seller);
  }

  // Update seller
  static async update(id: string, updates: SellerUpdate): Promise<Seller> {
    return await ApiService.update('sellers', id, updates);
  }

  // Delete seller
  static async delete(id: string): Promise<void> {
    return await ApiService.delete('sellers', id);
  }

  // Get active sellers
  static async getActive(): Promise<Seller[]> {
    return await ApiService.getAll('sellers', {
      filter: { is_active: true },
    });
  }

  // Search sellers
  static async search(query: string): Promise<Seller[]> {
    const sellers = await ApiService.getAll('sellers');

    return sellers.filter(seller =>
      seller.full_name.toLowerCase().includes(query.toLowerCase()) ||
      seller.email.toLowerCase().includes(query.toLowerCase()) ||
      (seller.phone && seller.phone.includes(query))
    );
  }

  // Get seller statistics
  static async getStats(sellerId: string): Promise<{
    sales_count: number;
    total_sales_amount: number;
    commission_earned: number;
  }> {
    const { data, error } = await supabase
      .rpc('get_sales_summary', {
        seller_id: sellerId,
      });

    if (error) throw error;

    const summary = data?.[0];
    if (!summary) {
      return {
        sales_count: 0,
        total_sales_amount: 0,
        commission_earned: 0,
      };
    }

    // Get seller details for commission rate
    const seller = await ApiService.getById('sellers', sellerId);
    const commissionRate = seller?.commission_rate || 0;

    return {
      sales_count: Number(summary.total_sales),
      total_sales_amount: Number(summary.total_revenue),
      commission_earned: Number(summary.total_revenue) * (commissionRate / 100),
    };
  }

  // Get top performing sellers
  static async getTopPerformers(limit = 10, period?: {
    startDate: string;
    endDate: string;
  }): Promise<SellerWithStats[]> {
    const { data, error } = await supabase
      .rpc('get_top_sellers', {
        limit_count: limit,
        start_date: period?.startDate || null,
        end_date: period?.endDate || null,
      });

    if (error) throw error;

    return (data || []).map((seller: any) => ({
      id: seller.id,
      full_name: seller.full_name,
      email: seller.email,
      phone: seller.phone,
      is_active: seller.is_active,
      avatar_url: seller.avatar_url,
      commission_rate: seller.commission_rate,
      created_at: seller.created_at,
      sales_count: seller.total_sales_count,
      total_sales_amount: Number(seller.total_sales_amount),
      commission_earned: Number(seller.total_sales_amount) * (seller.commission_rate || 0),
    }));
  }

  // Update seller commission rate
  static async updateCommissionRate(id: string, commissionRate: number): Promise<Seller> {
    return await ApiService.update('sellers', id, { commission_rate: commissionRate });
  }

  // Toggle seller active status
  static async toggleActive(id: string): Promise<Seller> {
    const seller = await ApiService.getById('sellers', id);
    if (!seller) throw new Error('Seller not found');

    return await ApiService.update('sellers', id, {
      is_active: !seller.is_active,
    });
  }

  // Get sellers with low commission rates
  static async getLowCommission(threshold = 5): Promise<Seller[]> {
    const sellers = await ApiService.getAll('sellers', {
      filter: { is_active: true },
    });

    return sellers.filter(seller => seller.commission_rate < threshold);
  }

  // Bulk update sellers
  static async bulkUpdate(updates: Array<{ id: string; data: SellerUpdate }>): Promise<Seller[]> {
    return await ApiService.updateMany('sellers', updates);
  }

  // Get seller performance over time
  static async getPerformanceOverTime(sellerId: string, period: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
  }): Promise<Array<{
    period: string;
    sales_count: number;
    total_amount: number;
    commission: number;
  }>> {
    // Get all sales for the seller in the period
    const sales = await ApiService.getAll('sales', {
      filter: { seller_id: sellerId },
    });

    const seller = await ApiService.getById('sellers', sellerId);
    const commissionRate = seller?.commission_rate || 0;

    // Filter by date
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= new Date(period.startDate) && saleDate <= new Date(period.endDate);
    });

    // Group by period
    const grouped = filteredSales.reduce((acc, sale) => {
      const date = new Date(sale.created_at);
      let key: string;

      switch (period.groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          sales_count: 0,
          total_amount: 0,
          commission: 0,
        };
      }

      acc[key].sales_count += 1;
      acc[key].total_amount += sale.total_amount;
      acc[key].commission += sale.total_amount * (commissionRate / 100);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period));
  }
}