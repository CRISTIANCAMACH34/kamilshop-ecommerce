import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Save } from 'lucide-react';

export function OrderIncidentModal({ order, open, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [incidentType, setIncidentType] = useState('agotado');

  if (!open || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onSubmit?.(order.id, `${incidentType.toUpperCase()}: ${reason}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gestión de Incidencias // {order.code}
              </p>
              <h2 className="text-base font-black text-slate-900">
                Reportar Problema en Pedido
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-2xl bg-rose-50/60 p-3.5 text-xs font-medium text-rose-900 border border-rose-200">
            Reportar una incidencia pausará el SLA de despacho y notificará al equipo de atención al cliente para contactar a <strong>{order.customer}</strong>.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tipo de Incidencia
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="agotado">Prenda o talla agotada en bodega física</option>
              <option value="direccion">Dirección incompleta o no encontrada</option>
              <option value="contacto">Cliente no responde al despachador</option>
              <option value="transportadora">Retraso crítico de transportadora</option>
              <option value="calidad">Defecto detectado en control de calidad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detalle y Observaciones *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explica detalladamente la novedad para el equipo de soporte..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
            >
              <AlertCircle size={14} />
              <span>Registrar Incidencia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
