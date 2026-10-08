import React, { useState } from 'react';
import { Layers, Palette, Plus, Check, Edit3, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export function AdminVariantsView({
  sizesList = [],
  colorsList = [],
  onOpenAddSize,
  onOpenAddColor,
  onEditSize,
  onDeleteSize,
  onEditColor,
  onDeleteColor,
}) {
  const [sizeToDelete, setSizeToDelete] = useState(null);
  const [colorToDelete, setColorToDelete] = useState(null);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Atributos de Prenda • KAMIL SHOP
          </p>
          <h2 className="text-xl font-black text-slate-900">
            Matriz de Tallas y Paleta de Colores
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAddSize}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-xs font-bold text-white shadow-sm hover:bg-black transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Crear Tipo de Talla</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddColor}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-900 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Crear Color</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tallas */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-slate-900" />
              <h3 className="text-base font-black text-slate-900">
                Tipos de Tallas ({sizesList.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Escalas Disponibles</span>
          </div>

          <div className="divide-y divide-slate-100">
            {sizesList.map((s) => (
              <div key={s.id || s.name} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-400">{s.group}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                      {s.status || 'Activa'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditSize?.(s)}
                      title="Editar Tipo de Talla"
                      className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeToDelete(s)}
                      title="Eliminar Tipo de Talla"
                      className="grid h-6 w-6 place-items-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Badges de Tallas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {s.sizes?.map((sz) => (
                    <span
                      key={sz}
                      className="grid h-7 min-w-[28px] place-items-center rounded-lg bg-slate-100 px-2 font-mono text-xs font-black text-slate-800"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colores */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-slate-900" />
              <h3 className="text-base font-black text-slate-900">
                Paleta de Colores ({colorsList.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Atelier Kamil Shop</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {colorsList.map((c) => (
              <div key={c.id || c.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-9 w-9 rounded-xl border border-slate-200 shadow-xs shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{c.hex} • {c.palette}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                    {c.itemsCount || 0} prendas
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditColor?.(c)}
                    title="Editar Color"
                    className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorToDelete(c)}
                    title="Eliminar Color"
                    className="grid h-6 w-6 place-items-center rounded-md border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Confirmación Borrar Escala de Tallas */}
      <ConfirmDeleteModal
        isOpen={!!sizeToDelete}
        onClose={() => setSizeToDelete(null)}
        onConfirm={() => {
          if (sizeToDelete) {
            onDeleteSize?.(sizeToDelete.id);
            setSizeToDelete(null);
          }
        }}
        title="¿Estás seguro de eliminar esta escala de tallas?"
        itemName={sizeToDelete?.name}
        description="Esta acción eliminará el tipo de talla del sistema."
      />

      {/* Modal Confirmación Borrar Muestra de Color */}
      <ConfirmDeleteModal
        isOpen={!!colorToDelete}
        onClose={() => setColorToDelete(null)}
        onConfirm={() => {
          if (colorToDelete) {
            onDeleteColor?.(colorToDelete.id);
            setColorToDelete(null);
          }
        }}
        title="¿Estás seguro de eliminar este tono de color?"
        itemName={colorToDelete?.name}
        description="Al eliminar este color, dejará de estar disponible como muestra en el catálogo."
      />
    </div>
  );
}
