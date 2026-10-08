import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { formatUSD, formatCOP } from '../services/currencyService';

/**
 * WishlistModal - Modal de Lista de Deseos (Favoritos)
 * Permite a los clientes guardar prendas y moverlas directamente al carrito de compras.
 */
export const WishlistModal = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, addItem, showToast } = useCart();
  useBodyScrollLock(isWishlistOpen);
  const { setQuickViewProduct } = useProducts();
  const [selectedSizes, setSelectedSizes] = useState({});

  if (!isWishlistOpen) return null;

  const handleSelectSize = (itemId, size) => {
    setSelectedSizes(prev => ({ ...prev, [itemId]: size }));
  };

  const handleMoveToCart = (item) => {
    const size = selectedSizes[item.id] || (item.sizes && item.sizes[0]) || 'M';
    addItem(item, size, 1);
    removeFromWishlist(item.id);
    showToast(`"${item.name}" movida al carrito de compras`, 'success');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] text-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart size={20} className="fill-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Mis Prendas Favoritas</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  {wishlist.length} {wishlist.length === 1 ? 'ítem' : 'ítems'}
                </span>
              </div>
              <p className="text-xs text-white/50">KAMIL SHOP • Tu colección guardada</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlist.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/5 text-white/30 border border-white/10">
                <Heart size={30} />
              </div>
              <h4 className="text-sm font-bold text-white">Aún no tienes prendas en tu lista de deseos</h4>
              <p className="text-xs text-white/50 max-w-xs mx-auto">
                Haz clic en el corazón de cualquier prenda del catálogo para guardarla aquí y comprarla luego.
              </p>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-black hover:bg-white/90 transition cursor-pointer mt-2"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.map((item) => {
                const currentSize = selectedSizes[item.id] || (item.sizes && item.sizes[0]) || 'M';
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs hover:border-white/20 transition"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl object-cover border border-white/10"
                      onError={(e) => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
                    />

                    <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                      <span className="font-mono text-[10px] text-white/60 uppercase tracking-wider block">
                        {(item.gender || 'UNISEX').toUpperCase()} • {(item.category || 'ROPA').toUpperCase()}
                      </span>
                      <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                      <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                        <span className="font-mono text-sm font-black text-white/90">{formatUSD(item.price)}</span>
                        <span className="font-mono text-xs text-emerald-400">≈ {formatCOP(item.price)}</span>
                      </div>

                      {/* Selector de tallas */}
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                        <span className="text-[10px] text-white/50 mr-1">Talla:</span>
                        {(item.sizes || ['S', 'M', 'L']).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSelectSize(item.id, s)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition border ${
                              currentSize === s
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-black hover:bg-neutral-200 transition cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        <span>Mover al Carrito</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-rose-400 hover:border-rose-400/40 transition cursor-pointer"
                        title="Quitar de favoritos"
                      >
                        <Trash2 size={13} />
                        <span className="sm:hidden">Quitar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="border-t border-white/10 p-4 bg-[#121212] flex items-center justify-between">
            <span className="text-xs text-white/40">Guardado automáticamente en tu dispositivo</span>
            <button
              type="button"
              onClick={() => setIsWishlistOpen(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
