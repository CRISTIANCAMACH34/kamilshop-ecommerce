import React from 'react';
import { OrderCard } from './OrderCard';
import { formatUSD, formatThousands } from '../../services/currencyService';

/**
 * OrderKanbanBoard - Tablero Kanban oficial copiado de Rapi_turbo OrderKanbanBoard.tsx
 */
export function OrderKanbanBoard({
  orders = [],
  onAdvanceStatus,
  onOpenDispatch,
  onSimulateOrder,
  onViewOrder,
  onReportIncident,
}) {
  const columns = [
    { id: 'NUEVA', title: 'Aceptar', dotColor: 'bg-slate-500', countColor: 'text-slate-700' },
    { id: 'EN_PICKING', title: 'Preparar', dotColor: 'bg-slate-800', countColor: 'text-slate-800' },
    { id: 'DESPACHADA', title: 'Listos / En Ruta', dotColor: 'bg-purple-500', countColor: 'text-purple-700' },
    { id: 'ENTREGADA', title: 'Cierre / Finalizados', dotColor: 'bg-emerald-500', countColor: 'text-emerald-700' },
  ];

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Operación en tiempo real
          </p>
          <h2 className="text-xl font-black text-slate-900">
            Tablero de Órdenes y Picking
          </h2>
        </div>

        <button
          type="button"
          onClick={onSimulateOrder}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-black"
        >
          <span>+</span>
          <span>Simular Orden Entrante</span>
        </button>
      </div>

      <section className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => {
          const colOrders = orders.filter((o) => o.status === column.id);
          const colTotal = colOrders.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

          return (
            <div
              key={column.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80"
              style={{ minHeight: '520px', maxHeight: 'min(74vh, 700px)' }}
            >
              {/* Header de Columna */}
              <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200 bg-slate-50/95 px-3 py-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
                    <h3 className="text-sm font-black text-slate-900">{column.title}</h3>
                  </div>
                  <span className="grid h-6 min-w-[22px] place-items-center rounded-full bg-slate-200 px-1.5 text-[11px] font-black text-slate-700">
                    {formatThousands(colOrders.length)}
                  </span>
                </div>
                {colOrders.length > 0 && (
                  <p className="mt-1 text-[11px] font-bold text-slate-500 font-mono">
                    {formatUSD(colTotal)}
                  </p>
                )}
              </div>

              {/* Lista de Tarjetas */}
              <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-2.5">
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAdvance={onAdvanceStatus}
                    onOpenDispatch={onOpenDispatch}
                    onView={onViewOrder}
                    onReportIncident={onReportIncident}
                    minimal={column.id === 'ENTREGADA'}
                  />
                ))}

                {colOrders.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-8 text-center text-xs font-semibold text-slate-400">
                    Sin órdenes en esta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
