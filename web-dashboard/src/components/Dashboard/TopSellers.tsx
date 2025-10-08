import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useTopSellers } from '../../hooks/useDashboard';
import { Users } from 'lucide-react';

export const TopSellers = React.memo(() => {
  const { data: sellers, isLoading } = useTopSellers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendedores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(sellers || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay vendedores disponibles</p>
            </div>
          ) : (
            (sellers || []).map((seller, index) => (
              <div
                key={seller.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{seller.full_name}</p>
                    <p className="text-sm text-gray-500">{seller.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${(seller.total_sales || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">en ventas</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});
