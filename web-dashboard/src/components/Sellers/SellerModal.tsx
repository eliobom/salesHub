import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: any;
}

export function SellerModal({ isOpen, onClose, seller }: SellerModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    commission_rate: '10',
    is_active: true,
  });

  useEffect(() => {
    if (seller) {
      setFormData({
        email: seller.email || '',
        full_name: seller.full_name || '',
        phone: seller.phone || '',
        commission_rate: ((seller.commission_rate || 0) * 100).toString(),
        is_active: seller.is_active,
      });
    } else {
      setFormData({
        email: '',
        full_name: '',
        phone: '',
        commission_rate: '10',
        is_active: true,
      });
    }
  }, [seller, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sellerData = {
      email: formData.email,
      full_name: formData.full_name,
      phone: formData.phone || null,
      commission_rate: parseFloat(formData.commission_rate) / 100,
      is_active: formData.is_active,
    };

    if (seller) {
      await supabase.from('sellers').update(sellerData).eq('id', seller.id);
    } else {
      await supabase.from('sellers').insert([sellerData]);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={seller ? 'Editar Vendedor' : 'Agregar Vendedor'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre Completo"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Teléfono"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1234567890"
        />

        <div>
          <Input
            label="Tasa de Comisión (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.commission_rate}
            onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Comisión que recibe el vendedor por cada venta
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Vendedor activo
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {seller ? 'Guardar Cambios' : 'Crear Vendedor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
