import React, { useState, useEffect } from 'react';
import { X, Layers, Save, Tag, Award } from 'lucide-react';

/**
 * TypeFormModal - Modal Centrado para Crear y Editar Tipo y Categorías de Prenda
 * Enlazado dinámicamente con las Marcas de Moda.
 */
export function TypeFormModal({ open, brands = [], typeToEdit = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Buzos & Hoodies',
    brandName: brands[0]?.name || 'TITULO Studio',
    gender: 'Unisex',
    suggestedSizes: ['S', 'M', 'L', 'XL'],
    textileSpecs: 'Algodón Peinado 100% • 380 GSM',
    description: ''
  });

  useEffect(() => {
    if (typeToEdit) {
      setFormData({
        name: typeToEdit.name || '',
        category: typeToEdit.category || 'Buzos & Hoodies',
        brandName: typeToEdit.brandName || (brands[0]?.name || 'TITULO Studio'),
        gender: typeToEdit.gender || 'Unisex',
        suggestedSizes: typeToEdit.suggestedSizes || ['S', 'M', 'L', 'XL'],
        textileSpecs: typeToEdit.textileSpecs || '',
        description: typeToEdit.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Buzos & Hoodies',
        brandName: brands[0]?.name || 'TITULO Studio',
        gender: 'Unisex',
        suggestedSizes: ['S', 'M', 'L', 'XL'],
        textileSpecs: 'Algodón Peinado 100% • 380 GSM',
        description: ''
      });
    }
  }, [typeToEdit, open, brands]);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', 'Única'];

  const categoryPresets = [
    'Zapatillas Deportivas',
    'Ropa Deportiva & Athleisure',
    'Buzos & Hoodies',
    'Camisetas Heavyweight',
    'Pantalonetas',
    'Pantalones & Cargos',
    'Chaquetas & Abrigos',
    'Sastrería & Lujo',
    'Accesorios & Complementos',
  ];

  if (!open) return null;

  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.suggestedSizes.includes(size);
      return {
        ...prev,
        suggestedSizes: exists
          ? prev.suggestedSizes.filter((s) => s !== size)
          : [...prev.suggestedSizes, size]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newType = {
      id: typeToEdit ? typeToEdit.id : `typ-${Date.now()}`,
      ...formData,
      productsCount: typeToEdit ? (typeToEdit.productsCount || 0) : 0,
      status: typeToEdit ? (typeToEdit.status || 'Activo') : 'Activo'
    };

    onSave?.(newType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-xs">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estructura de Catálogo
              </p>
              <h2 className="text-base font-black text-slate-900">
                {typeToEdit ? 'Editar Tipo o Categoría' : 'Nuevo Tipo o Categoría'}
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
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre del Tipo o Categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Buzos Oversize, Zapatillas Running, Pantaloneta Pro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          {/* Enlazado con desplegable de Marca de Moda */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Marca de Moda Asociada *
            </label>
            <div className="relative">
              <select
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
              >
                {brands && brands.length > 0 ? (
                  brands.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name} ({b.initials || 'MC'})
                    </option>
                  ))
                ) : (
                  <option value="TITULO Studio">TITULO Studio</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clasificación
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
              >
                {categoryPresets.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Género Sugerido
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="Unisex">Unisex</option>
                <option value="Hombre">Masculino</option>
                <option value="Mujer">Femenino</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Matriz de Tallas Sugerida
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl border border-slate-100 bg-slate-50">
              {availableSizes.map((s) => {
                const isSelected = formData.suggestedSizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`h-7 px-2.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ficha Técnica Textil Básica
            </label>
            <input
              type="text"
              placeholder="Ej: Algodón Peinado 100% • 380 GSM • Poliéster Dry-Fit"
              value={formData.textileSpecs}
              onChange={(e) => setFormData({ ...formData, textileSpecs: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white hover:bg-black shadow-sm"
            >
              <Save size={14} />
              <span>{typeToEdit ? 'Guardar Cambios' : 'Guardar Categoría'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
