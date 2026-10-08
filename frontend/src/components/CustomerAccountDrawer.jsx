import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { formatUSD, formatCOP } from '../services/currencyService';
import {
  X,
  User,
  Package,
  CheckCircle2,
  Truck,
  Bell,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Trash2,
  MapPin,
  Save,
  AlertTriangle
} from 'lucide-react';

/**
 * CustomerAccountDrawer - Portal Integral del Cliente de KAMIL SHOP
 * Incluye:
 * - Historial de pedidos y botón de confirmación de entrega
 * - Notificaciones de despacho
 * - Libreta de direcciones de envío guardadas
 * - Módulo de Privacidad y Eliminación Definitiva de Cuenta (Habeas Data)
 */
export const CustomerAccountDrawer = ({ open, onClose }) => {
  useBodyScrollLock(open);

  const { user, logout, deleteCustomerAccount } = useAuth();
  const { getOrdersByCustomer, openTracking, confirmCustomerDelivery, customerNotifications = [] } = useOrders();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'address' | 'privacy'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmWord, setConfirmWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Libreta de dirección guardada
  const [addressData, setAddressData] = useState(() => {
    try {
      const saved = localStorage.getItem('titulo_customer_addresses');
      return saved ? JSON.parse(saved) : {
        fullName: '',
        phone: '',
        city: 'Bogotá D.C.',
        department: 'Cundinamarca',
        streetAddress: '',
        notes: ''
      };
    } catch {
      return { fullName: '', phone: '', city: 'Bogotá D.C.', department: 'Cundinamarca', streetAddress: '', notes: '' };
    }
  });

  useEffect(() => {
    if (user && !addressData.fullName) {
      setAddressData(prev => ({ ...prev, fullName: user.name || '' }));
    }
  }, [user]);

  if (!open || !user) return null;

  const customerOrders = getOrdersByCustomer(user.email);
  const myNotifications = customerNotifications.filter(
    (n) => !n.customerEmail || n.customerEmail.toLowerCase() === user.email.toLowerCase()
  );

  const handleSaveAddress = (e) => {
    e.preventDefault();
    localStorage.setItem('titulo_customer_addresses', JSON.stringify(addressData));
    showToast('Dirección de entrega guardada correctamente', 'success');
  };

  const handleConfirmDeleteAccount = async () => {
    if (confirmWord.trim().toUpperCase() !== 'ELIMINAR') {
      showToast('Escribe la palabra ELIMINAR para confirmar', 'error');
      return;
    }

    setIsDeleting(true);
    const res = await deleteCustomerAccount();
    setIsDeleting(false);

    if (res.success) {
      setShowDeleteConfirm(false);
      onClose();
      showToast(res.message, 'success');
    } else {
      showToast(res.error || 'No se pudo eliminar la cuenta', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal - bottom sheet en móvil, centrado en sm+ */}
      <div className="relative z-10 w-full max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0d0d0d] text-white shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white border border-white/20">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Mi Cuenta de Cliente</h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                  CLIENTE VERIFICADO
                </span>
              </div>
              <p className="text-xs text-white/50">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-[#141414] px-2 sm:px-4 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex shrink-0 whitespace-nowrap items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'orders'
                ? 'border-white text-white bg-white/[0.04]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Mis Compras ({customerOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`flex shrink-0 whitespace-nowrap items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'address'
                ? 'border-white text-white bg-white/[0.04]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <MapPin size={14} />
            <span>Dirección de Envío</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex shrink-0 whitespace-nowrap items-center gap-2 px-3 sm:px-4 py-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'privacy'
                ? 'border-rose-500 text-rose-400 bg-rose-500/[0.04]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Seguridad & Privacidad</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Perfil del Cliente */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white/30"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-black text-white truncate">{user.name}</h4>
              <p className="text-xs text-white/50 truncate">KAMIL SHOP • Tienda Online Oficial</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-md">
                  Vía {user.provider || 'Google'}
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Sesión Activa
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: MIS COMPRAS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Notificaciones In-App */}
              {myNotifications.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                    <Bell size={13} className="text-white" />
                    <span>Novedades de Despacho ({myNotifications.length})</span>
                  </p>
                  {myNotifications.slice(0, 3).map((notif) => (
                    <div
                      key={notif.id}
                      className="rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between text-white font-bold mb-0.5">
                        <span>{notif.title}</span>
                        <span className="text-[10px] text-white/40">{notif.date}</span>
                      </div>
                      <p className="text-white/80 text-[11px] leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {customerOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-white/40">
                  Aún no has realizado compras con esta cuenta.
                </div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black text-white">{ord.code}</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ord.status === 'ENTREGADA'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : ord.status === 'DESPACHADA'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-white/10 text-white/90 border-white/20'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      {/* Notificación de envío y botón de entrega */}
                      {ord.status === 'DESPACHADA' && (
                        <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-3 text-[11px] space-y-2">
                          <div className="flex items-center gap-2 text-purple-300 font-bold">
                            <Truck size={14} />
                            <span>¡Tu pedido ya va en camino hacia tu dirección!</span>
                          </div>
                          <p className="text-white/80">
                            Transportadora: <strong>{ord.carrier || 'Servientrega / Envía'}</strong>
                            {ord.trackingNumber && ` • Guía: ${ord.trackingNumber}`}
                          </p>
                          <button
                            type="button"
                            onClick={() => confirmCustomerDelivery(ord.id)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-500 shadow-md transition cursor-pointer"
                          >
                            <CheckCircle2 size={15} />
                            <span>Confirmar que he recibido mi pedido (Entregado)</span>
                          </button>
                        </div>
                      )}

                      {ord.status === 'ENTREGADA' && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-2.5 text-[11px] text-emerald-300 font-bold flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          <span>Recepción confirmada satisfactoriamente</span>
                        </div>
                      )}

                      {/* Ítems del pedido */}
                      <div className="text-white/60 space-y-1 text-[11px] border-t border-white/5 pt-2">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{it.qty}x {it.name} (Talla {it.size || 'M'})</span>
                            <span className="font-mono text-white/80">{formatUSD(it.price)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total y botón de rastreo */}
                      <div className="flex items-center justify-between border-t border-white/10 pt-2 font-bold">
                        <div>
                          <span className="font-mono text-sm text-white">{formatUSD(ord.total)}</span>
                          <span className="font-mono text-xs text-emerald-400 block font-normal">≈ {formatCOP(ord.total)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            openTracking(ord.code);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition cursor-pointer"
                        >
                          <span>Ver Rastreo</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIRECCIÓN DE ENVÍO */}
          {activeTab === 'address' && (
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>Dirección Predeterminada para Despachos</span>
                </h4>
                <p className="text-[11px] text-white/60">
                  Guarda tus datos de domicilio en Colombia para que tu checkout sea instantáneo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase">Nombre Completo</label>
                    <input
                      type="text"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      value={addressData.fullName}
                      onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase">Teléfono Móvil (WhatsApp)</label>
                    <input
                      type="tel"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      value={addressData.phone}
                      onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                      placeholder="Ej: +57 312 456 7890"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase">Departamento</label>
                    <input
                      type="text"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      value={addressData.department}
                      onChange={(e) => setAddressData({ ...addressData, department: e.target.value })}
                      placeholder="Cundinamarca / Antioquia"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase">Ciudad / Municipio</label>
                    <input
                      type="text"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      placeholder="Bogotá D.C. / Medellín"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase">Dirección Completa (Calle, Número, Apto)</label>
                  <input
                    type="text"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                    value={addressData.streetAddress}
                    onChange={(e) => setAddressData({ ...addressData, streetAddress: e.target.value })}
                    placeholder="Ej: Cra 11 # 93-45 Apto 502"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase">Instrucciones de Entrega (Opcional)</label>
                  <input
                    type="text"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                    value={addressData.notes}
                    onChange={(e) => setAddressData({ ...addressData, notes: e.target.value })}
                    placeholder="Ej: Dejar en portería o llamar antes de llegar"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-black hover:bg-neutral-200 transition cursor-pointer mt-2"
                >
                  <Save size={14} />
                  <span>Guardar Dirección de Envío</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PRIVACIDAD Y DERECHO AL OLVIDO (HABEAS DATA) */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-white/70" />
                  <span>Protección de Datos Personales (Ley 1581 de 2012)</span>
                </h4>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  En <strong>KAMIL SHOP</strong> garantizamos tu derecho constitucional a la autodeterminación
                  informativa. Puedes solicitar la supresión total de tus datos personales, historial de navegación y
                  credenciales en cualquier momento mediante el botón de eliminación segura.
                </p>
              </div>

              {/* Zona de Peligro: Eliminación de Cuenta */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                  <AlertTriangle size={15} />
                  <span>Zona de Peligro: Eliminación Permanente de Cuenta</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Al eliminar tu cuenta, se destruirán permanentemente tus datos de autenticación, sesión activa,
                  direcciones guardadas y preferencias de cliente en nuestros servidores. Esta acción es <strong>irreversible</strong>.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmWord('');
                    setShowDeleteConfirm(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-500 shadow-lg shadow-rose-950/40 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Eliminar Mi Cuenta Permanentemente</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 bg-[#121212] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] sm:text-xs text-white/40 text-center sm:text-left">
            KAMIL SHOP • Tienda Online Oficial
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* MODAL DE CONFIRMACIÓN DE DOBLE FACTOR PARA ELIMINAR CUENTA */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-[#160b0d] p-6 text-white space-y-4 shadow-2xl">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h4 className="text-base font-black text-rose-300">¿Eliminar tu cuenta permanentemente?</h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Esta acción no se puede deshacer. Se borrará tu usuario <strong>{user.email}</strong> y todas tus
                  preferencias de la plataforma KAMIL SHOP.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-mono text-white/60">
                  Para confirmar, escribe la palabra <strong className="text-rose-400">ELIMINAR</strong> abajo:
                </label>
                <input
                  type="text"
                  className="w-full mt-1.5 bg-black/50 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase tracking-wider outline-none focus:border-rose-400"
                  placeholder="ELIMINAR"
                  value={confirmWord}
                  onChange={(e) => setConfirmWord(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10 transition"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteAccount}
                  disabled={confirmWord.trim().toUpperCase() !== 'ELIMINAR' || isDeleting}
                  className={`rounded-xl px-4 py-2 text-xs font-black text-white transition ${
                    confirmWord.trim().toUpperCase() === 'ELIMINAR' && !isDeleting
                      ? 'bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-lg shadow-rose-900/50'
                      : 'bg-rose-950/50 text-white/30 cursor-not-allowed border border-rose-900/30'
                  }`}
                >
                  {isDeleting ? 'Borrando...' : 'Sí, Eliminar Mi Cuenta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
