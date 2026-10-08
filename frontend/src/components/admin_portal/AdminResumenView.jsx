import React from 'react';
import {
  ShoppingBag,
  CircleDollarSign,
  Store,
  Package,
  Plus,
  ClipboardList,
  TrendingUp,
  Bell,
  Check,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { formatThousands, formatUSD, formatCOP } from '../../services/currencyService';

/**
 * AdminResumenView - Réplica exacta 100% de la interfaz de referencia (Image 1)
 * Adaptada exclusivamente al modelo de negocio de E-Commerce de moda
 */
export function AdminResumenView({
  products = [],
  orders = [],
  pendingOrders = 0,
  inPrepOrders = 0,
  incidentOrders = 0,
  onAddProduct,
  onNavigateOrders,
  onNavigateStores,
  onNavigateMenu,
  onNavigateAnalytics,
}) {
  const availableProductsCount = products.filter(
    (p) => p.status !== 'out_of_stock'
  ).length;

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const todayStr = "25/09/2026";

  const checklistItems = [
    { label: "Negocio visible", ready: true, helper: "Abierto" },
    { label: "Locales listos", ready: true, helper: "3 bodegas operando" },
    { label: "Catálogo en línea", ready: true, helper: `${products.length} prendas sincronizadas` },
    { label: "Pasarela de pagos", ready: true, helper: "Wompi / Tarjetas activo" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Header con Resumen del Periodo y Quick Actions */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              RESUMEN EJECUTIVO
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Hola, Kamil Shop
            </h1>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Gestiona pedidos, catálogo de ropa, marcas de moda, inventario multi-bodega y despachos nacionales.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onAddProduct}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-black"
              >
                <Plus size={16} />
                <span>Nueva Prenda</span>
              </button>

              <button
                type="button"
                onClick={onNavigateOrders}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ClipboardList size={15} className="text-slate-400" />
                <span>Ver órdenes</span>
              </button>

              <button
                type="button"
                onClick={onNavigateStores}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Store size={15} className="text-slate-400" />
                <span>Mis tiendas</span>
              </button>

              <button
                type="button"
                onClick={onNavigateAnalytics}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <TrendingUp size={15} className="text-slate-400" />
                <span>Resultados</span>
              </button>
            </div>
          </div>

          {/* Caja Resumen del Periodo (Exacta Image 1) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:w-72">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                RESUMEN DEL PERIODO
              </span>
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                {todayStr}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-900 p-2.5 text-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-400">Ventas</p>
                <p className="mt-0.5 text-base font-black text-emerald-400">{formatUSD(totalSales)}</p>
                <span className="text-[9px] text-emerald-300 block font-mono">≈ {formatCOP(totalSales)}</span>
              </div>
              <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200/60">
                <p className="text-[10px] font-bold text-slate-500">Órdenes</p>
                <p className="mt-0.5 text-base font-black text-slate-900">{formatThousands(orders.length)}</p>
              </div>
              <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200/60">
                <p className="text-[10px] font-bold text-slate-500">Tiendas</p>
                <p className="mt-0.5 text-base font-black text-slate-900">3</p>
              </div>
              <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200/60">
                <p className="text-[10px] font-bold text-slate-500">En catálogo</p>
                <p className="mt-0.5 text-base font-black text-slate-900">{formatThousands(products.length)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cuadrícula de 4 MetricCards Responsivas */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {/* Card 1: ÓRDENES ACTIVAS */}
        <div
          onClick={() => onNavigateOrders?.()}
          className="flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl bg-slate-100 text-slate-800">
            <ShoppingBag size={18} />
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ÓRDENES ACTIVAS
            </p>
            <p className="mt-0.5 sm:mt-1 text-xl sm:text-3xl font-black text-slate-900">
              {formatThousands(pendingOrders + inPrepOrders)}
            </p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400 truncate">{formatThousands(orders.length)} en periodo</p>
          </div>
        </div>

        {/* Card 2: VENTAS DEL PERIODO */}
        <div
          onClick={onNavigateAnalytics}
          className="flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl bg-slate-100 text-slate-800">
            <CircleDollarSign size={18} />
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              VENTAS PERIODO
            </p>
            <p className="mt-0.5 sm:mt-1 text-xl sm:text-3xl font-black text-slate-900 truncate">{formatUSD(totalSales)}</p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-600 font-bold truncate">≈ {formatCOP(totalSales)}</p>
          </div>
        </div>

        {/* Card 3: LOCALES OPERANDO */}
        <div
          onClick={onNavigateStores}
          className="flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl bg-slate-100 text-slate-800">
            <Store size={18} />
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SEDES ACTIVAS
            </p>
            <p className="mt-0.5 sm:mt-1 text-xl sm:text-3xl font-black text-slate-900">3 / 3</p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400 truncate">100% online</p>
          </div>
        </div>

        {/* Card 4: PRODUCTOS DISPONIBLES */}
        <div
          onClick={onNavigateMenu}
          className="flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl bg-slate-100 text-slate-800">
            <Package size={18} />
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              EN CATÁLOGO
            </p>
            <p className="mt-0.5 sm:mt-1 text-xl sm:text-3xl font-black text-slate-900">
              {availableProductsCount}
            </p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400 truncate">{products.length} prendas</p>
          </div>
        </div>
      </section>

      {/* 3. Fila Inferior: Alertas de Pedidos (Izquierda) y Preparación Diaria (Derecha) */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Alertas de Pedidos - Exacto Image 1 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-800">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ESTADO DEL MÓDULO
              </p>
              <h3 className="text-base font-black text-slate-900">
                Alertas de pedidos
              </h3>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Pill 1: PEDIDOS PENDIENTES */}
            <button
              type="button"
              onClick={() => onNavigateOrders?.('NUEVA')}
              className="flex flex-col justify-between rounded-2xl bg-slate-50/80 border border-slate-200 p-3 sm:p-3.5 text-left transition hover:bg-slate-100/90 cursor-pointer"
            >
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-wider leading-tight">
                PEDIDOS PENDIENTES
              </span>
              <p className="my-2 text-xl sm:text-2xl font-black text-slate-900">
                {pendingOrders}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700">
                <Check size={13} />
                <span>Revisar →</span>
              </span>
            </button>

            {/* Pill 2: EN PREPARACIÓN */}
            <button
              type="button"
              onClick={() => onNavigateOrders?.('EN_PICKING')}
              className="flex flex-col justify-between rounded-2xl bg-slate-50/80 border border-slate-200 p-3 sm:p-3.5 text-left transition hover:bg-slate-100/90 cursor-pointer"
            >
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-wider leading-tight">
                EN PREPARACIÓN
              </span>
              <p className="my-2 text-xl sm:text-2xl font-black text-slate-900">
                {inPrepOrders}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700">
                <Info size={13} />
                <span>Picking →</span>
              </span>
            </button>

            {/* Pill 3: PAGO PENDIENTE */}
            <button
              type="button"
              onClick={() => onNavigateOrders?.('PENDIENTE')}
              className="flex flex-col justify-between rounded-2xl bg-slate-50/80 border border-slate-200 p-3 sm:p-3.5 text-left transition hover:bg-slate-100/90 cursor-pointer"
            >
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-wider leading-tight">
                PAGO PENDIENTE
              </span>
              <p className="my-2 text-xl sm:text-2xl font-black text-slate-900">0</p>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700">
                <Check size={13} />
                <span>Validar →</span>
              </span>
            </button>

            {/* Pill 4: CON INCIDENCIA */}
            <button
              type="button"
              onClick={() => onNavigateOrders?.('CON_INCIDENCIA')}
              className="flex flex-col justify-between rounded-2xl bg-rose-50/50 border border-rose-200/60 p-3 sm:p-3.5 text-left transition hover:bg-rose-50 cursor-pointer"
            >
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-rose-600 tracking-wider leading-tight">
                CON INCIDENCIA
              </span>
              <p className="my-2 text-xl sm:text-2xl font-black text-rose-700">{incidentOrders}</p>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-600">
                <Check size={13} />
                <span>Resolver →</span>
              </span>
            </button>
          </div>
        </div>

        {/* Preparación Diaria (Checklist) - Exacto Image 1 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PREPARACIÓN DIARIA
              </p>
              <h3 className="text-base font-black text-slate-900">
                Checklist para vender
              </h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
              100%
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-1">
                <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-900 text-white">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{item.label}</p>
                  <p className="text-[11px] text-slate-400 leading-none">{item.helper}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
