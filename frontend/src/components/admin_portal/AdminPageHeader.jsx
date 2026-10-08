import React from 'react';

/**
 * AdminPageHeader - Encabezado compartido para vistas administrativas
 * Incluye slots para QuickActionButtons y SummaryPanel según Rapi_turbo.
 */
export function AdminPageHeader({
  eyebrow = 'Resumen',
  title = 'Hola, TITULO Studio',
  description = 'Gestiona órdenes, catálogo de prendas, dark stores y despachos en tiempo real.',
  children,
  right,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:p-6">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            {description}
          </p>
          {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
        </div>
        {right ? <div className="w-full md:w-auto md:min-w-[240px]">{right}</div> : null}
      </div>
    </section>
  );
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  color = 'bg-slate-950 text-white hover:bg-black',
  badge,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-black transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 ${color}`}
    >
      {Icon && <Icon size={17} />}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

export function SummaryPanel({
  gross = "$ 0",
  orders = 0,
  branches = 1,
  products = 8,
  dateLabel = "Hoy",
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Resumen del periodo
        </p>
        <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
          {dateLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl px-3 py-2.5 bg-slate-900 text-white shadow-sm">
          <p className="text-[10px] font-bold text-slate-400">Ventas</p>
          <p className="mt-0.5 text-base font-black tabular-nums text-emerald-400">{gross}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5 bg-white ring-1 ring-slate-100">
          <p className="text-[10px] font-bold text-slate-500">Órdenes</p>
          <p className="mt-0.5 text-base font-black tabular-nums text-slate-900">{orders}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5 bg-white ring-1 ring-slate-100">
          <p className="text-[10px] font-bold text-slate-500">Tiendas</p>
          <p className="mt-0.5 text-base font-black tabular-nums text-slate-900">{branches}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5 bg-white ring-1 ring-slate-100">
          <p className="text-[10px] font-bold text-slate-500">En catálogo</p>
          <p className="mt-0.5 text-base font-black tabular-nums text-slate-900">{products}</p>
        </div>
      </div>
    </div>
  );
}
