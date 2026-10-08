import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  ShoppingBag,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  X,
  Award,
  Sparkles,
  Truck,
  Package,
  FileText,
  DollarSign,
  TrendingUp,
  MessageCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminHelpBadge } from './AdminHelpBadge';
import { formatThousands, formatUSD, formatCOP } from '../../services/currencyService';
import { useCart } from '../../context/CartContext';

/**
 * AdminCrmView - Módulo CRM de Clientes e Historial de Compra Completo
 * Sincronizado en tiempo real con OrdersContext para reflejar todas las compras,
 * datos de contacto, LTV acumulado y desglose de prendas.
 */
export function AdminCrmView({
  customers = [],
  orders = [],
  onViewOrder,
  onOpenDispatch,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('TODOS');
  const [providerFilter, setProviderFilter] = useState('TODOS');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Sincronizar clientes con las órdenes reales para calcular estadísticas dinámicas
  const enrichedCustomers = useMemo(() => {
    // Mapear clientes base
    const customerMap = new Map();

    // 1. Agregar clientes registrados base
    customers.forEach((c) => {
      const emailKey = (c.email || '').toLowerCase().trim();
      customerMap.set(emailKey, {
        id: c.id,
        name: c.name || 'Cliente Registrado',
        email: c.email,
        phone: c.phone || '',
        city: c.city || '',
        address: c.address || '',
        provider: c.provider || 'direct',
        tier: c.tier || 'Cliente Registrado',
        createdAt: c.createdAt || new Date().toISOString(),
        notes: c.notes || '',
        orders: [],
      });
    });

    // 2. Asociar órdenes y crear clientes que hayan comprado como invitados si no existen
    orders.forEach((ord) => {
      const emailKey = (ord.email || '').toLowerCase().trim();
      if (!emailKey) return;

      if (!customerMap.has(emailKey)) {
        customerMap.set(emailKey, {
          id: `crm-${Math.abs(emailKey.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`,
          name: ord.customer || 'Cliente de Tienda',
          email: ord.email,
          phone: ord.phone || '',
          city: ord.destinationCity || (ord.address ? ord.address.split(',').pop()?.trim() : ''),
          address: ord.address || '',
          provider: ord.provider || 'web_store',
          tier: 'Cliente',
          createdAt: ord.createdAt || new Date().toISOString(),
          notes: 'Registrado a través del checkout de compra.',
          orders: [],
        });
      }

      const cust = customerMap.get(emailKey);
      cust.orders.push(ord);
    });

    // 3. Computar métricas reales por cliente
    return Array.from(customerMap.values()).map((cust) => {
      // Ordenar pedidos por fecha más reciente
      cust.orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const totalSpent = cust.orders.reduce((sum, ord) => sum + Number(ord.total || 0), 0);
      const ordersCount = cust.orders.length;
      const averageTicket = ordersCount > 0 ? totalSpent / ordersCount : 0;
      const lastOrder = cust.orders[0] || null;

      // Calcular o actualizar Tier según consumo si era nuevo
      let tier = cust.tier;
      if (totalSpent >= 400) tier = 'Black Member';
      else if (totalSpent >= 200) tier = 'Gold VIP';
      else if (totalSpent >= 80) tier = 'Silver';
      else if (ordersCount > 0) tier = 'Bronce';

      return {
        ...cust,
        totalSpent,
        ordersCount,
        averageTicket,
        lastOrder,
        tier,
      };
    });
  }, [customers, orders]);

  // Filtrado de clientes
  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter((c) => {
      if (tierFilter !== 'TODOS' && c.tier !== tierFilter) return false;
      if (providerFilter !== 'TODOS' && c.provider.toLowerCase() !== providerFilter.toLowerCase()) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchCity = c.city?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchCity) return false;
      }

      return true;
    });
  }, [enrichedCustomers, searchTerm, tierFilter, providerFilter]);

  // Métricas globales del CRM
  const { showToast } = useCart();
  const totalCustomersCount = enrichedCustomers.length;
  const vipCount = enrichedCustomers.filter((c) => c.tier === 'Black Member' || c.tier === 'Gold VIP').length;
  const totalLtvSum = enrichedCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgGlobalTicket = totalCustomersCount > 0 ? totalLtvSum / totalCustomersCount : 0;

  // Contactar por WhatsApp con mensaje pre-diseñado y amable
  const handleOpenWhatsApp = (customer, e) => {
    e?.stopPropagation();
    const rawPhone = (customer.phone || '').replace(/\D/g, '');
    const phone = rawPhone.startsWith('57') ? rawPhone : `57${rawPhone || '3008421920'}`;
    const text = encodeURIComponent(
      `Hola ${customer.name}, ¡un gusto saludarte desde KAMIL SHOP! Nos comunicamos para agradecer tu confianza como socia/socio ${customer.tier}. ¿Tienes alguna inquietud con tus pedidos o prendas favoritas?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    showToast?.(`Abriendo WhatsApp con ${customer.name}...`, 'info');
  };

  // Exportar directorio de clientes a Excel (CSV)
  const handleExportCSV = () => {
    const headers = ['ID Cliente', 'Nombre', 'Email', 'Teléfono', 'Ciudad', 'Dirección', 'Nivel (Tier)', 'Origen Cuenta', 'Total Gastado LTV ($)', 'Pedidos Totales', 'Ticket Promedio ($)', 'Última Compra'];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.email,
      `"${c.phone}"`,
      `"${c.city}"`,
      `"${c.address}"`,
      c.tier,
      c.provider,
      c.totalSpent.toFixed(2),
      c.ordersCount,
      c.averageTicket.toFixed(2),
      c.lastOrder ? c.lastOrder.code : 'Sin compras',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `directorio_clientes_crm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Directorio de clientes exportado a Excel (CSV)', 'info');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Relación con Clientes • KAMIL SHOP
            </p>
            <AdminHelpBadge
              title="¿Para qué es el CRM de Clientes?"
              text="Aquí ves la ficha de cada persona que te ha comprado, cuánto dinero te ha dejado en total, todas sus compras pasadas y puedes escribirle directamente a su WhatsApp."
            />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            CRM de Clientes & Historial de Compra ({filteredCustomers.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Exportar Clientes a Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Superiores con Ayudas Responsivas */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Clientes</span>
            <AdminHelpBadge text="Cantidad total de personas que se han registrado o han hecho al menos una compra en tu tienda." />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{totalCustomersCount}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Compradores y miembros</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Clientes VIP</span>
            <AdminHelpBadge text="Clientes estrella de nivel Black Member o Gold VIP que compran con frecuencia y dejan mayores ganancias." />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{vipCount}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Black Member & Gold</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Facturación LTV</span>
            <AdminHelpBadge text="LTV significa 'Valor de Vida del Cliente': es todo el dinero que tus clientes te han pagado sumando todas sus compras históricas." />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{formatUSD(totalLtvSum)}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-emerald-600 font-bold truncate">≈ {formatCOP(totalLtvSum)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Ticket Promedio</span>
            <AdminHelpBadge text="Es el promedio de cuánto gasta un cliente cada vez que hace un pedido (Total facturado dividido entre número de compras)." />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{formatUSD(avgGlobalTicket)}</p>
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Gasto medio por orden</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid gap-3 sm:grid-cols-4">
          {/* Búsqueda por texto libre */}
          <div className="relative sm:col-span-2">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente por nombre, email, teléfono o ciudad..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* Filtro por Nivel / Tier */}
          <div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="TODOS">Todos los Niveles</option>
              <option value="Black Member">Black Member (Exclusivo)</option>
              <option value="Gold VIP">Gold VIP</option>
              <option value="Silver">Silver</option>
              <option value="Bronce">Bronce</option>
              <option value="Nuevo Cliente">Nuevo Cliente</option>
            </select>
          </div>

          {/* Filtro por Proveedor de Login */}
          <div>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="TODOS">Todos los Orígenes</option>
              <option value="google">Google Account</option>
              <option value="apple">Apple ID</option>
              <option value="facebook">Facebook</option>
              <option value="web_store">Tienda Web / Directo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal del CRM */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Ubicación & Teléfono</th>
                <th className="px-4 py-3.5">Nivel / Tier</th>
                <th className="px-4 py-3.5">Inversión (LTV)</th>
                <th className="px-4 py-3.5">Pedidos</th>
                <th className="px-4 py-3.5">Última Compra</th>
                <th className="px-4 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-semibold text-slate-400">
                    No se encontraron clientes con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const initials = cust.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase() || 'CL';

                  const tierStyles = {
                    'Black Member': 'bg-slate-950 text-white border-slate-900',
                    'Gold VIP': 'bg-amber-50 text-amber-900 border-amber-300',
                    'Silver': 'bg-slate-100 text-slate-700 border-slate-300',
                    'Bronce': 'bg-orange-50 text-orange-800 border-orange-200',
                    'Nuevo Cliente': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  }[cust.tier] || 'bg-slate-100 text-slate-800 border-slate-200';

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className="transition-colors hover:bg-slate-50/70 cursor-pointer group"
                    >
                      {/* Cliente */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 font-mono text-xs font-black text-white shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-black">
                              {cust.name}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[190px]">
                              <Mail size={11} />
                              <span>{cust.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Ubicación & Teléfono */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span>{cust.city}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-slate-400 shrink-0" />
                          <span>{cust.phone}</span>
                        </p>
                      </td>

                      {/* Nivel / Tier */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tierStyles}`}
                        >
                          {cust.tier}
                        </span>
                      </td>

                      {/* Inversión LTV */}
                      <td className="px-4 py-3.5">
                        <p className="font-mono font-black text-slate-900">
                          {formatUSD(cust.totalSpent)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Promedio: {formatUSD(cust.averageTicket)}
                        </p>
                      </td>

                      {/* Pedidos */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                          <ShoppingBag size={12} className="text-slate-500" />
                          <span>{formatThousands(cust.ordersCount)} compras</span>
                        </span>
                      </td>

                      {/* Última Compra */}
                      <td className="px-4 py-3.5">
                        {cust.lastOrder ? (
                          <div>
                            <p className="font-mono font-bold text-slate-900">{cust.lastOrder.code}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(cust.lastOrder.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sin pedidos aún</span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleOpenWhatsApp(cust, e)}
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                            title="Escribir al WhatsApp del cliente"
                          >
                            <MessageCircle size={13} />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomer(cust);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all cursor-pointer"
                          >
                            <span>Ver Historial</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Centrado de Detalle del Cliente & Historial de Compra Completo */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onViewOrder={onViewOrder}
          onOpenDispatch={onOpenDispatch}
        />
      )}
    </div>
  );
}

/**
 * CustomerDetailModal - Ficha Integral de Cliente e Historial de Compra Completo
 * Centrado en pantalla con backdrop blur, mostrando toda la información de pedidos y prendas.
 */
function CustomerDetailModal({
  customer,
  onClose,
  onViewOrder,
  onOpenDispatch,
}) {
  const initials = customer.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CL';

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
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 font-mono text-base font-black text-white shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{customer.name}</h3>
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                  {customer.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                ID Cliente: {customer.id} • Autenticación vía {customer.provider}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const rawPhone = (customer.phone || '').replace(/\D/g, '');
                const phone = rawPhone.startsWith('57') ? rawPhone : `57${rawPhone || '3008421920'}`;
                const text = encodeURIComponent(
                  `Hola ${customer.name}, ¡un gusto saludarte desde KAMIL SHOP! Nos comunicamos para agradecer tu confianza como socia/socio ${customer.tier}. ¿Podemos ayudarte con algo especial hoy?`
                );
                window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
            >
              <MessageCircle size={14} />
              <span>Contactar WhatsApp</span>
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

        {/* Modal Body con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ficha de Información de Contacto y Resumen */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Contacto */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Datos de Contacto</p>
              <div className="space-y-1.5 text-xs">
                <p className="flex items-center gap-1.5 text-slate-700">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold truncate">{customer.email}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-700">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold">{customer.phone}</span>
                </p>
                <p className="flex items-start gap-1.5 text-slate-700">
                  <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{customer.address}, {customer.city}</span>
                </p>
              </div>
            </div>

            {/* Inversión & Pedidos */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resumen Financiero</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Inversión LTV:</span>
                  <span className="font-mono font-black text-slate-900">{formatUSD(customer.totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pedidos Totales:</span>
                  <span className="font-black text-slate-900">{formatThousands(customer.ordersCount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ticket Promedio:</span>
                  <span className="font-mono font-bold text-slate-800">{formatUSD(customer.averageTicket)}</span>
                </div>
              </div>
            </div>

            {/* Preferencias & Notas */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notas de Fidelización</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{customer.notes}"
              </p>
            </div>
          </div>

          {/* Sección de Historial de Compra Completo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-slate-900" />
                <h4 className="text-base font-black text-slate-900">
                  Historial de Compra Completo ({customer.orders.length} pedidos)
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Trazabilidad y desglose ítem por ítem
              </span>
            </div>

            {customer.orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-xs font-semibold text-slate-400">
                  Este cliente aún no ha registrado compras en la tienda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customer.orders.map((ord) => {
                  const statusConfig = {
                    'ENTREGADA': { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Entregada al Cliente' },
                    'DESPACHADA': { badge: 'bg-purple-50 text-purple-800 border-purple-200', label: 'En Ruta / Despachada' },
                    'EN_PICKING': { badge: 'bg-amber-50 text-amber-800 border-amber-200', label: 'En Alistamiento (Picking)' },
                    'NUEVA': { badge: 'bg-blue-50 text-blue-800 border-blue-200', label: 'Recibida en Tienda' },
                    'CON_INCIDENCIA': { badge: 'bg-rose-50 text-rose-800 border-rose-200', label: 'Incidencia Logística' },
                  }[ord.status] || { badge: 'bg-slate-100 text-slate-800 border-slate-200', label: ord.status };

                  return (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                    >
                      {/* Cabecera de la Orden */}
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {ord.code}
                          </span>
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-black ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            • {new Date(ord.createdAt || Date.now()).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-black text-slate-900">
                            Total: {formatUSD(ord.total || 0)} <span className="text-[10px] text-emerald-600 font-semibold">(≈ {formatCOP(ord.total || 0)})</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onViewOrder?.(ord);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-950 hover:text-white transition cursor-pointer"
                          >
                            <span>Ver Orden</span>
                            <ExternalLink size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Logística de la Orden */}
                      <div className="px-4 py-2 bg-slate-50/30 border-b border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center gap-2">
                          <Truck size={12} className="text-slate-400" />
                          <span>
                            Transportadora: <strong>{ord.carrier || 'Mensajería Directa Local'}</strong>
                          </span>
                          {ord.trackingNumber && (
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              Guía: {ord.trackingNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="truncate max-w-[280px]">{ord.address}</span>
                        </div>
                      </div>

                      {/* Desglose de Prendas Compradas en Esta Orden */}
                      <div className="p-3 divide-y divide-slate-100">
                        {ord.items?.map((it, itemIdx) => (
                          <div key={itemIdx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                                {it.image ? (
                                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Package size={16} className="text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{it.name}</p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 font-bold">
                                    Talla: {it.size || 'M'}
                                  </span>
                                  {it.color && (
                                    <span className="text-slate-500">
                                      Color: <strong>{it.color}</strong>
                                    </span>
                                  )}
                                  <span className="font-mono text-slate-400">SKU: {it.sku || 'TTL-ITEM'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-black text-slate-900">{formatThousands(it.qty || 1)} x {formatUSD(it.price || 0)}</p>
                              <p className="font-mono text-[11px] font-bold text-slate-600">
                                {formatUSD(Number(it.qty || 1) * Number(it.price || 0))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/70 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Socio fidelizado de KAMIL SHOP
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
