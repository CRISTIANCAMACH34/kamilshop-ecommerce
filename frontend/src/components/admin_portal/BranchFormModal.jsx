import React, { useState, useEffect } from 'react';
import { X, Store, Save } from 'lucide-react';

/**
 * BranchFormModal - Modal para registrar y editar sedes, dark stores o bodegas de despacho
 */
export function BranchFormModal({
  open,
  branchToEdit = null,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: '',
    city: 'Bogotá',
    address: '',
    sla: '24h despacho nacional',
    capacity: 'Alta (Cobertura Nacional)',
    status: '100% Operando Online',
  });

  useEffect(() => {
    if (branchToEdit) {
      setFormData({
        name: branchToEdit.name || '',
        city: branchToEdit.city || 'Bogotá',
        address: branchToEdit.address || '',
        sla: branchToEdit.sla || '24h despacho nacional',
        capacity: branchToEdit.capacity || 'Alta (Cobertura Nacional)',
        status: branchToEdit.status || '100% Operando Online',
      });
    } else {
      setFormData({
        name: '',
        city: 'Bogotá',
        address: '',
        sla: '24h despacho nacional',
        capacity: 'Alta (Cobertura Nacional)',
        status: '100% Operando Online',
      });
    }
  }, [branchToEdit, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      id: branchToEdit ? branchToEdit.id : `branch-${Date.now()}`,
      ...formData,
      statusBadge: branchToEdit?.statusBadge || 'bg-emerald-100 text-emerald-800 border-emerald-200',
      isPrimary: branchToEdit ? branchToEdit.isPrimary : false,
      type: branchToEdit?.type || 'Centro de Despacho & Fulfillment (Importaciones USA)',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
              <Store size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Red de Despacho
              </p>
              <h2 className="text-base font-black text-slate-900">
                {branchToEdit ? 'Editar Centro Logístico' : 'Nueva Sede / Bodega'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre de la Bodega o Dark Store *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Bodega Central Kamil Shop"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ciudad
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="Bogotá">Bogotá, D.C.</option>
                <option value="Medellín">Medellín</option>
                <option value="Cali">Cali</option>
                <option value="Barranquilla">Barranquilla</option>
                <option value="Bucaramanga">Bucaramanga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Capacidad
              </label>
              <select
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="Alta">Alta (&gt; 5.000 prendas)</option>
                <option value="Media">Media (1.000 - 5.000)</option>
                <option value="Boutique">Boutique Local</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dirección de Despacho *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carrera 15 #85-30"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-black transition-all"
            >
              <Save size={14} />
              <span>{branchToEdit ? 'Guardar Cambios' : 'Guardar Bodega'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
