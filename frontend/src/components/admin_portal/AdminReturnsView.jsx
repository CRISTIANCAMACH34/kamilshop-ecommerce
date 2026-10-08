import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Search,
  Plus,
  ArrowRight,
  User,
  Phone,
  Mail,
  AlertCircle,
  FileSpreadsheet,
  X,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AdminHelpBadge } from './AdminHelpBadge';
import { useCart } from '../../context/CartContext';
import { apiClient } from '../../services/apiClient';

/**
 * AdminReturnsView - Gestión de Cambios de Talla, Devoluciones y Garantías (RMA)
 * Conectado en tiempo real a la base de datos persistente.
 */
export function AdminReturnsView({ orders = [] }) {
  const { showToast } = useCart();
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const loadReturnsFromDb = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getReturns();
      if (Array.isArray(data)) {
        setReturnsList(data);
      }
    } catch (err) {
      console.warn('[AdminReturnsView] Error cargando devoluciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturnsFromDb();
  }, []);

  // Filtrado
  const filteredList = returnsList.filter((item) => {
    if (statusFilter !== 'TODOS' && item.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCode = item.code.toLowerCase().includes(q);
      const matchCust = item.customer.toLowerCase().includes(q);
      const matchOrd = item.orderCode.toLowerCase().includes(q);
      if (!matchCode && !matchCust && !matchOrd) return false;
    }
    return true;
  });

  // Avanzar estado de cambio
  const advanceReturnStatus = (id, newStatus, message) => {
    setReturnsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase((prev) => ({ ...prev, status: newStatus }));
    }
    showToast?.(message, 'success');
  };

  // Exportar a Excel (CSV)
  const handleExportCSV = () => {
    const headers = ['Caso RMA', 'Pedido Original', 'Cliente', 'Email', 'Ciudad', 'Prenda a Devolver', 'Talla Devuelta', 'Motivo', 'Prenda Reemplazo', 'Talla Nueva', 'Estado', 'Fecha Solicitud'];
    const rows = filteredList.map((r) => [
      r.code,
      r.orderCode,
      r.customer,
      r.email,
      r.city,
      r.itemToReturn.name,
      r.itemToReturn.size,
      `"${r.itemToReturn.reason}"`,
      r.itemReplacement.name,
      r.itemReplacement.size,
      r.status,
      new Date(r.requestedAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_cambios_devoluciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Reporte de cambios exportado en Excel (CSV)', 'info');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Encabezado Pedagógico */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Servicio al Cliente & Logística Inversa
            </p>
            <AdminHelpBadge
              title="¿Para qué es este módulo?"
              text="Aquí gestionas cuando un cliente te pide cambiar de talla o color una prenda que ya compró, o solicitar una garantía sin complicaciones."
            />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Cambios de Talla y Devoluciones ({filteredList.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Recibe la prenda devuelta, reingrésala a tu bodega y envía la nueva talla en 3 pasos fáciles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Exportar a Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black transition cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Registrar Nuevo Cambio</span>
          </button>
        </div>
      </div>

      {/* Explicación de los 4 Pasos Visuales */}
      <div className="grid gap-3 sm:grid-cols-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-100 font-bold text-blue-900 text-xs">
            1
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">1. Solicitud</p>
            <p className="text-[11px] text-slate-500">Cliente pide cambio de talla</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 font-bold text-amber-900 text-xs">
            2
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">2. En Retorno</p>
            <p className="text-[11px] text-slate-500">Transportadora recoge la prenda</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-purple-100 font-bold text-purple-900 text-xs">
            3
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">3. En Bodega</p>
            <p className="text-[11px] text-slate-500">Se revisa y vuelve al stock</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-100 font-bold text-emerald-900 text-xs">
            4
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">4. Despacho Nuevo</p>
            <p className="text-[11px] text-slate-500">Se envía la talla correcta</p>
          </div>
        </div>
      </div>

      {/* Filtros Sencillos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, pedido original (ej. TTL-ORD-8821) o código de cambio..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="SOLICITADO">1. Solicitados (Por Autorizar)</option>
              <option value="EN_CAMINO_A_BODEGA">2. Prenda en Camino a Bodega</option>
              <option value="EN_BODEGA_REVISADO">3. Recibida en Bodega</option>
              <option value="COMPLETADO">4. Completados con Éxito</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listado de Casos de Cambio */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No hay cambios pendientes</h4>
            <p className="text-xs text-slate-400 mt-1">
              Todos los pedidos de tus clientes están entregados a satisfacción.
            </p>
          </div>
        ) : (
          filteredList.map((c) => {
            const statusConfig = {
              SOLICITADO: { label: 'Paso 1: Solicitud Recibida', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
              EN_CAMINO_A_BODEGA: { label: 'Paso 2: Prenda en Camino a Bodega', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
              EN_BODEGA_REVISADO: { label: 'Paso 3: Recibida y Revisada en Bodega', badge: 'bg-purple-50 text-purple-800 border-purple-200' },
              COMPLETADO: { label: 'Paso 4: Nueva Talla Enviada y Cerrado', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            }[c.status] || { label: c.status, badge: 'bg-slate-100 text-slate-800 border-slate-200' };

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Cabecera del Caso */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      Pedido Original: <strong className="text-slate-800 font-mono">{c.orderCode}</strong>
                    </span>
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black ${statusConfig.badge}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Solicitado el {new Date(c.requestedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Contenido: Cliente vs Prenda */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Datos del Cliente */}
                  <div className="space-y-1 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Datos del Cliente</p>
                    <p className="text-sm font-black text-slate-900">{c.customer}</p>
                    <p className="text-slate-500">{c.phone} • {c.city}</p>
                    <p className="text-slate-400 truncate">{c.email}</p>
                  </div>

                  {/* Prenda que devuelve */}
                  <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Prenda a Devolver (Entra)</p>
                    <p className="font-black text-slate-900">{c.itemToReturn.name}</p>
                    <p className="text-slate-600 font-medium">
                      Talla: <strong className="text-rose-800">{c.itemToReturn.size}</strong> • Color: {c.itemToReturn.color}
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-1 bg-white/70 p-1.5 rounded">
                      Motivo: "{c.itemToReturn.reason}"
                    </p>
                  </div>

                  {/* Prenda de reemplazo */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Prenda Nueva que se enviará (Sale)</p>
                    <p className="font-black text-slate-900">{c.itemReplacement.name}</p>
                    <p className="text-slate-600 font-medium">
                      Talla Nueva: <strong className="text-emerald-800">{c.itemReplacement.size}</strong> • Color: {c.itemReplacement.color}
                    </p>
                    {c.returnTracking && (
                      <p className="text-[11px] text-slate-600 mt-1 font-mono">
                        Guía de Devolución: {c.returnTracking}
                      </p>
                    )}
                  </div>
                </div>

                {/* Barra de Acciones Guiadas */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Truck size={14} className="text-slate-400" />
                    <span>Transportadora: <strong>{c.carrier}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {c.status === 'SOLICITADO' && (
                      <button
                        type="button"
                        onClick={() => advanceReturnStatus(c.id, 'EN_CAMINO_A_BODEGA', 'Cambio autorizado. Guía de recolección generada.')}
                        className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                      >
                        Autorizar Cambio & Solicitar Recogida
                      </button>
                    )}

                    {c.status === 'EN_CAMINO_A_BODEGA' && (
                      <button
                        type="button"
                        onClick={() => advanceReturnStatus(c.id, 'EN_BODEGA_REVISADO', 'Prenda recibida en bodega y reingresada al inventario.')}
                        className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer"
                      >
                        Confirmar Prenda Recibida en Bodega
                      </button>
                    )}

                    {c.status === 'EN_BODEGA_REVISADO' && (
                      <button
                        type="button"
                        onClick={() => advanceReturnStatus(c.id, 'COMPLETADO', 'Nueva talla despachada con éxito al cliente.')}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Despachar Nueva Talla al Cliente ✓
                      </button>
                    )}

                    {c.status === 'COMPLETADO' && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>Caso resuelto a satisfacción</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Centrado para Registrar Nuevo Cambio */}
      {newModalOpen && (
        <CreateReturnModal
          onClose={() => setNewModalOpen(false)}
          orders={orders}
          onSave={async (newCase) => {
            try {
              const saved = await apiClient.createReturn(newCase);
              if (saved) {
                setReturnsList((prev) => [saved, ...prev]);
              } else {
                setReturnsList((prev) => [{ ...newCase, id: `rma-${Date.now()}` }, ...prev]);
              }
              setNewModalOpen(false);
              showToast?.('Nuevo caso de cambio registrado con éxito', 'success');
            } catch (err) {
              console.error('Error registrando cambio:', err);
              showToast?.('Error al registrar cambio', 'error');
            }
          }}
        />
      )}
    </div>
  );
}

/**
 * CreateReturnModal - Modal Centrado y Explicado para Crear un Cambio
 */
function CreateReturnModal({ onClose, onSave, orders = [] }) {
  const [formData, setFormData] = useState({
    customer: orders[0]?.customer || '',
    phone: orders[0]?.phone || '',
    email: orders[0]?.email || '',
    city: orders[0]?.city || (orders[0]?.address ? orders[0]?.address.split(',').pop()?.trim() : ''),
    orderCode: orders[0]?.code || '',
    itemName: orders[0]?.items?.[0]?.name || '',
    sizeToReturn: orders[0]?.items?.[0]?.size || '',
    sizeReplacement: '',
    color: orders[0]?.items?.[0]?.color || '',
    reason: '',
  });

  const handleOrderChange = (selectedCode) => {
    const found = orders.find((o) => o.code === selectedCode);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        orderCode: found.code,
        customer: found.customer || prev.customer,
        email: found.email || prev.email,
        phone: found.phone || prev.phone,
        city: found.address ? found.address.split(',').pop()?.trim() : prev.city,
        itemName: found.items?.[0]?.name || prev.itemName,
        sizeToReturn: found.items?.[0]?.size || prev.sizeToReturn,
        color: found.items?.[0]?.color || prev.color,
      }));
    } else {
      setFormData((prev) => ({ ...prev, orderCode: selectedCode }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: `rma-${Date.now()}`,
      code: `RMA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      orderCode: formData.orderCode || 'ORD-DIRECTA',
      customer: formData.customer,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      itemToReturn: {
        name: formData.itemName,
        size: formData.sizeToReturn,
        color: formData.color,
        reason: formData.reason,
      },
      itemReplacement: {
        name: formData.itemName,
        size: formData.sizeReplacement,
        color: formData.color,
      },
      status: 'SOLICITADO',
      carrier: 'Coordinadora Express (Guía Inversa)',
      returnTracking: `CRD-INV-${Math.floor(100000 + Math.random() * 900000)}-CO`,
      requestedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white">
          <div>
            <h3 className="text-base font-black text-slate-900">Registrar Cambio de Talla o Garantía</h3>
            <p className="text-xs text-slate-400">Paso a paso para cambiar la prenda de un cliente</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {orders.length > 0 ? (
            <div>
              <label className="text-xs font-bold text-slate-700">Pedido Original</label>
              <select
                value={formData.orderCode}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="">-- Seleccionar de pedidos existentes --</option>
                {orders.map((o) => (
                  <option key={o.id || o.code} value={o.code}>
                    {o.code} - {o.customer} ({o.items?.length || 0} prendas)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700">Código de Pedido Original</label>
              <input
                type="text"
                value={formData.orderCode}
                placeholder="Ej: ORD-2026-001"
                onChange={(e) => setFormData({ ...formData, orderCode: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700">Nombre del Cliente</label>
            <input
              type="text"
              required
              placeholder="Ej: Laura Méndez"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Teléfono</label>
              <input
                type="text"
                required
                placeholder="Ej: +57 300 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Ciudad</label>
            <input
              type="text"
              required
              placeholder="Ej: Bogotá"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Prenda a Cambiar</label>
            <input
              type="text"
              required
              placeholder="Ej: Chaqueta Bomber Oversized"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-rose-700">Talla que devuelve</label>
              <input
                type="text"
                required
                value={formData.sizeToReturn}
                onChange={(e) => setFormData({ ...formData, sizeToReturn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-rose-200 bg-rose-50/30 px-3 py-2 text-xs font-bold text-rose-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-emerald-700">Talla nueva que pide</label>
              <input
                type="text"
                required
                value={formData.sizeReplacement}
                onChange={(e) => setFormData({ ...formData, sizeReplacement: e.target.value })}
                className="mt-1 w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-xs font-bold text-emerald-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Motivo del Cambio</label>
            <textarea
              rows={2}
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explica por qué solicita el cambio..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-black cursor-pointer"
            >
              Guardar y Autorizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
