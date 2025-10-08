import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaleService, SaleWithItems, CreateSaleData } from '../services/sales';
import type { Database } from '../lib/supabase';

type SaleUpdate = Database['public']['Tables']['sales']['Update'];

export const useSales = (options?: {
  includeItems?: boolean;
  includeSeller?: boolean;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['sales', options],
    queryFn: () => SaleService.getAll(options),
  });
};

export const useSale = (id: string, includeItems = true, includeSeller = true) => {
  return useQuery({
    queryKey: ['sale', id, includeItems, includeSeller],
    queryFn: () => SaleService.getById(id, includeItems, includeSeller),
    enabled: !!id,
  });
};

export const useSalesBySeller = (sellerId: string) => {
  return useQuery({
    queryKey: ['sales', 'seller', sellerId],
    queryFn: () => SaleService.getBySeller(sellerId),
    enabled: !!sellerId,
  });
};

export const useSalesByStatus = (status: string) => {
  return useQuery({
    queryKey: ['sales', 'status', status],
    queryFn: () => SaleService.getByStatus(status),
  });
};

export const useSalesByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['sales', 'date-range', startDate, endDate],
    queryFn: () => SaleService.getByDateRange(startDate, endDate),
  });
};

export const useSalesSummary = (options?: {
  sellerId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['sales', 'summary', options],
    queryFn: () => SaleService.getSummary(options),
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleData: CreateSaleData) => SaleService.create(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SaleUpdate }) =>
      SaleService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SaleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateSaleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      SaleService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};