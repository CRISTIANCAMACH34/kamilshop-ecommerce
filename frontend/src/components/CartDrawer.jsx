import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { formatUSD, formatCOP, formatThousands } from '../services/currencyService';
import {
  X,
  Trash2,
  Gift,
  Truck,
  Tag,
  ShoppingBag,
  Sparkles,
  ArrowRight
} from 'lucide-react';

/**
 * CartDrawer - Carrito de Compras de Alta Conversión
 * Incluye bloqueo de scroll de fondo, paleta limpia en blanco y negro, cupones y cross-sell.
 */
export const CartDrawer = () => {
  const {
    items,
    count,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    isDrawerOpen,
    setIsDrawerOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    addItem,
    amountNeededForFreeShipping,
    freeShippingProgress,
    orderNotes,
    setOrderNotes,
    isGiftWrapped,
    setIsGiftWrapped,
    showToast
  } = useCart();

  // Bloqueo de scroll en la página de atrás cuando el carrito está abierto
  useBodyScrollLock(isDrawerOpen);

  const [couponCode, setCouponCode] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleApplyCoupon = (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;
    applyCoupon(code.trim());
    setCouponCode('');
  };

  const handleProceedCheckout = () => {
    setIsDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddCrossSell = () => {
    addItem({
      id: 'acc-socks-premium',
      name: 'Pack Medias Algodón Peinado x3',
      price: 15.00,
      image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&auto=format&fit=crop&q=80',
      category: 'accesorios',
      sizes: ['UNICA']
    }, 'UNICA', 1);
    showToast('Pack de Medias agregado con éxito');
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 z-[1000] h-full w-full max-w-md bg-[#0d0d0d] text-white border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} className="text-white" />
            <h3 className="text-base font-black tracking-wide text-white">Tu Carrito</h3>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
              {count} {count === 1 ? 'prenda' : 'prendas'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-[11px] font-mono text-white/40 hover:text-rose-400 transition"
                title="Vaciar carrito"
              >
                Vaciar
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra de Progreso de Envío Gratis */}
        {items.length > 0 && (
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-white/80 font-bold">
                <Truck size={14} className="text-emerald-400" />
                {amountNeededForFreeShipping > 0
                  ? `Te faltan ${formatUSD(amountNeededForFreeShipping)} (≈ ${formatCOP(amountNeededForFreeShipping)}) para Envío Gratis`
                  : '🎉 ¡Felicidades! Tienes ENVÍO GRATIS a todo Colombia'}
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">{freeShippingProgress}%</span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal de confirmación para vaciar */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/30 text-xs flex items-center justify-between">
            <span className="text-rose-300 font-bold">¿Deseas vaciar todas las prendas del carrito?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-[11px]"
              >
                Sí, vaciar
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-[11px]"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Body: Lista de Prendas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/5 text-white/30 border border-white/10">
                <ShoppingBag size={28} />
              </div>
              <h4 className="text-sm font-bold text-white">Tu carrito está vacío</h4>
              <p className="text-xs text-white/50 max-w-xs mx-auto">
                Explora el catálogo oficial de KAMIL SHOP y añade tus prendas favoritas.
              </p>
              <a
                href="#catalogo"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-black hover:bg-neutral-200 transition cursor-pointer mt-2"
              >
                <span>Ver Colección</span>
                <ArrowRight size={14} />
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-xs hover:border-white/20 transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover border border-white/10 shrink-0"
                    onError={(e) => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-white/50">
                      Talla: <span className="text-white font-bold">{item.size}</span>
                      {item.color && <span> • Color: {item.color}</span>}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-mono text-xs font-bold text-white/90">
                        {formatUSD(item.price)}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400">
                        (≈ {formatCOP(item.price)})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, -1)}
                        className="px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 transition"
                      >
                        −
                      </button>
                      <span className="font-mono text-xs font-bold px-2 text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, 1)}
                        className="px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 transition"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-white/40 hover:text-rose-400 transition cursor-pointer"
                      title="Eliminar del carrito"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Cross-Sell */}
              <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-3.5 space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-400" />
                    <span>Completa tu look con descuento</span>
                  </span>
                  <span className="font-mono text-[10px] text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/15">20% OFF</span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=100&auto=format&fit=crop&q=80"
                    alt="Medias"
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0 text-[11px]">
                    <span className="font-bold text-white block truncate">Pack Medias Algodón x3</span>
                    <span className="font-mono text-white/60">$15.00 USD</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCrossSell}
                    className="px-2.5 py-1.5 rounded-lg bg-white text-black font-black text-[11px] hover:bg-neutral-200 transition cursor-pointer"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Empaque de Regalo y Notas */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={isGiftWrapped}
                    onChange={(e) => setIsGiftWrapped(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-white focus:ring-white"
                  />
                  <Gift size={13} className="text-white" />
                  <span>Incluir empaque de regalo y tarjeta de dedicatoria</span>
                </label>

                <div>
                  <textarea
                    rows="2"
                    placeholder="Instrucciones para el domiciliario o mensaje de dedicatoria..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Totales y Checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-5 bg-[#121212] space-y-3.5">
            {/* Formulario de Cupón */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CUPÓN (Ej: KAMIL10)"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
                >
                  APLICAR
                </button>
              </div>

              {/* Chips de cupones recomendados */}
              <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                <Tag size={11} />
                <span>Prueba:</span>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon('KAMIL10')}
                  className="text-white hover:underline font-mono"
                >
                  KAMIL10
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon('KAMIL20')}
                  className="text-white hover:underline font-mono"
                >
                  KAMIL20
                </button>
              </div>
            </div>

            {/* Desglose Financiero */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-white/60">
                <span>Subtotal</span>
                <div className="text-right">
                  <span className="font-mono text-white">{formatUSD(subtotal)}</span>
                  <span className="font-mono text-[10px] text-emerald-400 block">≈ {formatCOP(subtotal)}</span>
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Descuento ({discountPercent}%)</span>
                  <span className="font-mono">-{formatUSD(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-white/60">
                <span>Envío Nacional</span>
                <span className="font-mono text-emerald-400 font-bold">GRATIS</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-white pt-2 border-t border-white/10">
                <span>Total Estimado</span>
                <div className="text-right">
                  <span className="font-mono text-white text-base">{formatUSD(total)}</span>
                  <span className="font-mono text-emerald-400 text-xs block font-bold">≈ {formatCOP(total)}</span>
                </div>
              </div>
            </div>

            {/* Botón Checkout con Wompi */}
            <button
              type="button"
              onClick={handleProceedCheckout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-xs font-black text-black hover:bg-neutral-200 shadow-xl transition cursor-pointer"
            >
              <span>PROCEDER AL PAGO CON WOMPI ({formatCOP(total)})</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
