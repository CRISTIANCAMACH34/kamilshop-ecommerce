import React, { useState } from 'react';
import { X, Bell, ShoppingBag, AlertTriangle, Truck, UserPlus, Check } from 'lucide-react';

export function AdminNotificationsDrawer({ open, onClose, onNavigateOrders, orders = [], products = [] }) {
  // Generar notificaciones en tiempo real basadas en órdenes y stock reales
  const [cleared, setCleared] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  if (!open) return null;

  const dynamicAlerts = [];

  // 1. Órdenes nuevas por despachar
  orders.forEach((ord) => {
    if (ord.status === 'NUEVA' || ord.status === 'EN_PICKING') {
      dynamicAlerts.push({
        id: `alert-ord-${ord.id || ord.code}`,
        title: 'Orden para alistamiento',
        desc: `Orden ${ord.code} de ${ord.customer || 'Cliente'} recibida (${ord.items?.length || 0} prendas).`,
        severity: 'info',
        time: ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
      });
    } else if (ord.status === 'CON_INCIDENCIA') {
      dynamicAlerts.push({
        id: `alert-inc-${ord.id || ord.code}`,
        title: 'Incidencia en Orden',
        desc: `Orden ${ord.code}: ${ord.incidentReason || 'Problema reportado en entrega'}.`,
        severity: 'warning',
        time: 'Atención requerida',
      });
    }
  });

  // 2. Alertas de stock crítico real en catálogo
  products.forEach((p) => {
    const stockVal = typeof p.total_stock === 'function' ? p.total_stock() : (p.total_stock ?? p.stock ?? 0);
    if (stockVal > 0 && stockVal <= 3) {
      dynamicAlerts.push({
        id: `alert-stock-${p.id}`,
        title: 'Alerta de Stock Crítico',
        desc: `Quedan solo ${stockVal} unidades de ${p.name || p.nombre}.`,
        severity: 'warning',
        time: 'Inventario bajo',
      });
    }
  });

  const alerts = cleared ? [] : dynamicAlerts.map(a => ({
    ...a,
    unread: !readIds.has(a.id)
  }));

  const markAllAsRead = () => {
    setReadIds(new Set(dynamicAlerts.map(a => a.id)));
  };

  const clearAlerts = () => {
    setCleared(true);
  };

  const unreadCount = alerts.filter(a => a.unread).length;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Centrado */}
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operación en Tiempo Real
              </p>
              <h2 className="text-base font-black text-slate-900">
                Alertas y Notificaciones ({unreadCount})
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-xs">
          <button
            type="button"
            onClick={markAllAsRead}
            className="font-bold text-slate-900 hover:text-black transition-colors cursor-pointer"
          >
            Marcar todas como leídas
          </button>
          <button
            type="button"
            onClick={clearAlerts}
            className="font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            Limpiar bandeja
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-xs font-medium text-slate-400">
              No tienes notificaciones pendientes
            </div>
          ) : (
            alerts.map((alt) => {
              let Icon = Bell;
              let iconBg = 'bg-slate-100 text-slate-700';

              if (alt.severity === 'info') {
                Icon = ShoppingBag;
                iconBg = 'bg-slate-100 text-slate-900';
              } else if (alt.severity === 'warning') {
                Icon = AlertTriangle;
                iconBg = 'bg-slate-200 text-slate-800';
              } else if (alt.severity === 'success') {
                Icon = Truck;
                iconBg = 'bg-emerald-100 text-emerald-800';
              }

              return (
                <div
                  key={alt.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 transition ${
                    alt.unread
                      ? 'border-slate-300 bg-slate-50/80 shadow-xs'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${iconBg}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {alt.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {alt.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {alt.desc}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateOrders?.();
            }}
            className="w-full rounded-xl bg-slate-950 py-2.5 text-xs font-black text-white hover:bg-black transition-colors cursor-pointer"
          >
            Ir al Tablero de Órdenes
          </button>
        </div>
      </div>
    </div>
  );
}
