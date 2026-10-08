import React from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

/**
 * OperationalChecklist - Módulo de checklist de preparación diaria
 * Copiado exactamente de Rapi_turbo/src/modules/business/components/OperationalChecklist.tsx
 */
export function OperationalChecklist({ items = [] }) {
  const evaluated = items.length;
  const ready = items.filter((item) => item.ready).length;
  const progress = evaluated ? Math.round((ready / evaluated) * 100) : null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Preparación diaria
          </p>
          <h3 className="text-xl font-black text-slate-950">Checklist Operativo</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
          {progress === null ? 'Sin datos' : `${progress}%`}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.ready ? CheckCircle2 : CircleDashed;
          return (
            <div key={item.label} className="flex gap-3 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100/60">
              <Icon className={item.ready ? 'text-emerald-600 shrink-0 mt-0.5' : 'text-slate-400 shrink-0 mt-0.5'} size={20} />
              <div>
                <p className="font-black text-slate-900">{item.label}</p>
                <p className="text-sm font-semibold text-slate-500">{item.helper}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
