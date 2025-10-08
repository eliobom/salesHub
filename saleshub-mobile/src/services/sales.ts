import { ApiService } from './api';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Sale = Database['public']['Tables']['sales']['Row'];
type SaleInsert = Database['public']['Tables']['sales']['Insert'];
type SaleUpdate = Database['public']['Tables']['sales']['Update'];
type SaleItem = Database['public']['Tables']['sale_items']['Row'];
type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert'];

export interface SaleWithItems extends Sale {
  sale_items: (SaleItem & {
    products?: {
      id: string;
      name: string;
      price: number;
    };
  })[];
  sellers?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateSaleData {
  seller_id?: string;
  total_amount: number;
  status?: string;
  payment_method?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

export class SaleService {
  // Get all sales with optional related data
  static async getAll(options?: {
    includeItems?: boolean;
    includeSeller?: boolean;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }): Promise<SaleWithItems[]> {
    let select = '*';

    if (options?.includeItems) {
      select += ', sale_items(*, products(id, name, price))';
    }

    if (options?.includeSeller) {
      select += ', sellers(id, full_name, email)';
    }

    return await ApiService.getAll('sales', {
      ...options,
      select,
    }) as SaleWithItems[];
  }

  // Get sale by ID with full details
  static async getById(id: string, includeItems = true, includeSeller = true): Promise<SaleWithItems | null> {
    let select = '*';

    if (includeItems) {
      select += ', sale_items(*, products(id, name, price))';
    }

    if (includeSeller) {
      select += ', sellers(id, full_name, email)';
    }

    return await ApiService.getById('sales', id, select) as SaleWithItems | null;
  }

  // Create new sale with items
  static async create(saleData: CreateSaleData): Promise<SaleWithItems> {
    // Start a transaction-like operation
    const { items, ...saleFields } = saleData;

    // Create the sale
    const sale = await ApiService.create('sales', saleFields);

    // Create sale items
    const saleItems: SaleItemInsert[] = items.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    await ApiService.createMany('sale_items', saleItems);

    // Return sale with items
    return await this.getById(sale.id, true, false) as SaleWithItems;
  }

  // Update sale
  static async update(id: string, updates: SaleUpdate): Promise<Sale> {
    return await ApiService.update('sales', id, updates);
  }

  // Delete sale (and cascade delete items)
  static async delete(id: string): Promise<void> {
    // First delete sale items
    const saleItems = await ApiService.getAll('sale_items', {
      filter: { sale_id: id },
    });

    if (saleItems.length > 0) {
      await Promise.all(
        saleItems.map(item => ApiService.delete('sale_items', item.id))
      );
    }

    // Then delete the sale
    return await ApiService.delete('sales', id);
  }

  // Get sales by seller
  static async getBySeller(sellerId: string): Promise<Sale[]> {
    return await ApiService.getAll('sales', {
      filter: { seller_id: sellerId },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  // Get sales by status
  static async getByStatus(status: string): Promise<Sale[]> {
    return await ApiService.getAll('sales', {
      filter: { status },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  // Get sales by date range
  static async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    // Note: This would require a more complex query with date filters
    // For now, we'll get all and filter client-side
    const allSales = await ApiService.getAll('sales', {
      orderBy: { column: 'created_at', ascending: false },
    });

    return allSales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
  }

  // Get sales summary
  static async getSummary(options?: {
    sellerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageSale: number;
    salesByStatus: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .rpc('get_sales_summary', {
        seller_id: options?.sellerId || null,
        start_date: options?.startDate || null,
        end_date: options?.endDate || null,
      });

    if (error) throw error;

    const summary = data?.[0];
    if (!summary) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageSale: 0,
        salesByStatus: {},
      };
    }

    return {
      totalSales: Number(summary.total_sales),
      totalRevenue: Number(summary.total_revenue),
      averageSale: Number(summary.average_sale),
      salesByStatus: summary.sales_by_status as Record<string, number>,
    };
  }

  // Update sale status
  static async updateStatus(id: string, status: string): Promise<Sale> {
    return await ApiService.update('sales', id, { status });
  }

  // Get sale items for a sale
  static async getSaleItems(saleId: string): Promise<(SaleItem & { products?: { id: string; name: string; price: number } })[]> {
    return await ApiService.getAll('sale_items', {
      select: '*, products(id, name, price)',
      filter: { sale_id: saleId },
    }) as (SaleItem & { products?: { id: string; name: string; price: number } })[];
  }

  // Add item to sale
  static async addItem(saleId: string, item: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }): Promise<SaleItem> {
    const subtotal = item.quantity * item.unit_price;

    return await ApiService.create('sale_items', {
      sale_id: saleId,
      ...item,
      subtotal,
    });
  }

  // Update sale item
  static async updateItem(itemId: string, updates: {
    quantity?: number;
    unit_price?: number;
  }): Promise<SaleItem> {
    const item = await ApiService.getById('sale_items', itemId);
    if (!item) throw new Error('Sale item not found');

    const quantity = updates.quantity ?? item.quantity;
    const unit_price = updates.unit_price ?? item.unit_price;
    const subtotal = quantity * unit_price;

    return await ApiService.update('sale_items', itemId, {
      ...updates,
      subtotal,
    });
  }

  // Remove item from sale
  static async removeItem(itemId: string): Promise<void> {
    return await ApiService.delete('sale_items', itemId);
  }
}