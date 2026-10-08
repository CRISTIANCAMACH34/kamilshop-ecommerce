import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  X,
  Heart,
  Ruler,
  Truck,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Zap,
  Check
} from 'lucide-react';
import { formatCOP, formatUSD, formatThousands } from '../services/currencyService';

/**
 * QuickViewModal - Vista Rápida Editorial de Prenda para KAMIL SHOP
 */
export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, products } = useProducts();
  useBodyScrollLock(!!quickViewProduct);
  const {
    addItem,
    setIsDrawerOpen,
    setIsCheckoutOpen,
    setIsSizeGuideOpen,
    toggleWishlist,
    isWishlisted,
    showToast
  } = useCart();

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      if (quickViewProduct.sizes && quickViewProduct.sizes.length) {
        setSelectedSize(quickViewProduct.sizes[0]);
      }
      if (quickViewProduct.colors && quickViewProduct.colors.length) {
        setSelectedColor(quickViewProduct.colors[0]);
      } else {
        setSelectedColor({ name: 'Negro Clásico', hex: '#111111' });
      }
      setQty(1);
      // Simular número aleatorio de personas viendo la prenda entre 9 y 24
      setViewersCount(Math.floor(9 + Math.random() * 15));
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isFav = isWishlisted(quickViewProduct.id);

  // Colores por defecto si la prenda no trae lista explícita
  const availableColors = (quickViewProduct.colors && quickViewProduct.colors.length > 0)
    ? quickViewProduct.colors
    : [
        { name: 'Negro Carbón', hex: '#111111' },
        { name: 'Blanco Crudo', hex: '#F5F5F0' },
        { name: 'Gris Grafito', hex: '#4A4A4A' },
        { name: 'Beige Arena', hex: '#C2B69D' },
      ];

  // Identificar prendas para sugerir como Combo/Bundle
  const comboPartner = products.find(p => p.id !== quickViewProduct.id && p.category !== quickViewProduct.category) || products[0];

  const handleAddToCart = () => {
    addItem(quickViewProduct, selectedSize, qty, selectedColor?.name);
    setQuickViewProduct(null);
  };

  const handleBuyNow = () => {
    addItem(quickViewProduct, selectedSize, qty, selectedColor?.name);
    setQuickViewProduct(null);
    setIsDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddComboToCart = () => {
    if (!comboPartner) return;
    addItem(quickViewProduct, selectedSize, 1, selectedColor?.name);
    addItem(comboPartner, comboPartner.sizes ? comboPartner.sizes[0] : 'M', 1);
    setQuickViewProduct(null);
    showToast('¡Combo de prendas añadido con éxito al carrito!', 'success');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] text-white shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Botón de Cierre */}
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 grid h-8 w-8 place-items-center rounded-xl bg-black/60 text-white/70 hover:bg-black hover:text-white transition"
          aria-label="Cerrar vista rápida"
        >
          <X size={18} />
        </button>

        {/* Columna Izquierda: Imagen y Badges */}
        <div className="w-full md:w-1/2 relative bg-[#141414] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/10">
          <img
            src={selectedColor?.image || quickViewProduct.image}
            alt={quickViewProduct.name}
            className="w-full h-80 md:h-[460px] object-cover rounded-2xl shadow-xl"
            onError={(e) => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
          />

          {/* Badge de Wishlist */}
          <button
            type="button"
            onClick={() => toggleWishlist(quickViewProduct)}
            className={`absolute top-8 left-8 grid h-10 w-10 place-items-center rounded-2xl backdrop-blur-md transition ${
              isFav ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50' : 'bg-black/60 text-white/70 hover:text-white border border-white/10'
            }`}
            title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Heart size={18} className={isFav ? 'fill-rose-400' : ''} />
          </button>

          {/* Badge de Categoría y Género */}
          <div className="absolute bottom-8 left-8 flex flex-wrap gap-2">
            <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white border border-white/20 uppercase">
              {(quickViewProduct.gender || 'UNISEX')}
            </span>
            <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white/80 border border-white/15 uppercase">
              {quickViewProduct.category}
            </span>
          </div>
        </div>

        {/* Columna Derecha: Detalles de Compra */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto space-y-5">
          
          {/* Header de Prenda */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/70 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{formatThousands(quickViewProduct.stock || 12)} unidades en existencia en Dark Store Bogotá</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white">{quickViewProduct.name}</h3>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-mono text-2xl font-black text-white">
                {formatUSD(quickViewProduct.price)}
              </span>
              <span className="font-mono text-xs text-emerald-400 font-semibold">
                (Aprox. {formatCOP(quickViewProduct.price)} TRM)
              </span>
            </div>
          </div>

          <p className="text-xs text-white/70 leading-relaxed">
            {quickViewProduct.description}
          </p>

          {/* Selector de Colores */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Color:</span>
              <span className="text-white/60 font-mono text-[11px]">{selectedColor?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {availableColors.map((col, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`h-8 w-8 rounded-full border-2 transition flex items-center justify-center cursor-pointer ${
                    selectedColor?.name === col.name ? 'border-white ring-2 ring-white/40 scale-110' : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {selectedColor?.name === col.name && (
                    <Check size={14} className={col.hex === '#FFFFFF' || col.hex === '#F5F5F0' ? 'text-black' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Tallas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Talla:</span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="inline-flex items-center gap-1 text-white/80 hover:text-white hover:underline font-mono text-[11px] cursor-pointer"
              >
                <Ruler size={13} />
                <span>¿Cuál es mi talla? (Guía en cm)</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(quickViewProduct.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                    selectedSize === s
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono pt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Disponible en Bodega Central • Envíos a toda Colombia</span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center text-xs font-mono font-bold text-white outline-none focus:border-white/50"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
              >
                <ShoppingBag size={15} />
                <span>AÑADIR AL CARRITO</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-xs font-black text-black hover:bg-neutral-200 shadow-xl transition cursor-pointer"
            >
              <Zap size={15} />
              <span>COMPRAR AHORA CON WOMPI →</span>
            </button>
          </div>

          {/* Oferta de Combo / Outfit Completo */}
          {comboPartner && (
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Arma tu Outfit Completo</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  15% OFF EN COMBO
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={comboPartner.image}
                  alt={comboPartner.name}
                  className="h-11 w-11 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-bold text-white block truncate">+ {comboPartner.name}</span>
                  <span className="font-mono text-white/50 text-[11px]">{formatUSD(comboPartner.price)} (≈ {formatCOP(comboPartner.price)})</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddComboToCart}
                  className="px-3 py-1.5 rounded-xl bg-white text-black font-black text-[11px] hover:bg-neutral-200 transition cursor-pointer"
                >
                  Llevar Combo
                </button>
              </div>
            </div>
          )}

          {/* Garantías de Entrega */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Truck size={13} className="text-white shrink-0" />
              <span>Envíos seguros a todo Colombia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
              <span>30 días para cambios de talla</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
