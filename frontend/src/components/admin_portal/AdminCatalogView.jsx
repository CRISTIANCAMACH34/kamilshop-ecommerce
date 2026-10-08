import React from 'react';
import { Package, Search, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { formatThousands, formatUSD, formatCOP } from '../../services/currencyService';

/**
 * AdminCatalogView - Gestión de catálogo de prendas adaptado al diseño de Rapi_turbo
 */
export function AdminCatalogView({
  products = [],
  searchTerm = '',
  onSearchChange,
  onOpenAddProduct,
  onOpenCreateProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onToggleAvailability,
  onStockAdjust,
}) {
  const filteredProducts = products.filter((p) =>
    !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Encabezado y Barra de Búsqueda */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Catálogo y Colecciones
          </p>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Prendas y Productos en Catálogo
          </h2>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              className="h-10 w-full sm:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-800 outline-none ring-slate-900/10 focus:border-slate-900 focus:ring-4 placeholder:text-slate-400"
              placeholder="Buscar prenda o SKU..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenCreateProduct ? onOpenCreateProduct() : onOpenAddProduct?.()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-black cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Nueva Prenda</span>
          </button>
        </div>
      </div>

      {/* Tabla de Productos con Estilo Rapi_turbo con scroll horizontal responsivo */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3.5">Prenda / Referencia</th>
              <th className="px-4 py-3.5">Categoría</th>
              <th className="px-4 py-3.5">Precio</th>
              <th className="px-4 py-3.5">Inventario</th>
              <th className="px-4 py-3.5">Disponibilidad Online</th>
              <th className="px-4 py-3.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredProducts.map((prod) => {
              const isAvailable = prod.status !== 'out_of_stock';

              return (
                <tr key={prod.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-11 w-11 rounded-xl object-cover bg-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon size={18} />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-slate-900">{prod.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{prod.sku || `TTL-SKU-${prod.id}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {prod.category || 'Apparel'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-black text-slate-900">{formatUSD(prod.price)}</p>
                    <p className="text-[10px] font-mono text-emerald-600 font-bold">≈ {formatCOP(prod.price)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => onStockAdjust(prod.id, -1)}
                        className="grid h-6 w-6 place-items-center rounded bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                        title="Reducir stock"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-black tabular-nums text-slate-900 text-xs">
                        {formatThousands(prod.stock || 0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onStockAdjust(prod.id, 1)}
                        className="grid h-6 w-6 place-items-center rounded bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                        title="Aumentar stock"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(prod.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
                        isAvailable
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-rose-200 bg-rose-50 text-rose-800'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span>{isAvailable ? 'En Catálogo' : 'Agotado'}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenEditProduct ? onOpenEditProduct(prod) : onOpenAddProduct?.(prod)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 shadow-sm hover:bg-slate-50 font-bold text-[11px] cursor-pointer transition"
                      >
                        <Edit size={12} />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct?.(prod)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 px-2 py-1 text-rose-600 shadow-sm hover:bg-rose-100 font-bold text-[11px] cursor-pointer transition"
                        title={`Eliminar ${prod.name} del catálogo`}
                      >
                        <Trash2 size={12} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
