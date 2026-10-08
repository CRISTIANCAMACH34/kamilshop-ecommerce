import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2, Percent, Users, Gift, Sparkles, Edit3, Trash2 } from 'lucide-react';
import { usePromotions } from '../../context/PromotionsContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export function AdminPromotionsView({ onOpenCreateCoupon, onEditCoupon, onDeleteCoupon }) {
  const { coupons, removeCoupon } = usePromotions();
  const [couponToDelete, setCouponToDelete] = useState(null);

  const handleDelete = (code) => {
    if (onDeleteCoupon) {
      onDeleteCoupon(code);
    } else {
      removeCoupon(code);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Marketing & Promociones • KAMIL SHOP
          </p>
          <h2 className="text-xl font-black text-slate-900">
            Módulo de Promociones y Combos ({coupons.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenCreateCoupon}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm hover:bg-black cursor-pointer transition-all"
        >
          <Plus size={16} />
          <span>Crear Promoción</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Código</th>
                <th className="px-4 py-3.5">Prenda Enlazada</th>
                <th className="px-4 py-3.5">Tipo & Beneficio</th>
                <th className="px-4 py-3.5">Descripción</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5">Vencimiento</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {coupons.map((c) => {
                let badgeType = 'Descuento';
                let badgeClass = 'bg-slate-100 text-slate-800';

                if (c.type === 'bundle') {
                  badgeType = 'Combo / Bundle';
                  badgeClass = 'bg-amber-100 text-amber-900 border border-amber-200';
                } else if (c.type === 'free_shipping') {
                  badgeType = 'Envío Gratis';
                  badgeClass = 'bg-emerald-100 text-emerald-900 border border-emerald-200';
                } else {
                  badgeType = `${c.discountPercent || 15}% OFF`;
                  badgeClass = 'bg-slate-100 text-slate-900 border border-slate-200';
                }

                return (
                  <tr key={c.code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-black text-slate-900 border border-slate-200">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{c.productName || 'Todas las prendas'}</p>
                      {c.comboProductName && (
                        <p className="text-[11px] text-amber-800 font-medium">
                          + Combo con: {c.comboProductName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                        {badgeType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[220px] truncate">
                      {c.description || 'Sin descripción adicional'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                        {c.status || 'Activo'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-slate-500">
                      {c.expires}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditCoupon?.(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                        >
                          <Edit3 size={11} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCouponToDelete(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/60 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        >
                          <Trash2 size={11} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Confirmación Borrar Cupón/Promoción */}
      <ConfirmDeleteModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={() => {
          if (couponToDelete) {
            handleDelete(couponToDelete.code);
            setCouponToDelete(null);
          }
        }}
        title="¿Estás seguro de eliminar esta promoción?"
        itemName={couponToDelete?.code}
        description="Esta acción eliminará el código de descuento del sistema."
      />
    </div>
  );
}
