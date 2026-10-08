import React, { useState } from 'react';
import { Store, MapPin, Clock, Plus, Globe, ShieldCheck, Sparkles, Building2, Edit3, Trash2 } from 'lucide-react';
import { AdminHelpBadge } from './AdminHelpBadge';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export function AdminStoresView({ stores = [], onOpenAddBranch, onEditBranch, onDeleteBranch }) {
  const [storeToDelete, setStoreToDelete] = useState(null);

  const defaultStores = [
    {
      id: "hub-01",
      name: "Bodega Central Kamil Shop — Centro de Despachos",
      type: "Centro de Despacho & Fulfillment (Importaciones USA)",
      status: "100% Operando Online",
      address: "Centro Logístico de Despachos Nacionales",
      sla: "24h despacho nacional",
      capacity: "Alta (Cobertura Nacional en toda Colombia)",
      statusBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      isPrimary: true,
    }
  ];

  const displayStores = stores.length > 0 ? stores : defaultStores;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Infraestructura Operacional • KAMIL SHOP
            </p>
            <AdminHelpBadge
              title="¿Para qué es esta sección?"
              text="Aquí administras el Centro de Despacho donde se empaca y envía la ropa importada de EE.UU. hacia toda Colombia."
            />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Almacén Digital & Centro de Despacho
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operación 100% Tienda Online • Preparado con arquitectura multi-sede escalable
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddBranch}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm hover:bg-black transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>+ Agregar Centro Logístico</span>
        </button>
      </div>

      {/* Banner Informativo de Tienda Online */}
      <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 text-blue-950 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-black text-sm">
          <Globe size={18} className="text-blue-600" />
          <span>Modelo de Negocio: Tienda Online 100% Digital</span>
        </div>
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>KAMIL SHOP</strong> no cuenta con locales comerciales de venta presencial al público.
          Todas las ventas se generan exclusivamente a través de la tienda web y se despachan desde la <strong>Bodega Central Kamil Shop</strong> para entrega a domicilio en toda Colombia.
        </p>
        <p className="text-[11px] text-blue-800 font-medium">
          ⚙️ <em>Arquitectura Escalable:</em> El sistema está diseñado para que en el momento en que desees abrir sucursales físicas o almacenes satélites en otras ciudades, puedas activarlos sin rehacer el software.
        </p>
      </div>

      {/* Tarjetas de Dark Stores / Centros de Despacho */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayStores.map((s, idx) => (
          <div
            key={s.id || idx}
            className={`flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition hover:shadow-md ${
              s.isPrimary ? 'border-slate-950 bg-white ring-2 ring-slate-950/5' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${
                  s.isPrimary ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <Building2 size={20} />
                </div>
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.statusBadge}`}
                >
                  {s.status}
                </span>
              </div>

              <h3 className="mt-3 text-base font-black text-slate-900">{s.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">{s.type}</p>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin size={13} className="shrink-0 text-slate-400" />
                <span>{s.address}</span>
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                <span>SLA: <strong>{s.sla || '24h'}</strong></span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEditBranch?.(s)}
                  title="Editar Centro Logístico"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Edit3 size={11} />
                  <span>Editar</span>
                </button>
                {!s.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setStoreToDelete(s)}
                    title="Eliminar Centro Logístico"
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Confirmación Borrar Centro Logístico */}
      <ConfirmDeleteModal
        isOpen={!!storeToDelete}
        onClose={() => setStoreToDelete(null)}
        onConfirm={() => {
          if (storeToDelete) {
            onDeleteBranch?.(storeToDelete.id);
            setStoreToDelete(null);
          }
        }}
        title="¿Estás seguro de eliminar este centro logístico?"
        itemName={storeToDelete?.name}
        description="Esta acción desactivará las operaciones de despacho asociadas a este centro."
      />
    </div>
  );
}
