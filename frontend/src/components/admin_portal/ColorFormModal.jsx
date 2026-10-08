import React, { useState, useEffect } from 'react';
import { X, Palette, Save } from 'lucide-react';

/**
 * ColorFormModal - Modal Centrado para Crear y Editar Tipo de Color y Paleta
 */
export function ColorFormModal({ open, colorToEdit = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    hex: '#0a0a0a',
    palette: 'Neutros & Obscure',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (colorToEdit) {
      setFormData({
        name: colorToEdit.name || '',
        hex: colorToEdit.hex || '#0a0a0a',
        palette: colorToEdit.palette || 'Neutros & Obscure',
      });
    } else {
      setFormData({
        name: '',
        hex: '#0a0a0a',
        palette: 'Neutros & Obscure',
      });
    }
    setError('');
  }, [colorToEdit, open]);

  if (!open) return null;

  const presetPalettes = [
    'Neutros & Obscure',
    'Tierras & Colección',
    'Colección Runway',
    'Básicos Contemporáneos',
    'Neón & Acentos Deportivos',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Por favor ingresa el nombre del color.');
      return;
    }

    const newColor = {
      id: colorToEdit ? colorToEdit.id : `col-${Date.now()}`,
      name: formData.name.trim(),
      hex: formData.hex,
      palette: formData.palette,
      itemsCount: colorToEdit ? (colorToEdit.itemsCount || 0) : 0
    };

    onSave?.(newColor);
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
              <Palette size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Paleta Textil
              </p>
              <h2 className="text-base font-black text-slate-900">
                {colorToEdit ? 'Editar Color de Colección' : 'Crear Color de Colección'}
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
          {/* Nombre del Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre del Color *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
              placeholder="Ej. Verde Oliva Militar, Gris Melange, Noir Intenso"
              required
            />
          </div>

          {/* Selector de Color Hex */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tono Hexadecimal *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.hex}
                onChange={(e) => setFormData(prev => ({ ...prev, hex: e.target.value }))}
                className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 p-1"
              />
              <input
                type="text"
                value={formData.hex}
                onChange={(e) => setFormData(prev => ({ ...prev, hex: e.target.value }))}
                className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900 uppercase outline-none focus:border-slate-900"
                placeholder="#000000"
                required
              />
              <div
                className="h-10 flex-1 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: formData.hex,
                  color: ['#ffffff', '#f5f5f5', '#f8f8f6', '#d9cdb8'].includes(formData.hex.toLowerCase()) ? '#000000' : '#ffffff'
                }}
              >
                Muestra
              </div>
            </div>
          </div>

          {/* Categoría / Paleta */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Categoría de Paleta *
            </label>
            <select
              value={formData.palette}
              onChange={(e) => setFormData(prev => ({ ...prev, palette: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
            >
              {presetPalettes.map((pal) => (
                <option key={pal} value={pal}>
                  {pal}
                </option>
              ))}
            </select>
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
              {colorToEdit ? 'Guardar Cambios' : 'Guardar Color'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
