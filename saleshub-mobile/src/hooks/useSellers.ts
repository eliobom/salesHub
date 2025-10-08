import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SellerService, SellerWithStats } from '../services/sellers';
import type { Database } from '../lib/supabase';

type SellerInsert = Database['public']['Tables']['sellers']['Insert'];
type SellerUpdate = Database['public']['Tables']['sellers']['Update'];

export const useSellers = (options?: {
  includeStats?: boolean;
  filter?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['sellers', options],
    queryFn: () => SellerService.getAll(options),
  });
};

export const useSeller = (id: string, includeStats = false) => {
  return useQuery({
    queryKey: ['seller', id, includeStats],
    queryFn: () => SellerService.getById(id, includeStats),
    enabled: !!id,
  });
};

export const useActiveSellers = () => {
  return useQuery({
    queryKey: ['sellers', 'active'],
    queryFn: () => SellerService.getActive(),
  });
};

export const useSearchSellers = (query: string) => {
  return useQuery({
    queryKey: ['sellers', 'search', query],
    queryFn: () => SellerService.search(query),
    enabled: !!query,
  });
};

export const useSellerStats = (sellerId: string) => {
  return useQuery({
    queryKey: ['seller', 'stats', sellerId],
    queryFn: () => SellerService.getStats(sellerId),
    enabled: !!sellerId,
  });
};

export const useTopSellers = (limit = 10, period?: {
  startDate: string;
  endDate: string;
}) => {
  return useQuery({
    queryKey: ['sellers', 'top', limit, period],
    queryFn: () => SellerService.getTopPerformers(limit, period),
  });
};

export const useLowCommissionSellers = (threshold = 5) => {
  return useQuery({
    queryKey: ['sellers', 'low-commission', threshold],
    queryFn: () => SellerService.getLowCommission(threshold),
  });
};

export const useCreateSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seller: SellerInsert) => SellerService.create(seller),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SellerUpdate }) =>
      SellerService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};

export const useDeleteSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SellerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateSellerCommissionRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commissionRate }: { id: string; commissionRate: number }) =>
      SellerService.updateCommissionRate(id, commissionRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};

export const useToggleSellerActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SellerService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
};