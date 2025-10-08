import { useState, useMemo } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, UserX, UserCheck, Users } from 'lucide-react';
import { useSellers, useDeleteSeller, useToggleSellerActive } from '../../hooks/useSellers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { SellerModal } from './SellerModal';

export function SellersView() {
  const { data: sellers } = useSellers();
  const deleteSellerMutation = useDeleteSeller();
  const toggleActiveMutation = useToggleSellerActive();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);

  const filteredSellers = useMemo(() => {
    if (!sellers) return [];
    return sellers.filter(
      (seller) =>
        seller.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sellers, searchTerm]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este vendedor?')) {
      deleteSellerMutation.mutate(id);
    }
  };

  const toggleActive = async (seller: any) => {
    toggleActiveMutation.mutate({ id: seller.id, is_active: !seller.is_active });
  };

  const handleEdit = (seller: any) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSeller(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSeller(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendedores</h1>
          <p className="text-gray-600 mt-1">Administra tu equipo de ventas</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-5 h-5" />
          Agregar Vendedor
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {filteredSellers.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay vendedores disponibles</p>
            <p className="text-sm mt-1">Comienza agregando tu primer vendedor</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSellers.map((seller) => (
            <Card key={seller.id} hover className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {seller.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      seller.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {seller.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">{seller.full_name}</h3>
                <p className="text-sm text-gray-600 mb-1">{seller.email}</p>
                {seller.phone && <p className="text-sm text-gray-600 mb-3">{seller.phone}</p>}

                <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Comisión</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(seller.commission_rate * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" fullWidth onClick={() => handleEdit(seller)}>
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(seller)}
                    title={seller.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {seller.is_active ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(seller.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SellerModal isOpen={isModalOpen} onClose={handleModalClose} seller={selectedSeller} />
    </div>
  );
}
