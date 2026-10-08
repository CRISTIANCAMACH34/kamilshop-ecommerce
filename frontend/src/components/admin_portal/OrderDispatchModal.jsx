import React, { useState } from 'react';
import { X, Truck, Send, MapPin, Package, Check, Mail, Bell } from 'lucide-react';
import { formatUSD, formatCOP } from '../../services/currencyService';

/**
 * OrderDispatchModal - Modal Centrado para Despacho de Pedidos
 * Soporta lógica diferenciada para entrega local (misma ciudad) vs envío nacional (otra ciudad con guía obligatoria).
 */
export function OrderDispatchModal({
  open,
  order,
  onClose,
  onConfirmDispatch,
}) {
  const [shippingType, setShippingType] = useState('LOCAL'); // 'LOCAL' | 'NACIONAL'
  const [carrier, setCarrier] = useState('Mensajería Directa Local');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [city, setCity] = useState(order?.address?.includes('Medellín') ? 'Medellín' : (order?.address?.includes('Cali') ? 'Cali' : 'Bogotá'));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!open || !order) return null;

  const nationalCarriers = [
    'Coordinadora Express',
    'Servientrega',
    'Interrapidísimo',
    'Envía Colvanes',
    'TCC Transportadora',
    'Deprisa',
  ];

  const handleTypeChange = (type) => {
    setShippingType(type);
    setError('');
    if (type === 'LOCAL') {
      setCarrier('Mensajería Directa Local');
      setTrackingNumber('');
    } else {
      setCarrier('Coordinadora Express');
      setTrackingNumber(`CRD-${Math.floor(100000 + Math.random() * 900000)}-CO`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (shippingType === 'NACIONAL') {
      if (!carrier.trim()) {
        setError('Debes seleccionar o ingresar una transportadora nacional.');
        return;
      }
      if (!trackingNumber.trim()) {
        setError('El número de guía es obligatorio para envíos nacionales hacia otra ciudad.');
        return;
      }
    }

    onConfirmDispatch(order.id, {
      shippingType,
      carrier,
      trackingNumber: trackingNumber.trim(),
      city: city.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Ventana Modal Centrada */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Logística de Despacho
              </p>
              <h2 className="text-base font-black text-slate-900">
                Preparar Envío • {order.code}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Resumen del Pedido */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Cliente: {order.customer}</span>
              <span className="font-mono text-xs">{formatUSD(order.total || 0)} <span className="text-[10px] text-emerald-600 font-semibold">(≈ {formatCOP(order.total || 0)})</span></span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin size={12} className="text-slate-400" />
              <span>{order.address}</span>
            </p>
            <div className="mt-2 text-[11px] text-slate-600 font-medium">
              Prendas: {order.items?.map(it => `${it.qty}x ${it.name} (${it.size})`).join(', ')}
            </div>
          </div>

          {/* Selector de Tipo de Envío */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Tipo de Destino y Entrega *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('LOCAL')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  shippingType === 'LOCAL'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Misma Ciudad</span>
                <span className={`text-[10px] font-normal mt-0.5 ${shippingType === 'LOCAL' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Entrega Local Express
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('NACIONAL')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  shippingType === 'NACIONAL'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Otra Ciudad</span>
                <span className={`text-[10px] font-normal mt-0.5 ${shippingType === 'NACIONAL' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Envío Nacional (con Guía)
                </span>
              </button>
            </div>
          </div>

          {/* Ciudad Destino */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ciudad Destino *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
              placeholder="Ej. Bogotá, Medellín, Cali, Barranquilla"
              required
            />
          </div>

          {/* Si es Nacional: Transportadora y Número de Guía Obligatorio */}
          {shippingType === 'NACIONAL' ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Empresa Transportadora *
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                >
                  {nationalCarriers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-900">
                    Número de Guía de Transporte *
                  </label>
                  <span className="text-[10px] font-bold text-slate-600">Requerido</span>
                </div>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs font-bold text-slate-900 outline-none focus:border-slate-900 placeholder:text-slate-400"
                  placeholder="Ej. CRD-9982410-CO"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
              <Check size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Entrega Local en la Misma Ciudad</p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Para envíos locales no se exige número de guía nacional. Se coordinará con mensajería directa o Dark Store más cercana.
                </p>
              </div>
            </div>
          )}

          {/* Notificación y Correo al Cliente */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Mail size={13} className="text-slate-600" />
              <span>Notificación Automática al Cliente</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Al confirmar el despacho, se enviará una notificación in-app y correo a <strong>{order.email}</strong>. El pedido quedará en estado <strong>DESPACHADO</strong> hasta que el cliente confirme la entrega.
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-bold text-rose-700">
              {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-xs font-black text-white hover:bg-black transition shadow-sm"
            >
              <Send size={14} />
              <span>Confirmar Despacho y Notificar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
