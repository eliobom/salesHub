import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Sale {
  id: string;
  seller_id: string | null;
  total_amount: number;
  status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  sellers?: { full_name: string };
  sale_items?: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products?: { name: string };
  }[];
}

export interface SaleWithItems extends Sale {
  sale_items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products?: { name: string };
  }[];
}

const fetchSales = async (): Promise<Sale[]> => {
  const { data } = await supabase
    .from('sales')
    .select('*, sellers(full_name)')
    .order('created_at', { ascending: false });

  return data || [];
};

const fetchSaleDetails = async (id: string): Promise<SaleWithItems | null> => {
  const { data } = await supabase
    .from('sales')
    .select(`
      *,
      sellers(full_name),
      sale_items(
        *,
        products(name)
      )
    `)
    .eq('id', id)
    .single();

  return data;
};

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
  });
};

export const useSaleDetails = (id: string) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => fetchSaleDetails(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleData: {
      seller_id?: string | null;
      total_amount: number;
      status?: string;
      payment_method?: string | null;
      notes?: string | null;
      items: {
        product_id: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
      }[];
    }) => {
      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          seller_id: saleData.seller_id,
          total_amount: saleData.total_amount,
          status: saleData.status || 'completed',
          payment_method: saleData.payment_method,
          notes: saleData.notes,
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        ...item,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of saleData.items) {
        // First get current stock
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.product_id);

          if (stockError) throw stockError;
        }
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-sales'] });
      queryClient.invalidateQueries({ queryKey: ['category-sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sale> & { id: string }) => {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('sales').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};