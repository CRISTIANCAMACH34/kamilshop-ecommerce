import React from 'react';

/**
 * BusinessStoreToggle - Toggle de tienda abierta / pausada
 * Copiado exactamente de Rapi_turbo/src/modules/business/components/BusinessStoreToggle.tsx
 */
export function BusinessStoreToggle({ isOpen = true, onToggle, compact = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
        isOpen
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
      }`}
      title={isOpen ? 'Click para pausar recepción de pedidos' : 'Click para abrir recepción de pedidos'}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
        }`}
      />
      <span>{isOpen ? 'Tienda abierta' : 'Tienda pausada'}</span>
    </button>
  );
}
