import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService, ProductWithCategory } from '../services/products';
import type { Database } from '../lib/supabase';

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export const useProducts = (options?: {
  includeCategory?: boolean;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => ProductService.getAll(options),
  });
};

export const useProduct = (id: string, includeCategory = false) => {
  return useQuery({
    queryKey: ['product', id, includeCategory],
    queryFn: () => ProductService.getById(id, includeCategory),
    enabled: !!id,
  });
};

export const useProductsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => ProductService.getByCategory(categoryId),
    enabled: !!categoryId,
  });
};

export const useSearchProducts = (query: string, options?: {
  categoryId?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['products', 'search', query, options],
    queryFn: () => ProductService.search(query, options),
    enabled: !!query,
  });
};

export const useActiveProducts = () => {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => ProductService.getActive(),
  });
};

export const useLowStockProducts = (threshold = 10) => {
  return useQuery({
    queryKey: ['products', 'low-stock', threshold],
    queryFn: () => ProductService.getLowStock(threshold),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: ProductInsert) => ProductService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProductUpdate }) =>
      ProductService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newStock }: { id: string; newStock: number }) =>
      ProductService.updateStock(id, newStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};