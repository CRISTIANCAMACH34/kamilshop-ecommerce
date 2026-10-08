import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  User,
  MapPin,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { formatThousands, formatUSD, formatCOP } from '../../services/currencyService';

/**
 * OrderDetailDrawer - Modal Centrado para Inspección Completa de Pedidos (E-Commerce)
 * Modales centrados con backdrop blur elegante y estado de entrega por el cliente.
 */
export function OrderDetailDrawer({
  order,
  open,
  onClose,
  onAdvance,
  onOpenDispatch,
}) {
  if (!open || !order) return null;

  const flowSteps = [
    { id: 'NUEVA', label: 'Recibido', desc: 'Pago confirmado en tienda' },
    { id: 'EN_PICKING', label: 'Bodega Picking', desc: 'Alistando prendas en Dark Store' },
    { id: 'DESPACHADA', label: 'En Ruta', desc: 'Con transportadora o mensajería' },
    { id: 'ENTREGADA', label: 'Entregado', desc: 'Confirmado por el cliente' },
  ];

  const currentStepIdx = flowSteps.findIndex((s) => s.id === order.status);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop Centrado con Blur */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Ventana Modal Centrada */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-slate-900">
                {order.code}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-slate-800 ring-1 ring-slate-200">
                {order.status}
              </span>
              {order.shippingType && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  {order.shippingType === 'LOCAL' ? 'Entrega Local' : 'Envío Nacional'}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              SLA objetivo: {order.slaTarget || 15} minutos • Registrado el {new Date(order.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Centrado */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Flujo de Estados Horizontal */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Línea de Vida del Pedido
            </p>
            <div className="grid grid-cols-4 gap-2">
              {flowSteps.map((step, idx) => {
                const isDone = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.id} className="text-center">
                    <div
                      className={`mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-full text-xs font-black transition-colors ${
                        isCurrent
                          ? 'bg-slate-950 text-white ring-4 ring-slate-200'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <p className={`text-[11px] font-bold truncate ${isCurrent ? 'text-slate-950 font-black' : isDone ? 'text-emerald-800' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Info Cliente */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <User size={13} className="text-slate-500" />
                <span>Datos del Cliente</span>
              </div>
              <p className="text-sm font-black text-slate-900">{order.customer}</p>
              <p className="text-xs text-slate-500">{order.email}</p>
              <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-600">
                <MapPin size={13} className="shrink-0 text-slate-400 mt-0.5" />
                <span>{order.address}</span>
              </div>
            </div>

            {/* Info Envío & Transportadora */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Truck size={13} className="text-slate-500" />
                <span>Datos de Transporte</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                Transportadora: <span className="font-black text-slate-950">{order.carrier || 'Mensajería Directa'}</span>
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">Guía de rastreo:</span>
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {order.trackingNumber || 'En asignación'}
                </span>
              </div>
              {order.dispatchedAt && (
                <p className="mt-2 text-[10px] text-slate-400">
                  Despachado: {new Date(order.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>

          {/* Prendas en la Orden */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Package size={14} className="text-slate-500" />
                <span>Prendas en la Orden ({order.items?.length || 0})</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                Total: {formatUSD(order.total || 0)} <span className="text-[11px] font-mono text-emerald-600 font-semibold">(≈ {formatCOP(order.total || 0)})</span>
              </span>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50/50 rounded-xl transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 font-bold">
                          Talla: {item.size || 'M'}
                        </span>
                        {item.color && (
                          <span>Color: <strong>{item.color}</strong></span>
                        )}
                        <span className="font-mono text-slate-400">SKU: {item.sku || 'TTL-ITEM'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">{formatThousands(item.qty || 1)} un x {formatUSD(item.price || 0)}</p>
                    <p className="font-mono font-black text-slate-900 text-xs">
                      {formatUSD((Number(item.qty || 1) * Number(item.price || 0)))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions Centrado */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70">
          {order.status === 'NUEVA' && (
            <button
              type="button"
              onClick={() => {
                onAdvance?.(order.id);
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-black text-white shadow-md hover:bg-black transition-all cursor-pointer"
            >
              <span>Aceptar y Asignar a Bodega (Picking)</span>
              <ChevronRight size={15} />
            </button>
          )}

          {order.status === 'EN_PICKING' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDispatch?.(order);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Truck size={15} />
              <span>Preparar Despacho / Asignar Envío</span>
              <ChevronRight size={15} />
            </button>
          )}

          {order.status === 'DESPACHADA' && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-center text-xs font-bold text-purple-900">
              🚚 En Tránsito: El pedido fue despachado. El cliente marcará la entrega final desde su cuenta en la app.
            </div>
          )}

          {order.status === 'ENTREGADA' && (
            <div className="text-center text-xs font-bold text-emerald-700 py-2">
              ✓ Esta orden fue recibida y confirmada por el cliente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
