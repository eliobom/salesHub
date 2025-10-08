import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export function SaleModal({ isOpen, onClose }: SaleModalProps) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    seller_id: '',
    payment_method: 'cash',
    notes: '',
  });
  const [items, setItems] = useState<SaleItem[]>([
    { product_id: '', quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [sellersRes, productsRes] = await Promise.all([
      supabase.from('sellers').select('id, full_name').eq('is_active', true),
      supabase.from('products').select('id, name, price').eq('is_active', true),
    ]);

    if (sellersRes.data) setSellers(sellersRes.data);
    if (productsRes.data) setProducts(productsRes.data);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      product_id: productId,
      unit_price: product?.price || 0,
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = calculateTotal();

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          seller_id: formData.seller_id || null,
          total_amount: total,
          status: 'completed',
          payment_method: formData.payment_method,
          notes: formData.notes || null,
        },
      ])
      .select()
      .single();

    if (sale && !saleError) {
      const saleItems = items
        .filter((item) => item.product_id)
        .map((item) => ({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
        }));

      await supabase.from('sale_items').insert(saleItems);

      for (const item of items) {
        if (item.product_id) {
          const product = products.find((p) => p.id === item.product_id);
          if (product) {
            await supabase
              .from('products')
              .update({ stock: product.stock - item.quantity })
              .eq('id', item.product_id);
          }
        }
      }
    }

    setFormData({ seller_id: '', payment_method: 'cash', notes: '' });
    setItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Venta" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Vendedor"
            value={formData.seller_id}
            onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
            options={[
              { value: '', label: 'Seleccionar vendedor' },
              ...sellers.map((s) => ({ value: s.id, label: s.full_name })),
            ]}
          />

          <Select
            label="Método de Pago"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            options={[
              { value: 'cash', label: 'Efectivo' },
              { value: 'card', label: 'Tarjeta' },
              { value: 'transfer', label: 'Transferencia' },
            ]}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Productos</label>
            <Button type="button" variant="ghost" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Select
                    value={item.product_id}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    options={[
                      { value: '', label: 'Seleccionar producto' },
                      ...products.map((p) => ({ value: p.id, label: `${p.name} - $${p.price}` })),
                    ]}
                    required
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    placeholder="Cant."
                    required
                  />
                </div>
                <div className="w-32">
                  <Input value={`$${(item.quantity * item.unit_price).toFixed(2)}`} disabled />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
          <span className="text-lg font-medium text-gray-700">Total:</span>
          <span className="text-3xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Registrar Venta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
