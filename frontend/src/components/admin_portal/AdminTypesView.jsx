import React, { useState } from 'react';
import { Layers, Plus, Tag, CheckCircle2, Sliders, Edit3, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export function AdminTypesView({ types = [], onOpenAddType, onEditType, onDeleteType }) {
  const [typeToDelete, setTypeToDelete] = useState(null);

  const defaultTypes = [
    {
      id: "typ-01",
      name: "Hoodies & Sweaters",
      category: "Prendas Superiores",
      gender: "Unisex",
      suggestedSizes: ["S", "M", "L", "XL", "XXL"],
      textileSpecs: "100% Algodón Francés • 480 GSM • Tratamiento Stonewash",
      productsCount: 4,
      status: "Activo"
    },
    {
      id: "typ-02",
      name: "Chaquetas & Abrigos",
      category: "Abrigos & Outerwear",
      gender: "Unisex",
      suggestedSizes: ["S", "M", "L", "XL"],
      textileSpecs: "Cuero Vacuno / Nylon Balístico 3L • Membrana DWR",
      productsCount: 3,
      status: "Activo"
    },
    {
      id: "typ-03",
      name: "Camisetas Heavyweight",
      category: "Prendas Superiores",
      gender: "Hombre / Mujer",
      suggestedSizes: ["XS", "S", "M", "L", "XL"],
      textileSpecs: "100% Algodón Peinado • 260 GSM • Cuello rib 3cm",
      productsCount: 5,
      status: "Activo"
    },
    {
      id: "typ-04",
      name: "Pantalones & Cargos",
      category: "Prendas Inferiores",
      gender: "Unisex",
      suggestedSizes: ["S", "M", "L", "XL"],
      textileSpecs: "Sarga Reforzada 380 GSM • Broches Magnéticos",
      productsCount: 4,
      status: "Activo"
    },
    {
      id: "typ-05",
      name: "Sastrería & Blazers",
      category: "Sastrería & Trajes",
      gender: "Mujer / Hombre",
      suggestedSizes: ["XS", "S", "M", "L"],
      textileSpecs: "Lana Fría y Viscosa • Forro de Cupro • Solapa asimétrica",
      productsCount: 2,
      status: "Activo"
    }
  ];

  const displayTypes = types && types.length > 0 ? types : defaultTypes;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Estructura & Tipología
          </p>
          <h2 className="text-xl font-black text-slate-900">
            Tipos de Prenda y Categorías ({displayTypes.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenAddType}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-sm hover:bg-black cursor-pointer transition"
        >
          <Plus size={16} />
          <span>Nuevo Tipo</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3.5">Tipo de Prenda</th>
              <th className="px-4 py-3.5">Clasificación</th>
              <th className="px-4 py-3.5">Género</th>
              <th className="px-4 py-3.5">Matriz de Tallas</th>
              <th className="px-4 py-3.5">Especificación Textil</th>
              <th className="px-4 py-3.5 text-center">Prendas</th>
              <th className="px-4 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {displayTypes.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-800">
                      <Layers size={14} />
                    </div>
                    <span className="font-black text-slate-900">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-slate-600">{t.category}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                    {t.gender}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {t.suggestedSizes?.map((s) => (
                      <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-500 font-medium">{t.textileSpecs}</td>
                <td className="px-4 py-3.5 text-center font-black text-slate-900">
                  {t.productsCount || 0} prendas
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditType?.(t)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeToDelete(t)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/60 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Personalizado de Confirmación */}
      <ConfirmDeleteModal
        isOpen={!!typeToDelete}
        onClose={() => setTypeToDelete(null)}
        onConfirm={() => {
          if (typeToDelete) {
            onDeleteType?.(typeToDelete.id);
            setTypeToDelete(null);
          }
        }}
        title="¿Estás seguro de eliminar este tipo de prenda?"
        itemName={typeToDelete?.name}
        description="Esta acción eliminará la tipología y matriz de tallas asociada del catálogo."
      />
    </div>
  );
}
