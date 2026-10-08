import React from 'react';
import { BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';

/**
 * AdminAnalyticsView - Resultados, métricas y analítica operacional estilo Rapi_turbo
 */
export function AdminAnalyticsView() {
  const hourlyData = [
    { hour: '09:00', orders: 4, height: '40%' },
    { hour: '10:00', orders: 7, height: '70%' },
    { hour: '11:00', orders: 12, height: '100%' },
    { hour: '12:00', orders: 9, height: '80%' },
    { hour: '13:00', orders: 10, height: '90%' },
    { hour: '14:00', orders: 6, height: '60%' },
    { hour: '15:00', orders: 8, height: '75%' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Desempeño y eficiencia
        </p>
        <h2 className="text-xl font-black text-slate-900">
          Resultados y Analítica Operacional
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cumplimiento de SLA
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-600">98.4%</p>
          <p className="mt-1 text-xs text-slate-500">Meta operativa: &gt; 95%</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tiempo Promedio Picking
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-950">11.4 min</p>
          <p className="mt-1 text-xs text-slate-500">Objetivo: 15.0 min</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <AlertCircle size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tasa de Incidencias
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900">0.0%</p>
          <p className="mt-1 text-xs text-slate-500">0 cancelaciones hoy</p>
        </div>
      </div>

      {/* Gráfico de Volumen Horario */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Flujo del día
            </p>
            <h3 className="text-base font-black text-slate-900">
              Volumen Horario de Órdenes
            </h3>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 ring-1 ring-slate-200">
            Hoy
          </span>
        </div>

        <div className="flex items-end gap-4 h-44 pt-4 border-b border-slate-100">
          {hourlyData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                style={{ height: item.height }}
                className="w-full rounded-t-xl bg-slate-900 transition-all hover:bg-black cursor-pointer"
                title={`${item.orders} órdenes`}
              />
              <span className="text-[11px] font-bold text-slate-400">{item.hour}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
