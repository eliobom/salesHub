import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useTopProducts } from '../../hooks/useDashboard';
import { Package } from 'lucide-react';

export function TopProducts() {
  const { data: products, isLoading } = useTopProducts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Destacados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(products || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay productos disponibles</p>
            </div>
          ) : (
            (products || []).map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.price}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
