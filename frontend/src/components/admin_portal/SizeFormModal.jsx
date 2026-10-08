import React, { useState, useEffect } from 'react';
import { X, Layers, Plus, Trash2 } from 'lucide-react';

/**
 * SizeFormModal - Modal Centrado para Crear y Editar Tipo de Talla
 * Permite registrar grupos de tallas (ej: Calzado Deportivo, Ropa Superior, Numéricas)
 */
export function SizeFormModal({ open, sizeToEdit = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    group: 'Tallas de Ropa (Superior / Inferior)',
    name: '',
    sizesInput: '',
    sizes: ['S', 'M', 'L', 'XL'],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (sizeToEdit) {
      setFormData({
        group: sizeToEdit.group || 'Tallas de Ropa (Superior / Inferior)',
        name: sizeToEdit.name || '',
        sizesInput: '',
        sizes: sizeToEdit.sizes || ['S', 'M', 'L', 'XL'],
      });
    } else {
      setFormData({
        group: 'Tallas de Ropa (Superior / Inferior)',
        name: '',
        sizesInput: '',
        sizes: ['S', 'M', 'L', 'XL'],
      });
    }
    setError('');
  }, [sizeToEdit, open]);

  if (!open) return null;

  const handleAddSizeTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = formData.sizesInput.trim().toUpperCase();
      if (val && !formData.sizes.includes(val)) {
        setFormData(prev => ({
          ...prev,
          sizes: [...prev.sizes, val],
          sizesInput: ''
        }));
      }
    }
  };

  const removeSizeTag = (sizeToRemove) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== sizeToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Por favor indica el nombre del tipo de talla.');
      return;
    }
    if (formData.sizes.length === 0) {
      setError('Debes ingresar al menos una talla.');
      return;
    }

    const newSize = {
      id: sizeToEdit ? sizeToEdit.id : `sz-${Date.now()}`,
      group: formData.group,
      name: formData.name.trim(),
      sizes: formData.sizes,
      status: sizeToEdit ? (sizeToEdit.status || 'Activa') : 'Activa'
    };

    onSave?.(newSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Centrado */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-xs">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Atributos de Prenda
              </p>
              <h2 className="text-base font-black text-slate-900">
                {sizeToEdit ? 'Editar Tipo de Talla' : 'Crear Tipo de Talla'}
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
          {/* Grupo de Talla */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Grupo / Categoría de Talla *
            </label>
            <select
              value={formData.group}
              onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="Tallas de Ropa (Superior / Inferior)">Tallas de Ropa (Superior / Inferior)</option>
              <option value="Calzado & Zapatillas">Calzado & Zapatillas Deportivas</option>
              <option value="Pantalones & Denim">Pantalones & Denim Numérico</option>
              <option value="Accesorios & Gorras">Accesorios & Complementos</option>
            </select>
          </div>

          {/* Nombre descriptivo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre de la Escala de Tallas *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
              placeholder="Ej. Textil Estándar (XS-XXL) o Calzado (38-44)"
              required
            />
          </div>

          {/* Agregar Tallas Individuales */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Valores de Tallas (Escribe y presiona Enter)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.sizesInput}
                onChange={(e) => setFormData(prev => ({ ...prev, sizesInput: e.target.value }))}
                onKeyDown={handleAddSizeTag}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-slate-900 uppercase"
                placeholder="Ej. S, M, L o 39, 40..."
              />
              <button
                type="button"
                onClick={() => {
                  const val = formData.sizesInput.trim().toUpperCase();
                  if (val && !formData.sizes.includes(val)) {
                    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, val], sizesInput: '' }));
                  }
                }}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black"
              >
                + Añadir
              </button>
            </div>

            {/* Tags de Tallas */}
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-100 bg-slate-50 min-h-[44px]">
              {formData.sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-mono font-bold text-slate-900 shadow-xs"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSizeTag(s)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 border border-rose-200 p-2 text-xs font-bold text-rose-700">
              {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-2 text-xs font-black text-white hover:bg-black shadow-sm"
            >
              {sizeToEdit ? 'Guardar Cambios' : 'Guardar Tipo de Talla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
