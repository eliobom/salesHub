import { useState, useMemo } from 'react';
import { Plus, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useSales } from '../../hooks/useSales';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { SaleModal } from './SaleModal';
import { SalesTable } from './SalesTable';

export function SalesView() {
  const { data: sales, isLoading } = useSales();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    if (!sales) return { today: 0, week: 0, month: 0 };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaySales = sales.filter(sale => new Date(sale.created_at) >= todayStart);
    const weekSales = sales.filter(sale => new Date(sale.created_at) >= weekStart);
    const monthSales = sales.filter(sale => new Date(sale.created_at) >= monthStart);

    return {
      today: todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0),
      week: weekSales.reduce((sum, s) => sum + Number(s.total_amount), 0),
      month: monthSales.reduce((sum, s) => sum + Number(s.total_amount), 0),
    };
  }, [sales]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">Registra y gestiona todas las transacciones</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Nueva Venta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">${stats.today.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">${stats.week.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">${stats.month.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable sales={sales || []} onUpdate={() => {}} />
        </CardContent>
      </Card>

      <SaleModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
}
