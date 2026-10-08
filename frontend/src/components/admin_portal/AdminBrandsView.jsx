import React, { useState } from 'react';
import { Award, Plus, Globe, CheckCircle2, Package, Edit3, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export function AdminBrandsView({ brands = [], onOpenAddBrand, onEditBrand, onDeleteBrand }) {
  const [brandToDelete, setBrandToDelete] = useState(null);

  const defaultBrands = [
    {
      id: "br-01",
      name: "Kamil Shop Studio",
      initials: "KS",
      tier: "Línea Principal / Luxury",
      country: "Bogotá, Colombia",
      description: "Colección principal contemporánea que combina siluetas arquitectónicas, acabados brutales y confección artesanal.",
      productsCount: 6,
      status: "Activa"
    },
    {
      id: "br-02",
      name: "Noir Archive",
      initials: "NA",
      tier: "Streetwear Heavyweight",
      country: "Medellín, Colombia",
      description: "Prendas confeccionadas en algodón francés de 480 GSM con teñido al frío y lavados minerales.",
      productsCount: 4,
      status: "Activa"
    },
    {
      id: "br-03",
      name: "Atelier Kamil Shop",
      initials: "KS",
      tier: "Alta Costura & Sastrería",
      country: "Estados Unidos (USA)",
      description: "Colección exclusiva y siluetas importadas directamente de USA con acabados de alta gama.",
      productsCount: 3,
      status: "Activa"
    },
    {
      id: "br-04",
      name: "Minimalist Techwear",
      initials: "MT",
      tier: "Funcional & DWR",
      country: "Cali, Colombia",
      description: "Siluetas utilitarias impermeables con cierres termosellados y nylon balístico micro-ripstop.",
      productsCount: 2,
      status: "Activa"
    }
  ];

  const displayBrands = brands && brands.length > 0 ? brands : defaultBrands;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Catálogo & Líneas de Diseño
          </p>
          <h2 className="text-xl font-black text-slate-900">
            Marcas de Moda ({displayBrands.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenAddBrand}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-sm hover:bg-black cursor-pointer transition"
        >
          <Plus size={16} />
          <span>Nueva Marca</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayBrands.map((b) => (
          <div
            key={b.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 font-mono text-base font-black text-white shadow-xs">
                  {b.initials}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {b.status || 'Activa'}
                  </span>
                </div>
              </div>

              <h3 className="mt-3 text-base font-black text-slate-900">{b.name}</h3>
              <p className="text-xs font-bold text-amber-700">{b.tier}</p>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {b.description}
              </p>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <Globe size={12} className="text-slate-400" />
                  <span>{b.country}</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Package size={12} className="text-slate-400" />
                  <span>{b.productsCount || 0} prendas</span>
                </span>
              </div>

              {/* Barra de Acciones CRUD: Editar y Eliminar */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-2">
                <button
                  type="button"
                  onClick={() => onEditBrand?.(b)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBrandToDelete(b)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/60 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Personalizado de Confirmación */}
      <ConfirmDeleteModal
        isOpen={!!brandToDelete}
        onClose={() => setBrandToDelete(null)}
        onConfirm={() => {
          if (brandToDelete) {
            onDeleteBrand?.(brandToDelete.id);
            setBrandToDelete(null);
          }
        }}
        title="¿Estás seguro de eliminar esta marca?"
        itemName={brandToDelete?.name}
        description="Al eliminar esta marca de moda, se desvinculará de las prendas asociadas en tu catálogo."
      />
    </div>
  );
}
