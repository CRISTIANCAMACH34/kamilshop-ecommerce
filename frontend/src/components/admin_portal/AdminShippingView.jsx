import React, { useState, useMemo } from 'react';
import {
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Send,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Printer,
  X,
  ChevronRight,
  AlertCircle,
  Tag,
  Layers,
  FileSpreadsheet,
  CheckSquare,
} from 'lucide-react';
import { AdminHelpBadge } from './AdminHelpBadge';
import { useOrders } from '../../context/OrdersContext';
import { useCart } from '../../context/CartContext';
import { formatThousands, formatUSD, formatCOP } from '../../services/currencyService';

/**
 * AdminShippingView - Módulo de Despachos y Envíos con Inspección Completa
 * Permite visualizar toda la información del despacho, cliente, transportadora,
 * desglose de prendas, trazabilidad y generación de remisión/guía imprimible.
 */
export function AdminShippingView({
  orders: propOrders,
  onOpenDispatch: propOpenDispatch,
  onViewOrder: propViewOrder,
  products = [],
}) {
  const { orders: contextOrders = [], dispatchOrder } = useOrders();
  const { showToast } = useCart();

  // Usar propOrders si vienen pasadas, o fallback a contextOrders
  const allOrders = propOrders || contextOrders;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('TODAS');
  const [selectedCarrier, setSelectedCarrier] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');

  // Modales de Inspección
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);
  const [pickingModalOpen, setPickingModalOpen] = useState(false);

  // Filtrar órdenes que tienen relevancia logística
  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      // Filtro por estado
      if (selectedStatus !== 'TODOS' && o.status !== selectedStatus) return false;

      // Filtro por ciudad
      if (selectedCity !== 'TODAS') {
        const addr = (o.destinationCity || o.address || '').toLowerCase();
        if (!addr.includes(selectedCity.toLowerCase())) return false;
      }

      // Filtro por transportadora
      if (selectedCarrier !== 'TODAS') {
        const carr = (o.carrier || '').toLowerCase();
        if (!carr.includes(selectedCarrier.toLowerCase())) return false;
      }

      // Búsqueda por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = o.code?.toLowerCase().includes(q);
        const matchCust = o.customer?.toLowerCase().includes(q);
        const matchTrack = o.trackingNumber?.toLowerCase().includes(q);
        const matchCity = o.address?.toLowerCase().includes(q);
        const matchEmail = o.email?.toLowerCase().includes(q);
        if (!matchCode && !matchCust && !matchTrack && !matchCity && !matchEmail) return false;
      }

      return true;
    });
  }, [allOrders, selectedStatus, selectedCity, selectedCarrier, searchTerm]);

  // Contadores KPI
  const countTotal = allOrders.length;
  const countInTransit = allOrders.filter((o) => o.status === 'DESPACHADA').length;
  const countDelivered = allOrders.filter((o) => o.status === 'ENTREGADA').length;
  const countPending = allOrders.filter((o) => o.status === 'EN_PICKING' || o.status === 'NUEVA').length;

  const handleCopyGuide = (trackingNumber, e) => {
    e?.stopPropagation();
    if (!trackingNumber) return;
    navigator.clipboard?.writeText(trackingNumber);
    showToast?.(`Guía ${trackingNumber} copiada al portapapeles`, 'info');
  };

  // Exportar manifiesto de despachos a Excel (CSV)
  const handleExportCSV = () => {
    const headers = ['Pedido', 'Guía', 'Cliente', 'Email', 'Dirección', 'Ciudad', 'Modalidad', 'Transportadora', 'Estado', 'Total ($)', 'Fecha'];
    const rows = filteredOrders.map((o) => [
      o.code,
      o.trackingNumber || 'Sin guía',
      `"${o.customer}"`,
      o.email,
      `"${o.address}"`,
      o.destinationCity || 'Bogotá',
      o.shippingType || 'LOCAL',
      `"${o.carrier || 'Mensajería'}"`,
      o.status,
      Number(o.total || 0).toFixed(2),
      new Date(o.createdAt || Date.now()).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manifiesto_despachos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Manifiesto de despachos exportado a Excel (CSV)', 'info');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Logística & Despachos • KAMIL SHOP
            </p>
            <AdminHelpBadge
              title="¿Para qué sirve este módulo?"
              text="Aquí controlas el viaje de los paquetes desde que salen de la Bodega Central hasta que llegan a las manos del cliente. Puedes ver guías, imprimir remisiones y saber con qué transportadora viaja cada pedido."
            />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Módulo de Despacho y Envíos ({filteredOrders.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Picking Masivo */}
          <button
            type="button"
            onClick={() => setPickingModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            title="Ver lista consolidada de prendas por recoger en bodega"
          >
            <Layers size={14} className="text-amber-600" />
            <span>Picking Masivo ({countPending})</span>
          </button>

          {/* Botón Exportar Excel */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Superiores Responsivas */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Envíos</p>
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <Package size={15} />
            </div>
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900">{countTotal}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Órdenes en logística</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">En Ruta</p>
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Truck size={15} />
            </div>
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900">{countInTransit}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Con transportadora</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Entregadas</p>
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900">{countDelivered}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Por el cliente</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Pendientes</p>
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Clock size={15} />
            </div>
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900">{countPending}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">En alistamiento</p>
        </div>
      </div>

      {/* Filtros de Búsqueda */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid gap-3 sm:grid-cols-4">
          {/* Búsqueda libre */}
          <div className="relative sm:col-span-1">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por orden, cliente, guía..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* Filtro por Ciudad */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="TODAS">Todas las Ciudades</option>
              <option value="Bogotá">Bogotá (Local)</option>
              <option value="Medellín">Medellín</option>
              <option value="Cali">Cali</option>
              <option value="Barranquilla">Barranquilla</option>
            </select>
          </div>

          {/* Filtro por Transportadora */}
          <div>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="TODAS">Todas las Transportadoras</option>
              <option value="Coordinadora">Coordinadora Express</option>
              <option value="Servientrega">Servientrega</option>
              <option value="Directa">Mensajería Directa Local</option>
              <option value="Interrapidísimo">Interrapidísimo</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="NUEVA">Nuevas (Por Aceptar)</option>
              <option value="EN_PICKING">En Alistamiento (Picking)</option>
              <option value="DESPACHADA">En Ruta / Despachadas</option>
              <option value="ENTREGADA">Entregadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla con Toda la Información del Despacho y Acciones */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Pedido & Guía</th>
                <th className="px-4 py-3.5">Cliente & Destino</th>
                <th className="px-4 py-3.5">Modalidad & Transportadora</th>
                <th className="px-4 py-3.5">Prendas en Envío</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-semibold text-slate-400">
                    No se encontraron despachos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrderForDetail(o)}
                    className="transition-colors hover:bg-slate-50/70 cursor-pointer group"
                  >
                    {/* Pedido & Guía */}
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-black text-slate-900 group-hover:text-black">
                        {o.code}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                          {o.trackingNumber || 'Sin guía aún'}
                        </span>
                        {o.trackingNumber && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyGuide(o.trackingNumber, e)}
                            title="Copiar guía"
                            className="text-slate-400 hover:text-slate-800 transition"
                          >
                            <Copy size={11} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Cliente & Destino */}
                    <td className="px-4 py-3.5">
                      <p className="font-black text-slate-900">{o.customer}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[190px] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span>{o.address}</span>
                      </p>
                    </td>

                    {/* Modalidad & Transportadora */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {o.shippingType === 'LOCAL' ? 'Local (Misma Ciudad)' : 'Nacional (Intermunicipal)'}
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {o.carrier || 'Mensajería Directa'}
                      </p>
                      {o.dispatchedAt && (
                        <p className="text-[10px] text-slate-400">
                          {new Date(o.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </td>

                    {/* Prendas */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 max-w-[190px]">
                        {o.items?.map((it, i) => (
                          <p key={i} className="text-[11px] text-slate-700 truncate">
                            <strong>{it.qty}x</strong> {it.name}{' '}
                            <span className="text-slate-400 font-mono">({it.size})</span>
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black ${
                          o.status === 'ENTREGADA'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : o.status === 'DESPACHADA'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : o.status === 'EN_PICKING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5">
                      <p className="font-mono font-black text-slate-900">{formatUSD(o.total || 0)}</p>
                      <p className="text-[10px] font-mono text-emerald-600 font-bold">≈ {formatCOP(o.total || 0)}</p>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Botón Ver Información Completa */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetail(o)}
                          title="Ver Toda la Información"
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-950 hover:text-white transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">Ver Info</span>
                        </button>

                        {/* Botón Remisión / Guía Imprimible */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForSlip(o)}
                          title="Ver Remisión de Despacho"
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                        >
                          <FileText size={13} />
                        </button>

                        {/* Botón Despachar si aún no ha sido despachada */}
                        {(o.status === 'EN_PICKING' || o.status === 'NUEVA') && (
                          <button
                            type="button"
                            onClick={() => propOpenDispatch?.(o)}
                            title="Despachar Pedido"
                            className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-600 transition-all cursor-pointer"
                          >
                            <Truck size={13} />
                            <span className="hidden md:inline">Despachar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Centrado: Toda la Información del Despacho */}
      {selectedOrderForDetail && (
        <ShippingDetailModal
          order={selectedOrderForDetail}
          onClose={() => setSelectedOrderForDetail(null)}
          onOpenDispatch={(ord) => {
            setSelectedOrderForDetail(null);
            propOpenDispatch?.(ord);
          }}
          onOpenSlip={(ord) => {
            setSelectedOrderForDetail(null);
            setSelectedOrderForSlip(ord);
          }}
        />
      )}

      {/* Modal Centrado: Remisión y Guía de Despacho Oficial Imprimible */}
      {selectedOrderForSlip && (
        <DispatchSlipModal
          order={selectedOrderForSlip}
          onClose={() => setSelectedOrderForSlip(null)}
        />
      )}

      {/* Modal Centrado: Hoja de Alistamiento Masivo (Picking Wave) */}
      {pickingModalOpen && (
        <BulkPickingModal
          orders={allOrders}
          onClose={() => setPickingModalOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * ShippingDetailModal - Inspección Total del Despacho Centrada en Pantalla
 * Muestra cliente, logística, transportadora, desglose de prendas, liquidación financiera y trazabilidad.
 */
function ShippingDetailModal({
  order,
  onClose,
  onOpenDispatch,
  onOpenSlip,
}) {
  const flowSteps = [
    { id: 'NUEVA', label: '1. Recibido', desc: 'Pago procesado en tienda' },
    { id: 'EN_PICKING', label: '2. En Alistamiento', desc: 'Prendas empacadas en Dark Store' },
    { id: 'DESPACHADA', label: '3. En Ruta', desc: 'Con transportadora o mensajería' },
    { id: 'ENTREGADA', label: '4. Entregado', desc: 'Recibido por el cliente' },
  ];

  const currentStepIdx = flowSteps.findIndex((s) => s.id === order.status);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Ventana Modal Centrada */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-slate-900">
                {order.code}
              </span>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black text-white">
                {order.status}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                {order.shippingType === 'LOCAL' ? 'Despacho Local' : 'Envío Nacional'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Bodega Central Kamil Shop • Registrado el {new Date(order.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenSlip?.(order)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Printer size={13} />
              <span>Remisión</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trazabilidad y Timeline */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Trazabilidad Logística de la Orden
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

          {/* Fichas de Cliente y Despacho */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Datos del Cliente y Destino */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <User size={13} className="text-slate-600" />
                <span>Destinatario & Entrega</span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{order.customer}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail size={11} className="text-slate-400" />
                  <span>{order.email}</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone size={11} className="text-slate-400" />
                  <span>{order.phone || '+57 (300) 842-1920'}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-slate-700">
                <MapPin size={13} className="shrink-0 text-slate-400 mt-0.5" />
                <div>
                  <span className="font-semibold block">{order.address}</span>
                  {order.destinationCity && (
                    <span className="text-[11px] text-slate-400">Ciudad: {order.destinationCity}</span>
                  )}
                  {order.dispatchNotes && (
                    <p className="mt-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      <strong>Indicaciones:</strong> {order.dispatchNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Datos de Transporte & Guía */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Truck size={13} className="text-slate-600" />
                <span>Transporte & Guía</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Transportadora:</span>
                  <span className="font-black text-slate-900">{order.carrier || 'Mensajería Directa Local'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Número de Guía:</span>
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {order.trackingNumber || 'En asignación'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Modalidad:</span>
                  <span className="font-semibold text-slate-700">
                    {order.shippingType === 'LOCAL' ? 'Entrega Local Puerta a Puerta' : 'Envío Nacional Terrestre/Aéreo'}
                  </span>
                </div>

                {order.dispatchedAt && (
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <span>Fecha de Despacho:</span>
                    <span>{new Date(order.dispatchedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                )}
              </div>

              {/* Botón para Despachar si está en picking */}
              {(order.status === 'EN_PICKING' || order.status === 'NUEVA') && (
                <button
                  type="button"
                  onClick={() => onOpenDispatch?.(order)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition cursor-pointer"
                >
                  <Truck size={14} />
                  <span>Asignar Guía / Despachar Ahora</span>
                </button>
              )}
            </div>
          </div>

          {/* Desglose Detallado de Prendas en el Paquete */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Package size={14} className="text-slate-500" />
                <span>Prendas en el Envío ({order.items?.length || 0} prendas)</span>
              </div>
              <span className="text-xs font-black text-slate-900">
                Subtotal: {formatUSD(order.total || 0)} <span className="text-[10px] font-mono text-emerald-600 font-semibold">(≈ {formatCOP(order.total || 0)})</span>
              </span>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50/50 rounded-xl transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-800 font-bold">
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
                    <p className="font-bold text-slate-900">{formatThousands(item.qty || 1)} x {formatUSD(item.price || 0)}</p>
                    <p className="font-mono font-black text-slate-900 text-xs">
                      {formatUSD(Number(item.qty || 1) * Number(item.price || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liquidación Financiera */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Liquidación de la Orden</p>
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal de Prendas:</span>
                <span className="font-mono font-bold">{formatUSD(order.total || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío / Flete Logístico:</span>
                <span className="font-mono font-bold text-emerald-700">GRATIS (Cortesía VIP)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Método de Pago:</span>
                <span className="font-bold text-slate-800">
                  {order.paymentMethod === 'cash_on_delivery' ? 'Pago Contra Entrega' : 'Tarjeta de Crédito / PSE'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Recaudado / Pagado:</span>
                <span className="font-mono">{formatUSD(order.total || 0)} <span className="text-xs text-emerald-600 font-bold">(≈ {formatCOP(order.total || 0)})</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Inspección Logística • KAMIL SHOP
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * DispatchSlipModal - Remisión y Etiqueta de Despacho Oficial Imprimible
 * Con código de barras simulado, datos de remitente y destinatario.
 */
function DispatchSlipModal({ order, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Ventana Modal Centrada */}
      <div className="relative z-10 w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Barra Superior con Acciones */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-900" />
            <h3 className="text-sm font-black text-slate-900">
              Guía de Remisión • {order.code}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
            >
              <Printer size={13} />
              <span>Imprimir Guía</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-200 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Remisión Imprimible */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white text-slate-900 print:p-0">
          {/* Encabezado de la Remisión */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                KAMIL SHOP
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Bodega Central & Envíos Nacionales
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Centro de Distribución y Envíos Asegurados a Toda Colombia<br />
                PBX: +57 (1) 745-8800 • NIT: 901.842.109-4
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-950 text-white font-mono font-black text-xs px-2.5 py-1 rounded">
                REMISIÓN OFICIAL
              </span>
              <p className="font-mono font-black text-base mt-1 text-slate-900">{order.code}</p>
              <p className="text-[11px] text-slate-500">
                {new Date(order.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Código de Barras Simulado */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="flex justify-center items-center gap-1 font-mono text-2xl tracking-[0.25em] font-black text-slate-900 select-all">
              ||| | |||| | ||| |||| | ||||| | ||
            </div>
            <p className="font-mono text-xs font-bold text-slate-600">
              GUÍA: {order.trackingNumber || 'MD-LOCAL-TRANSIT'}
            </p>
          </div>

          {/* Cuadro Remitente / Destinatario */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">REMITENTE</p>
              <p className="font-black text-slate-900">KAMIL SHOP</p>
              <p className="text-slate-600">Bodega Central Kamil Shop — Colombia</p>
              <p className="text-slate-600">Tel: +57 (1) 745-8800</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">DESTINATARIO</p>
              <p className="font-black text-slate-900">{order.customer}</p>
              <p className="text-slate-700 font-semibold">{order.address}</p>
              <p className="text-slate-600">Tel: {order.phone || '+57 (300) 842-1920'}</p>
            </div>
          </div>

          {/* Detalle del Contenido */}
          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                  <th className="p-2.5">Ítem / Prenda</th>
                  <th className="p-2.5 text-center">Talla</th>
                  <th className="p-2.5 text-center">Cant.</th>
                  <th className="p-2.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold text-slate-900">{it.name}</td>
                    <td className="p-2.5 text-center font-mono">{it.size || 'M'}</td>
                    <td className="p-2.5 text-center font-black">{formatThousands(it.qty || 1)}</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {formatUSD(Number(it.qty || 1) * Number(it.price || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie de Remisión */}
          <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500">
            <p>Transportadora: <strong>{order.carrier || 'Mensajería Directa Local'}</strong></p>
            <p className="font-mono font-black text-sm text-slate-900">
              Total: {formatUSD(order.total || 0)} <span className="text-[10px] text-emerald-700 font-semibold">(≈ {formatCOP(order.total || 0)})</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BulkPickingModal - Hoja de Alistamiento Masivo para Bodega (Wave Picking)
 * Agrupa todas las prendas requeridas en los pedidos pendientes para que
 * el jefe de bodega las recoja en un solo recorrido.
 */
function BulkPickingModal({ orders = [], onClose }) {
  const [checkedItems, setCheckedItems] = useState({});

  // Filtrar pedidos pendientes de alistamiento
  const pendingOrders = orders.filter((o) => o.status === 'EN_PICKING' || o.status === 'NUEVA');

  // Consolidar prendas únicas sumando cantidades
  const consolidatedItems = useMemo(() => {
    const map = new Map();
    pendingOrders.forEach((ord) => {
      ord.items?.forEach((it) => {
        const key = `${it.name}__${it.size || 'M'}__${it.color || 'Default'}`;
        if (!map.has(key)) {
          map.set(key, {
            name: it.name,
            size: it.size || 'M',
            color: it.color || 'Noir',
            image: it.image,
            sku: it.sku || 'TTL-ITEM',
            totalQty: 0,
            orderCodes: [],
          });
        }
        const entry = map.get(key);
        entry.totalQty += Number(it.qty || 1);
        if (!entry.orderCodes.includes(ord.code)) {
          entry.orderCodes.push(ord.code);
        }
      });
    });
    return Array.from(map.values());
  }, [pendingOrders]);

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Lista de Alistamiento Masivo (Picking Bodega)
              </h3>
              <p className="text-xs text-slate-400">
                Consolidado de {pendingOrders.length} pedidos pendientes • Recoge todo en un solo viaje
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Printer size={13} />
              <span>Imprimir Lista</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>💡 ¿Cómo usar esta lista?</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Pasa por las estanterías de la Dark Store y recoge la cantidad exacta de prendas indicadas.
              Marca la casilla conforme vas metiendo las prendas en tu carrito de empaque.
            </p>
          </div>

          {consolidatedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              No hay pedidos pendientes de alistamiento en este momento.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {consolidatedItems.map((item, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`flex items-center justify-between p-3.5 transition cursor-pointer ${
                      isChecked ? 'bg-emerald-50/60 opacity-60 line-through' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <p className="font-black text-xs text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Talla: <strong className="text-slate-800">{item.size}</strong> • Color: {item.color} • SKU: {item.sku}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Para pedidos: {item.orderCodes.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block rounded-xl bg-slate-900 px-3 py-1 font-mono text-xs font-black text-white">
                        Recoger: {item.totalQty} un
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
          >
            Listo, Cerrar Lista
          </button>
        </div>
      </div>
    </div>
  );
}

