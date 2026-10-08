import React, { useState } from 'react';
import { X, UserPlus, Save, Shield } from 'lucide-react';

export function TeamMemberModal({ open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Jefe de Bodega & Picking',
    hub: 'Bodega Central Kamil Shop — Despacho Nacional',
  });

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    onSave?.({
      id: `usr-${Date.now()}`,
      ...formData,
      provider: 'corporate',
      tier: formData.role,
      totalSpent: 0,
      ordersCount: 0
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Control de Accesos RBAC
              </p>
              <h2 className="text-base font-black text-slate-900">
                Nuevo Miembro del Equipo
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
              Nombre y Apellido *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Daniel Restrepo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo Electrónico Corporativo *
            </label>
            <input
              type="email"
              required
              placeholder="daniel@titulo-studio.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rol Asignado
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="Jefe de Bodega & Picking">Jefe de Bodega & Picking</option>
              <option value="Despachador Logístico">Despachador Logístico / Courier</option>
              <option value="Administrador General">Administrador General</option>
              <option value="Auditor de Calidad">Auditor de Calidad Textil</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sede Asignada
            </label>
            <select
              value={formData.hub}
              onChange={(e) => setFormData({ ...formData, hub: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="Bodega Central Kamil Shop — Despacho Nacional">Bodega Central Kamil Shop — Despacho Nacional</option>
            </select>
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
              <span>Guardar Miembro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
