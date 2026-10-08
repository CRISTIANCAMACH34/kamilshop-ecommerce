import React, { useState, useEffect } from 'react';
import { X, Award, Save, Globe, Tag } from 'lucide-react';

export function BrandFormModal({ open, brandToEdit = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    country: 'Importación USA',
    tier: 'Alta Costura / Luxury',
    description: '',
    initials: '',
    website: 'www.kamil-shop.com'
  });

  useEffect(() => {
    if (brandToEdit) {
      setFormData({
        name: brandToEdit.name || '',
        country: brandToEdit.country || 'Importación USA',
        tier: brandToEdit.tier || 'Alta Costura / Luxury',
        description: brandToEdit.description || '',
        initials: brandToEdit.initials || '',
        website: brandToEdit.website || 'www.kamil-shop.com'
      });
    } else {
      setFormData({
        name: '',
        country: 'Importación USA',
        tier: 'Alta Costura / Luxury',
        description: '',
        initials: '',
        website: 'www.kamil-shop.com'
      });
    }
  }, [brandToEdit, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const brand = {
      id: brandToEdit ? brandToEdit.id : `br-${Date.now()}`,
      ...formData,
      initials: formData.initials || formData.name.slice(0, 2).toUpperCase(),
      productsCount: brandToEdit ? (brandToEdit.productsCount || 0) : 0,
      status: brandToEdit ? (brandToEdit.status || 'Activa') : 'Activa'
    };

    onSave?.(brand);
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
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gestión de Catálogo
              </p>
              <h2 className="text-base font-black text-slate-900">
                {brandToEdit ? 'Editar Marca de Moda' : 'Nueva Marca de Moda'}
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Marca *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Noir Archive"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monograma
              </label>
              <input
                type="text"
                maxLength={3}
                placeholder="NA"
                value={formData.initials}
                onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
                className="h-10 w-full rounded-xl font-mono text-center border border-slate-200 bg-white px-3 text-xs font-black text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Línea / Segmento
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="Alta Costura / Luxury">Alta Costura / Luxury</option>
                <option value="Streetwear Premium">Streetwear Premium</option>
                <option value="Sastrería & Atelier">Sastrería & Atelier</option>
                <option value="Techwear Funcional">Techwear Funcional</option>
                <option value="Básicos Heavyweight">Básicos Heavyweight</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Origen / Taller
              </label>
              <input
                type="text"
                placeholder="Bogotá / Medellín"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción de la Marca
            </label>
            <textarea
              rows={3}
              placeholder="Enfoque de diseño, siluetas características y concepto estético..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-black"
            >
              <Save size={14} />
              <span>{brandToEdit ? 'Guardar Cambios' : 'Crear Marca'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
