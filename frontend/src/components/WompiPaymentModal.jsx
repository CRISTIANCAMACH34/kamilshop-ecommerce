import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  X,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  Truck,
  ExternalLink,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { fetchLiveUsdCopRate, getUsdCopRate, formatCOP, formatUSD, subscribeCurrencyRate } from '../services/currencyService';

/**
 * WompiPaymentModal - Pasarela de Pago Oficial de Colombia para KAMIL SHOP
 * Soporta Bancolombia, PSE (Bancos Nacionales), Nequi, Tarjetas de Crédito y Débito.
 */
export const WompiPaymentModal = ({ open, onClose }) => {
  useBodyScrollLock(open);

  const {
    items,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    orderNotes,
    isGiftWrapped,
    clearCart,
    showToast
  } = useCart();

  const { createOrder, openTracking } = useOrders();
  const { deductStock } = useProducts();
  const { user } = useAuth();

  // Moneda: 'COP' o 'USD' (Consulta TRM en vivo desde API financiera)
  const [currency, setCurrency] = useState('COP');
  const [copRate, setCopRate] = useState(getUsdCopRate());

  useEffect(() => {
    fetchLiveUsdCopRate().then(rate => setCopRate(rate));
    const unsubscribe = subscribeCurrencyRate(rate => setCopRate(rate));
    return unsubscribe;
  }, []);

  // Método Wompi: 'bancolombia' | 'pse' | 'nequi' | 'card' | 'cod'
  const [paymentChannel, setPaymentChannel] = useState('bancolombia');

  // Datos del Pagador
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Bogotá D.C.');

  // Datos específicos del método
  const [pseBank, setPseBank] = useState('bancolombia');
  const [nequiPhone, setNequiPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');

  // Estado del flujo de pago: 'form' | 'processing' | 'approved'
  const [paymentState, setPaymentState] = useState('form');
  const [transactionData, setTransactionData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos de reserva atómica

  useEffect(() => {
    if (!open || paymentState !== 'form') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, paymentState]);

  useEffect(() => {
    if (user) {
      if (user.name && !payerName) setPayerName(user.name);
      if (user.email && !payerEmail) setPayerEmail(user.email);
    }

    try {
      const savedAddr = localStorage.getItem('titulo_customer_addresses');
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        if (parsed.streetAddress && !deliveryAddress) setDeliveryAddress(parsed.streetAddress);
        if (parsed.city && !city) setCity(parsed.city);
        if (parsed.phone && !payerPhone) setPayerPhone(parsed.phone);
      }
    } catch {}
  }, [user, open]);

  if (!open) return null;

  const totalCOP = Math.round(total * copRate);
  const formattedCOP = formatCOP(total, copRate);
  const formattedUSD = formatUSD(total);

  const colombianBanks = [
    { id: 'bancolombia', name: 'Bancolombia' },
    { id: 'davivienda', name: 'Davivienda' },
    { id: 'bogota', name: 'Banco de Bogotá' },
    { id: 'bbva', name: 'BBVA Colombia' },
    { id: 'occidente', name: 'Banco de Occidente' },
    { id: 'popular', name: 'Banco Popular' },
    { id: 'scotiabank', name: 'Scotiabank Colpatria' },
    { id: 'itau', name: 'Itaú Colombia' },
    { id: 'nequi', name: 'Nequi (vía PSE)' },
    { id: 'dale', name: 'Dale!' },
    { id: 'lulo', name: 'Lulo Bank' },
    { id: 'nu', name: 'Nu Colombia' },
    { id: 'falabella', name: 'Banco Falabella' },
  ];

  const handleProcessWompiPayment = (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      showToast('Por favor ingresa tu dirección de entrega en Colombia', 'error');
      return;
    }

    setPaymentState('processing');

    // Simulación del apretón de manos con los servidores de Wompi Bancolombia
    setTimeout(() => {
      const wompiRef = `TTL-WMP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const authCode = `AUT-${Math.floor(10000000 + Math.random() * 90000000)}`;

      // 1. Crear la orden de manera atómica
      const createdOrder = createOrder({
        name: payerName || 'Cliente Kamil Shop',
        email: payerEmail || 'cliente@kamilshop.store',
        phone: payerPhone || '+57 300 000 0000',
        address: `${deliveryAddress}, ${city}`,
        city,
        carrier: 'Servientrega Direct',
        wompiReference: wompiRef,
        wompiChannel: paymentChannel.toUpperCase(),
        notes: orderNotes,
        isGiftWrapped,
        items: items.map(it => ({
          name: it.name,
          size: it.size,
          color: it.color || 'Estándar',
          sku: `TTL-${it.productId || 'SKU'}`,
          qty: it.quantity,
          price: it.price
        })),
        total: total
      });

      // 2. Descontar inventario de forma ACID
      if (deductStock) {
        deductStock(items);
      }

      setTransactionData({
        orderCode: createdOrder.code,
        wompiRef,
        authCode,
        date: new Date().toLocaleString('es-CO'),
        amountCOP: formattedCOP,
        amountUSD: formattedUSD,
        channel: paymentChannel.toUpperCase(),
        payer: payerName || 'Cliente',
        email: payerEmail
      });

      setPaymentState('approved');
      clearCart();
      showToast('¡Pago aprobado por Wompi Bancolombia!', 'success');
    }, 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (paymentState !== 'processing') onClose();
        }}
      />

      {/* Ventana de Wompi */}
      <div className="relative z-10 w-full max-w-2xl h-[96vh] sm:h-auto sm:max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0d0d0d] text-white shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

        {/* Wompi Header Oficial */}
        <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-3 sm:p-5 bg-[#121212] flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Logo Estilizado Wompi */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#2d1b69]/40 border border-[#7952f5]/40 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl flex-shrink-0">
              <span className="font-black text-xs sm:text-sm tracking-wider text-[#a78bfa]">wompi</span>
              <span className="hidden sm:inline text-[10px] text-white/50 border-l border-white/20 pl-2">Bancolombia</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-black text-white truncate leading-tight">Checkout Seguro Wompi</h3>
              <p className="text-[10px] text-white/50 truncate hidden sm:block">KAMIL SHOP • Pasarela Oficial Colombia</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Selector de Moneda */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setCurrency('COP')}
                className={`px-2 py-1 rounded-lg transition ${currency === 'COP' ? 'bg-white text-black font-black' : 'text-white/60 hover:text-white'}`}
                title="Mostrar valores en Pesos Colombianos (COP)"
              >
                COP
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-lg transition ${currency === 'USD' ? 'bg-white text-black font-black' : 'text-white/60 hover:text-white'}`}
                title="Mostrar valores en Dólares (USD)"
              >
                USD
              </button>
            </div>

            {paymentState !== 'processing' && (
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
                title="Cerrar pasarela de pago"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO SEGÚN ESTADO */}
        {paymentState === 'form' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 -webkit-overflow-scrolling-touch">

            {/* Banner de Reserva de Inventario (Drops & High Demand) */}
            <div className="flex items-center justify-between text-xs font-mono px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Reserva de stock asegurada:
              </span>
              <span className="font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} min restantes
              </span>
            </div>
            
            {/* Resumen de Total */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div>
                <span className="text-[11px] font-mono text-white/60 uppercase block">Total a Pagar ({items.length} prendas):</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {currency === 'COP' ? formattedCOP : formattedUSD}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    ({currency === 'COP' ? formattedUSD : formattedCOP})
                  </span>
                </div>
                <span className="text-[10px] text-white/50 block mt-0.5 font-mono">Tasa TRM en vivo: 1 USD = ${copRate.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="text-left sm:text-right text-[11px] text-white/60 space-y-0.5">
                <div>Envío Nacional: <strong className="text-emerald-400">GRATIS</strong></div>
                {discountPercent > 0 && (
                  <div className="text-emerald-400">Cupón aplicado: -{discountPercent}%</div>
                )}
                {isGiftWrapped && (
                  <div className="text-purple-300">Empaque de Regalo: Incluido</div>
                )}
              </div>
            </div>

            {/* Selector de Canales de Pago Wompi */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-white/60 uppercase tracking-wider block">
                Selecciona tu medio de pago Wompi:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bancolombia', label: 'Bancolombia', icon: Building2, desc: 'Botón y Transferencia' },
                  { id: 'pse', label: 'PSE', icon: Building2, desc: 'Todos los Bancos' },
                  { id: 'nequi', label: 'Nequi', icon: Smartphone, desc: 'Aprobación Móvil' },
                  { id: 'card', label: 'Tarjetas', icon: CreditCard, desc: 'Crédito / Débito' },
                ].map(method => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentChannel(method.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                        paymentChannel === method.id
                          ? 'border-white bg-white/10 text-white ring-1 ring-white/30'
                          : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      <Icon size={20} className={paymentChannel === method.id ? 'text-white' : 'text-white/40'} />
                      <span className="text-xs font-bold mt-1.5">{method.label}</span>
                      <span className="text-[9px] text-white/40 leading-tight">{method.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formulario Principal de Datos */}
            <form onSubmit={handleProcessWompiPayment} className="space-y-4">
              
              {/* Datos de Entrega */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <h4 className="text-xs font-mono text-white/90 uppercase tracking-wider">
                  1. Datos del Pagador y Dirección de Despacho
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase">Nombre Completo</label>
                    <input
                      type="text"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      placeholder="Tu nombre completo"
                      value={payerName}
                      onChange={e => setPayerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase">Correo Electrónico (Para Recibo)</label>
                    <input
                      type="email"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      placeholder="ejemplo@correo.com"
                      value={payerEmail}
                      onChange={e => setPayerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Dirección de Entrega en Colombia</label>
                    <input
                      type="text"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      placeholder="Cra 15 # 88-21 Apto 301"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/50 uppercase">Ciudad</label>
                    <input
                      type="text"
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                      placeholder="Bogotá D.C."
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Campos dinámicos según el canal Wompi */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <h4 className="text-xs font-mono text-white/90 uppercase tracking-wider">
                  2. Datos de Transacción Wompi ({paymentChannel.toUpperCase()})
                </h4>

                {/* BANCOLOMBIA */}
                {paymentChannel === 'bancolombia' && (
                  <div className="space-y-2 text-xs text-white/80">
                    <p className="text-[11px] text-white/60">
                      Paga debitando directamente desde tu cuenta de ahorros o corriente Bancolombia sin costo de comisión.
                    </p>
                    <div className="rounded-xl bg-white/5 p-3 flex items-center justify-between">
                      <span>Débito Automático Botón Bancolombia</span>
                      <span className="font-mono text-emerald-400 font-bold">Activo</span>
                    </div>
                  </div>
                )}

                {/* PSE */}
                {paymentChannel === 'pse' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono text-white/50 uppercase">Selecciona tu Banco de Colombia</label>
                      <select
                        className="w-full mt-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50"
                        value={pseBank}
                        onChange={e => setPseBank(e.target.value)}
                      >
                        {colombianBanks.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-white/50 uppercase">Tipo de Persona</label>
                      <select className="w-full mt-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50">
                        <option value="natural">Persona Natural</option>
                        <option value="juridica">Persona Jurídica (Empresa)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* NEQUI */}
                {paymentChannel === 'nequi' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Número de Celular Nequi</label>
                    <input
                      type="tel"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50 font-mono"
                      placeholder="312 000 0000"
                      value={nequiPhone}
                      onChange={e => setNequiPhone(e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-white/50">
                      Recibirás una notificación push en tu app Nequi para autorizar el débito en segundos.
                    </p>
                  </div>
                )}

                {/* TARJETA */}
                {paymentChannel === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono text-white/50 uppercase">Número de Tarjeta (Visa / Mastercard / Amex)</label>
                      <input
                        type="text"
                        maxLength="19"
                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50 font-mono"
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-white/50 uppercase">Expira (MM/AA)</label>
                        <input
                          type="text"
                          maxLength="5"
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50 font-mono text-center"
                          placeholder="12/28"
                          value={cardExp}
                          onChange={e => setCardExp(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-white/50 uppercase">CVV</label>
                        <input
                          type="password"
                          maxLength="4"
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/50 font-mono text-center"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-white/50 uppercase">Cuotas</label>
                        <select
                          className="w-full mt-1 bg-zinc-900 border border-white/10 rounded-xl px-2 py-2 text-xs text-white outline-none focus:border-white/50 font-mono"
                          value={cardInstallments}
                          onChange={e => setCardInstallments(e.target.value)}
                        >
                          <option value="1">1 cuota</option>
                          <option value="3">3 cuotas</option>
                          <option value="6">6 cuotas</option>
                          <option value="12">12 cuotas</option>
                          <option value="24">24 cuotas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Pago */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3 sm:px-5 py-3.5 text-[11px] sm:text-xs font-black text-black hover:bg-neutral-200 shadow-xl transition cursor-pointer"
              >
                <Lock size={15} className="shrink-0" />
                <span className="truncate">PAGAR CON WOMPI {currency === 'COP' ? formattedCOP : formattedUSD}</span>
                <ArrowRight size={15} className="shrink-0" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 pt-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Transacción cifrada de 256 bits procesada por Wompi Bancolombia</span>
              </div>
            </form>
          </div>
        )}

        {/* PANTALLA DE PROCESAMIENTO */}
        {paymentState === 'processing' && (
          <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full border-4 border-white/20 border-t-white animate-spin" />
            <h3 className="text-base font-black text-white">Procesando pago con Wompi...</h3>
            <p className="text-xs text-white/60 max-w-sm leading-relaxed">
              Verificando fondos y emitiendo autorización con la red de pagos de Colombia. No cierres esta ventana.
            </p>
          </div>
        )}

        {/* PANTALLA DE COMPROBANTE OFICIAL APROBADO */}
        {paymentState === 'approved' && transactionData && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] p-6 text-center space-y-3">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={32} />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                PAGO APROBADO POR WOMPI
              </span>
              <h3 className="text-xl font-black text-white">¡Gracias por tu compra, {transactionData.payer}!</h3>
              <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                Tu pedido ha sido confirmado e ingresó a la comanda de la Dark Store de <strong>KAMIL SHOP</strong>.
              </p>
            </div>

            {/* Recibo Oficial de Wompi */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 text-xs space-y-2.5 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-0.5">
                <span className="text-white/50">CÓDIGO DE ORDEN:</span>
                <span className="text-white font-bold">{transactionData.orderCode}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-0.5">
                <span className="text-white/50">REFERENCIA WOMPI:</span>
                <span className="text-white font-bold">{transactionData.wompiRef}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-0.5">
                <span className="text-white/50">AUTORIZACIÓN BANCARIA:</span>
                <span className="text-white/80">{transactionData.authCode}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-0.5">
                <span className="text-white/50">MÉTODO UTILIZADO:</span>
                <span className="text-white/80">{transactionData.channel}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-0.5">
                <span className="text-white/50">FECHA Y HORA (COT):</span>
                <span className="text-white/80">{transactionData.date}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 text-xs sm:text-sm font-bold gap-1">
                <span className="text-white">VALOR TOTAL LIQUIDADO:</span>
                <span className="text-emerald-400 break-words">{transactionData.amountCOP} ({transactionData.amountUSD})</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openTracking(transactionData.orderCode);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-black hover:bg-neutral-200 transition cursor-pointer"
              >
                <Truck size={15} />
                <span>Rastrear Pedido en Vivo</span>
                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Printer size={15} />
                <span>Imprimir Recibo</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-xs font-bold text-white/60 hover:text-white transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
