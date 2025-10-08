import React, { useCallback } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface Sale {
  id: string;
  seller_id: string | null;
  total_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  sellers?: { full_name: string };
}

interface SalesTableProps {
  sales: Sale[];
  onUpdate: () => void;
}

export const SalesTable = React.memo(({ sales, onUpdate }: SalesTableProps) => {
  const handleDelete = useCallback(async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      await supabase.from('sales').delete().eq('id', id);
      onUpdate();
    }
  }, [onUpdate]);

  const getStatusBadge = useCallback((status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const labels = {
      completed: 'Completada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
    };

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  }, []);

  const getPaymentMethodLabel = useCallback((method: string | null) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
    };
    return method ? labels[method] || method : '-';
  }, []);

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay ventas registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendedor</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Método</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Date(sale.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                {sale.sellers?.full_name || 'Sin asignar'}
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                ${Number(sale.total_amount).toFixed(2)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {getPaymentMethodLabel(sale.payment_method)}
              </td>
              <td className="py-3 px-4">{getStatusBadge(sale.status)}</td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(sale.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
