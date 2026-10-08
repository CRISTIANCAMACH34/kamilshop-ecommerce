import React, { useState, useEffect } from 'react';
import { X, Tag, Save, Percent, Gift, Sparkles, Layers } from 'lucide-react';
import { usePromotions } from '../../context/PromotionsContext';
import { formatUSD, formatCOP } from '../../services/currencyService';

/**
 * CouponFormModal - Modal Centrado para Crear y Editar Promociones y Cupones
 * Enlazado con producto específico, combos con otros productos, tipo y fecha de expiración.
 */
export function CouponFormModal({ open, products = [], couponToEdit = null, onClose }) {
  const { addCoupon, updateCoupon } = usePromotions();
  const [formData, setFormData] = useState({
    code: '',
    productId: 'all',
    productName: 'Todas las prendas del catálogo',
    type: 'percentage', // percentage | bundle | free_shipping
    comboProductId: '',
    comboProductName: '',
    discountPercent: 15,
    description: '',
    expires: '31/12/2026',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (couponToEdit) {
      setFormData({
        code: couponToEdit.code || '',
        productId: couponToEdit.productId || 'all',
        productName: couponToEdit.productName || 'Todas las prendas del catálogo',
        type: couponToEdit.type || 'percentage',
        comboProductId: couponToEdit.comboProductId || '',
        comboProductName: couponToEdit.comboProductName || '',
        discountPercent: couponToEdit.discountPercent !== undefined ? couponToEdit.discountPercent : 15,
        description: couponToEdit.description || '',
        expires: couponToEdit.expires || '31/12/2026',
      });
    } else {
      setFormData({
        code: '',
        productId: 'all',
        productName: 'Todas las prendas del catálogo',
        type: 'percentage',
        comboProductId: '',
        comboProductName: '',
        discountPercent: 15,
        description: '',
        expires: '31/12/2026',
      });
    }
    setError('');
  }, [couponToEdit, open]);

  if (!open) return null;

  const handleProductChange = (productId) => {
    if (productId === 'all') {
      setFormData(prev => ({
        ...prev,
        productId: 'all',
        productName: 'Todas las prendas del catálogo'
      }));
    } else {
      const selected = products.find(p => p.id === productId);
      setFormData(prev => ({
        ...prev,
        productId,
        productName: selected ? selected.name : 'Prenda seleccionada'
      }));
    }
  };

  const handleComboProductChange = (productId) => {
    const selected = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      comboProductId: productId,
      comboProductName: selected ? selected.name : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.code.trim()) {
      setError('Debes ingresar un código de cupón o promoción.');
      return;
    }

    let res;
    if (couponToEdit) {
      res = updateCoupon(couponToEdit.code, {
        ...formData,
        code: formData.code.trim().toUpperCase(),
      });
    } else {
      res = addCoupon({
        ...formData,
        code: formData.code.trim().toUpperCase(),
      });
    }

    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-xs">
              <Tag size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Marketing & Ofertas
              </p>
              <h2 className="text-base font-black text-slate-900">
                {couponToEdit ? 'Editar Promoción o Cupón' : 'Crear Promoción o Combo'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Código del cupón */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Código de la Promoción *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. DROP20, COMBOPRO, VERANO15"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-black text-slate-900 outline-none focus:border-slate-900 uppercase placeholder:text-slate-400"
            />
          </div>

          {/* Enlazado con Desplegable al Producto Seleccionado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Prenda Asociada a la Promoción *
            </label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="all">Todas las prendas del catálogo</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatUSD(p.price || 0)})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Promoción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tipo de Promoción *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="percentage">Descuento Porcentual (%)</option>
              <option value="bundle">Combo con Otro Producto (Bundle)</option>
              <option value="free_shipping">Envío Gratis Sin Mínimo</option>
            </select>
          </div>

          {/* Si es Combo con otro producto */}
          {formData.type === 'bundle' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Selecciona la Segunda Prenda para el Combo *
              </label>
              <select
                value={formData.comboProductId}
                onChange={(e) => handleComboProductChange(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="">-- Elige una prenda acompañante --</option>
                {products
                  .filter(p => p.id !== formData.productId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      + {p.name} ({formatUSD(p.price || 0)})
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-slate-600">
                Al comprar ambas prendas juntas, se aplicará el descuento de combo en el checkout.
              </p>
            </div>
          )}

          {/* Porcentaje de descuento */}
          {formData.type !== 'free_shipping' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Porcentaje de Descuento
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          )}

          {/* Descripción de la Promoción (OPCIONAL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción de la Promoción (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Oferta de lanzamiento por semana de apertura"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha de Vencimiento *
            </label>
            <input
              type="text"
              placeholder="Ej. 31/12/2026 o Permanente"
              value={formData.expires}
              onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-bold text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 border border-rose-200 p-2 text-xs font-bold text-rose-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white hover:bg-black transition shadow-sm"
            >
              <Save size={14} />
              <span>{couponToEdit ? 'Guardar Cambios' : 'Guardar Promoción'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
