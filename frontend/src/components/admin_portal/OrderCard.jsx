import React, { useState, useRef, useEffect } from 'react';
import { Clock, CreditCard, Store, MoreHorizontal, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { formatUSD, formatCOP } from '../../services/currencyService';

/**
 * OrderCard - Tarjeta individual de orden con acciones de flujo
 * Copiado exactamente de Rapi_turbo/src/modules/business/components/OrderCard.tsx
 */
export function OrderCard({
  order,
  onAdvance,
  onView,
  onReportIncident,
  onOpenDispatch,
  minimal = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  let accent = 'border-l-slate-900';
  if (order.status === 'NUEVA') accent = 'border-l-slate-400';
  if (order.status === 'EN_PICKING') accent = 'border-l-slate-800';
  if (order.status === 'DESPACHADA') accent = 'border-l-purple-500';
  if (order.status === 'ENTREGADA') accent = 'border-l-emerald-500';

  if (minimal) {
    return (
      <div
        onClick={() => onView?.(order)}
        className={`flex w-full cursor-pointer flex-col gap-1 rounded-xl border border-slate-200 border-l-[3px] ${accent} bg-white px-3 py-2 text-left shadow-sm hover:border-slate-400 hover:bg-slate-50`}
      >
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-black text-slate-900">{order.code}</p>
          <span className="text-xs font-black text-slate-800">{formatUSD(order.total || 0)}</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-500 truncate">{order.customer}</p>
      </div>
    );
  }

  return (
    <article className={`rounded-2xl border border-slate-200 border-l-[4px] ${accent} bg-white p-3.5 shadow-sm transition hover:shadow-md`}>
      <div
        onClick={() => onView?.(order)}
        className="flex cursor-pointer items-start justify-between gap-2"
      >
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
            {order.code}
          </span>
          <p className="mt-1 text-sm font-black text-slate-950 truncate hover:text-slate-700 transition-colors">
            {order.customer}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Store size={11} className="shrink-0 text-slate-400" />
            <span className="truncate">{order.address || 'Dirección registrada en pedido'}</span>
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-black text-slate-950">
            {formatUSD(order.total || 0)}
          </p>
          <span className="text-[10px] font-mono text-emerald-600 font-bold block">
            ≈ {formatCOP(order.total || 0)}
          </span>
          <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {order.status}
          </span>
        </div>
      </div>

      {/* Items de la Orden */}
      <div className="mt-2.5 rounded-xl bg-slate-50 p-2 text-xs">
        {order.items?.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between text-slate-700">
            <span className="truncate font-semibold">
              {it.qty}x {it.name}
            </span>
            <span className="ml-2 shrink-0 font-mono text-[11px] text-slate-400">
              Talla {it.size || 'M'}
            </span>
          </div>
        ))}
      </div>

      {/* Metadatos: ETA y Pago */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CreditCard size={11} className="text-slate-400" />
          <span>Tarjeta / Online</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={11} className="text-slate-400" />
          <span className={order.elapsedMins > (order.slaTarget || 15) ? 'text-rose-600 font-black' : 'text-slate-600'}>
            {order.elapsedMins}m / SLA {order.slaTarget || 15}m
          </span>
        </span>
      </div>

      {/* Acciones de Flujo */}
      <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
        {order.status === 'NUEVA' && (
          <button
            type="button"
            onClick={() => onAdvance(order.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2 px-2 text-[11px] sm:text-xs font-black text-white transition hover:bg-black cursor-pointer min-w-0"
          >
            <span className="truncate">Aceptar y Alistar</span>
            <ChevronRight size={14} className="shrink-0" />
          </button>
        )}

        {order.status === 'EN_PICKING' && (
          <button
            type="button"
            onClick={() => onOpenDispatch ? onOpenDispatch(order) : onAdvance(order.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 px-2 text-[11px] sm:text-xs font-black text-white transition hover:bg-slate-800 cursor-pointer shadow-xs min-w-0"
          >
            <span className="truncate">Despachar / Enviar</span>
            <ChevronRight size={14} className="shrink-0" />
          </button>
        )}

        {order.status === 'DESPACHADA' && (
          <div className="flex-1 rounded-xl bg-purple-50 border border-purple-200 px-2 py-1.5 text-center text-[10px] font-bold text-purple-900">
            🚚 En ruta • Esperando cliente
          </div>
        )}

        {order.status === 'ENTREGADA' && (
          <div className="w-full text-center text-xs font-bold text-emerald-700 py-1">
            ✓ Entregado y confirmado por el cliente
          </div>
        )}

        {order.status !== 'ENTREGADA' && (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              title="Más acciones"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 z-30 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onView?.(order);
                  }}
                  className="block w-full px-3 py-1.5 text-left font-bold text-slate-700 hover:bg-slate-50"
                >
                  Ver Detalles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onReportIncident?.(order);
                  }}
                  className="block w-full px-3 py-1.5 text-left font-bold text-rose-600 hover:bg-rose-50"
                >
                  Reportar Incidencia
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
