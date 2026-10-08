import React from 'react';
import { Users, Mail, ShoppingBag } from 'lucide-react';
import { formatUSD, formatThousands } from '../../services/currencyService';

/**
 * AdminTeamView - Directorio de clientes CRM y accesos RBAC estilo Rapi_turbo
 */
export function AdminTeamView({ customers = [], onOpenAddMember }) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Gestión de clientes & accesos
          </p>
          <h2 className="text-xl font-black text-slate-900">
            Directorio de Clientes y Staff (Google, Apple, Facebook)
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenAddMember}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm hover:bg-black cursor-pointer transition-all"
        >
          <Users size={16} />
          <span>+ Nuevo Miembro</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3.5">Cliente</th>
              <th className="px-4 py-3.5">Autenticación</th>
              <th className="px-4 py-3.5">Nivel / Tier</th>
              <th className="px-4 py-3.5">Total Gastado</th>
              <th className="px-4 py-3.5 text-right">Pedidos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {customers.map((c) => {
              const providerConfig = {
                google: { bg: 'bg-rose-50 text-rose-700 border-rose-200' },
                apple: { bg: 'bg-slate-100 text-slate-800 border-slate-300' },
                facebook: { bg: 'bg-blue-50 text-blue-700 border-blue-200' },
              }[c.provider] || { bg: 'bg-slate-50 text-slate-600 border-slate-200' };

              return (
                <tr key={c.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <p className="font-black text-slate-900">{c.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Mail size={11} />
                      <span>{c.email}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${providerConfig.bg}`}
                    >
                      {c.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700">{c.tier}</td>
                  <td className="px-4 py-3.5 font-mono font-black text-slate-900">
                    {formatUSD(c.totalSpent)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600 font-bold">
                    {formatThousands(c.ordersCount)} pedidos
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
