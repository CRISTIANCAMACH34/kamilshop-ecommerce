import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft,
  Heart,
  Ruler,
  Truck,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Zap,
  Check,
  Share2,
  RefreshCw,
  Package,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCOP, formatUSD, formatThousands, fetchLiveUsdCopRate, getUsdCopRate, subscribeCurrencyRate } from '../services/currencyService';

/**
 * ProductDetailWindow - Ventana Completa de Detalle de Prenda
 * Diseño editorial premium en tonos neutros y blanco y negro.
 * Sincronización dinámica de variantes de color con su imagen y stock por talla.
 */
export const ProductDetailWindow = ({ product, onBack }) => {
  const { products, setQuickViewProduct } = useProducts();
  const {
    addItem,
    setIsDrawerOpen,
    setIsCheckoutOpen,
    setIsSizeGuideOpen,
    toggleWishlist,
    isWishlisted,
    showToast
  } = useCart();

  // Obtener variantes de color relacionadas por color_variants o por group_id
  const relatedColorVariants = useMemo(() => {
    if (!product) return [];
    if (product.color_variants && Array.isArray(product.color_variants) && product.color_variants.length > 0) {
      return product.color_variants.map((v, idx) => ({
        ...product,
        id: v.id || `${product.id}-var-${idx}`,
        color_name: v.color_name || v.name,
        color_hex: v.color_hex || v.hex || '#111111',
        image: v.image || product.image,
        size_stock: v.size_stock || product.size_stock || {},
        sizes: (v.size_stock && Object.keys(v.size_stock).length > 0)
          ? Object.keys(v.size_stock)
          : (product.sizes || ['S', 'M', 'L', 'XL', 'XXL']),
        stock: v.stock ?? (v.size_stock ? Object.values(v.size_stock).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0) : product.stock)
      }));
    }
    if (product.group_id) {
      const siblings = products.filter(p => p.group_id === product.group_id);
      if (siblings.length > 0) return siblings;
    }
    return [product];
  }, [product, products]);

  const [activeVariant, setActiveVariant] = useState(product);
  const currentVariant = activeVariant || product;

  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImage, setActiveImage] = useState(product?.image);
  const [qty, setQty] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('specs'); // 'specs' | 'care' | 'shipping'

  // Sincronizar estado cuando cambia el producto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      setActiveVariant(product);
      setActiveImage(product.image);
      setQty(1);

      // Buscar primera talla con stock disponible en el producto inicial
      const initialSizes = (product.size_stock && Object.keys(product.size_stock).length > 0)
        ? Object.keys(product.size_stock)
        : (product.sizes || ['S', 'M', 'L']);

      const firstInStock = initialSizes.find(s => {
        const stk = product.size_stock ? (product.size_stock[s] ?? 0) : (product.stock ?? 1);
        return stk > 0;
      });

      setSelectedSize(firstInStock || initialSizes[0] || 'M');
    }
  }, [product]);

  if (!product) return null;

  const isFav = isWishlisted(product.id);

  // Galería de fotos complementarias
  const galleryImages = [
    activeImage || currentVariant.image || product.image,
    currentVariant.image || product.image,
    'assets/products/apparel-jacket-tech.jpg',
    'assets/products/apparel-tee-black.jpg'
  ].filter((img, idx, arr) => arr.indexOf(img) === idx);

  // Prenda para combo / outfit
  const comboPartner = products.find(p => p.id !== product.id && p.category !== product.category) || products[0];

  // Prendas relacionadas (misma categoría o género, excluyendo mismo grupo)
  const relatedProducts = products
    .filter(p => p.id !== product.id && p.group_id !== product.group_id && (p.category === product.category || p.gender === product.gender))
    .slice(0, 4);

  // Cambio dinámico de color: cambia imagen y reevalúa disponibilidad de tallas
  const handleColorVariantSelect = (variant) => {
    setActiveVariant(variant);
    if (variant.image) {
      setActiveImage(variant.image);
    }

    const vSizes = (variant.size_stock && Object.keys(variant.size_stock).length > 0)
      ? Object.keys(variant.size_stock)
      : (variant.sizes || ['S', 'M', 'L', 'XL']);

    // Si la talla actualmente seleccionada está agotada en este nuevo color, auto-seleccionar la primera disponible
    const curStock = variant.size_stock ? (variant.size_stock[selectedSize] ?? 0) : (variant.stock ?? 1);
    if (curStock <= 0) {
      const nextAvailable = vSizes.find(s => {
        const stk = variant.size_stock ? (variant.size_stock[s] ?? 0) : (variant.stock ?? 1);
        return stk > 0;
      });
      if (nextAvailable) {
        setSelectedSize(nextAvailable);
      }
    }

    // Si es un producto registrado independiente en catálogo, actualizar URL/QuickView
    if (variant.id && variant.id !== product.id && products.some(p => p.id === variant.id)) {
      setQuickViewProduct(variant);
    }
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...currentVariant,
      id: currentVariant.id || product.id,
      image: activeImage || currentVariant.image,
      color_name: currentVariant.color_name || 'Estándar',
      color_hex: currentVariant.color_hex || '#111111'
    };
    addItem(itemToAdd, selectedSize, qty, currentVariant.color_name || 'Estándar');
  };

  const handleBuyNow = () => {
    const itemToAdd = {
      ...currentVariant,
      id: currentVariant.id || product.id,
      image: activeImage || currentVariant.image,
      color_name: currentVariant.color_name || 'Estándar',
      color_hex: currentVariant.color_hex || '#111111'
    };
    addItem(itemToAdd, selectedSize, qty, currentVariant.color_name || 'Estándar');
    setIsDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddComboToCart = () => {
    if (!comboPartner) return;
    const itemToAdd = {
      ...currentVariant,
      id: currentVariant.id || product.id,
      image: activeImage || currentVariant.image,
      color_name: currentVariant.color_name || 'Estándar',
      color_hex: currentVariant.color_hex || '#111111'
    };
    addItem(itemToAdd, selectedSize, 1, currentVariant.color_name || 'Estándar');
    addItem(comboPartner, comboPartner.sizes ? comboPartner.sizes[0] : 'M', 1);
    showToast('Combo de prendas añadido al carrito', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Mira esta prenda en Kamil Shop: ${product.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Enlace de la prenda copiado al portapapeles');
    }
  };

  const [copRate, setCopRate] = useState(getUsdCopRate());

  useEffect(() => {
    fetchLiveUsdCopRate().then(rate => setCopRate(rate));
    const unsubscribe = subscribeCurrencyRate(rate => setCopRate(rate));
    return unsubscribe;
  }, []);

  const formattedCOP = formatCOP(currentVariant.price || product.price, copRate);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 animate-in fade-in duration-300">
      
      {/* Barra Superior de Navegación y Migas de Pan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-white/10">
          
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white hover:bg-white/15 hover:border-white transition cursor-pointer"
          >
            <ArrowLeft size={16} className="text-white" />
            <span>Volver a la Colección</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-white/50">
            <span className="hover:text-white cursor-pointer" onClick={onBack}>Inicio</span>
            <span>/</span>
            <span className="hover:text-white cursor-pointer" onClick={onBack}>Colección</span>
            <span>/</span>
            <span className="text-white uppercase font-bold">{product.category}</span>
            <span>/</span>
            <span className="text-white/80 truncate max-w-xs">{product.name}</span>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Compartir prenda"
            >
              <Share2 size={14} />
              <span className="hidden md:inline">Compartir</span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isFav
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart size={14} className={isFav ? 'fill-rose-400' : ''} />
              <span className="hidden md:inline">{isFav ? 'En Favoritos' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal de la Ventana de Producto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES (7 columnas) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Imagen Principal en Alta Resolución */}
            <div className="relative rounded-3xl overflow-hidden bg-[#121212] border border-white/10 shadow-2xl group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-[480px] sm:h-[620px] object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
              />

              {/* Badges Flotantes */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="font-mono text-[10px] font-black px-3 py-1 rounded-xl bg-white text-black shadow-lg uppercase tracking-wider">
                  {product.badge || 'NUEVA COLECCIÓN'}
                </span>
                <span className="font-mono text-[10px] font-bold px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white border border-white/20 uppercase">
                  {(product.gender || 'UNISEX').toUpperCase()} • {product.category.toUpperCase()}
                </span>
              </div>

              {/* Botón de Favorito Flotante */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-2xl backdrop-blur-md transition shadow-xl ${
                  isFav
                    ? 'bg-rose-500/30 text-rose-400 border border-rose-500/60'
                    : 'bg-black/60 text-white/70 hover:text-white border border-white/20'
                }`}
                title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                <Heart size={20} className={isFav ? 'fill-rose-400' : ''} />
              </button>

              {/* Disponibilidad real en Dark Store */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-mono">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {currentVariant.stock ? `${formatThousands(currentVariant.stock)} unidades en existencia • Color: ${currentVariant.color_name || 'Estándar'}` : 'En inventario para despacho nacional'}
                  </span>
                </div>
                <span className="text-white/60 font-mono text-[11px]">Bodega Central // Importación USA</span>
              </div>
            </div>

            {/* Tira de Miniaturas */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {galleryImages.map((imgSrc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgSrc)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition cursor-pointer h-24 sm:h-28 bg-[#141414] ${
                    activeImage === imgSrc
                      ? 'border-white ring-2 ring-white/30'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={`Ángulo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
                  />
                  <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-white/70">
                    V{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: CONFIGURADOR DE COMPRA Y ESPECIFICACIONES (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header del Producto */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-white/70 uppercase tracking-widest font-bold block">
                  MARCA: {currentVariant.brand || product.brand || 'KAMIL SHOP ATELIER'}
                </span>
                {currentVariant.stock <= 5 && currentVariant.stock > 0 && (
                  <span className="font-mono text-[10px] text-white/80 bg-white/5 px-2 py-0.5 rounded border border-white/20">
                    ¡ÚLTIMAS {formatThousands(currentVariant.stock)} UNIDADES!
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {currentVariant.name || product.name}
              </h1>

              {/* Precios con escala responsiva */}
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 pt-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {formatUSD(currentVariant.price || product.price)}
                </span>
                <span className="text-xs sm:text-sm font-mono text-emerald-400 font-bold">
                  ≈ {formattedCOP}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full">
                  ENVÍO NACIONAL GRATIS
                </span>
              </div>
            </div>

            {/* Descripción */}
            <p className="text-sm text-white/70 leading-relaxed border-t border-b border-white/10 py-4">
              {currentVariant.description || product.description}
            </p>

            {/* Selector de Variantes de Color Dinámicas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider font-mono">
                  Color Seleccionado:
                </span>
                <span className="text-white font-bold font-mono">
                  {currentVariant.color_name || 'Estándar'}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {relatedColorVariants.map((variant, vIdx) => {
                  const isSelected = (variant.color_name === currentVariant.color_name) || (variant.id === currentVariant.id);
                  const hexColor = variant.color_hex || '#111111';
                  const isLight = hexColor === '#FFFFFF' || hexColor === '#F5F5F0' || hexColor === '#f8f8f6';

                  return (
                    <button
                      key={variant.id || `${variant.color_name}-${vIdx}`}
                      type="button"
                      onClick={() => handleColorVariantSelect(variant)}
                      className={`h-11 w-11 rounded-full border-2 transition flex items-center justify-center cursor-pointer shadow-md ${
                        isSelected
                          ? 'border-white ring-4 ring-white/30 scale-110'
                          : 'border-white/20 hover:scale-105 hover:border-white/50 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: hexColor }}
                      title={`${variant.color_name || 'Color'} (${variant.name || product.name})`}
                    >
                      {isSelected && (
                        <Check
                          size={16}
                          className={isLight ? 'text-black' : 'text-white'}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Tallas con Evaluación de Stock en Vivo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider font-mono">
                  Selecciona tu Talla:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-white/70 hover:text-white hover:underline font-mono text-xs cursor-pointer font-bold"
                >
                  <Ruler size={14} />
                  <span>Guía de Tallas (en cm)</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {((currentVariant.size_stock && Object.keys(currentVariant.size_stock).length > 0)
                  ? Object.keys(currentVariant.size_stock)
                  : (currentVariant.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'])
                ).map((s) => {
                  const stockForSize = currentVariant.size_stock
                    ? (currentVariant.size_stock[s] ?? 0)
                    : (currentVariant.stock ?? 1);
                  const isOutOfStock = stockForSize <= 0;
                  const isSelected = selectedSize === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && setSelectedSize(s)}
                      className={`relative py-3 rounded-2xl text-xs font-mono font-black transition border text-center ${
                        isOutOfStock
                          ? 'bg-white/[0.02] text-white/25 border-white/5 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-white text-black border-white shadow-lg shadow-white/10 cursor-pointer'
                            : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30 hover:bg-white/10 cursor-pointer'
                      }`}
                      title={isOutOfStock ? `Talla ${s} agotada en ${currentVariant.color_name || 'este color'}` : `Talla ${s} (${formatThousands(stockForSize)} disponibles)`}
                    >
                      <span className="block">{s}</span>
                      {isOutOfStock && (
                        <span className="block text-[8px] font-sans text-rose-400/80 font-normal no-underline">
                          Agotada
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Indicador de Disponibilidad de la Talla Seleccionada */}
              {(() => {
                const stockForCurrentSize = currentVariant.size_stock
                  ? (currentVariant.size_stock[selectedSize] ?? 0)
                  : (currentVariant.stock ?? 1);

                return (
                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          stockForCurrentSize > 0
                            ? stockForCurrentSize <= 3
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-emerald-400'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span
                        className={
                          stockForCurrentSize > 0
                            ? stockForCurrentSize <= 3
                              ? 'text-amber-300 font-bold'
                              : 'text-emerald-400'
                            : 'text-rose-400 font-bold'
                        }
                      >
                        {stockForCurrentSize > 0
                          ? stockForCurrentSize <= 3
                            ? `¡Solo quedan ${formatThousands(stockForCurrentSize)} unidades en talla ${selectedSize}!`
                            : `${formatThousands(stockForCurrentSize)} unidades en inventario para talla ${selectedSize}`
                          : `Talla ${selectedSize} no disponible en ${currentVariant.color_name || 'este color'}`}
                      </span>
                    </div>
                    <span className="text-white/40 text-[11px]">Dark Store Bogotá</span>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                <Check size={14} className="text-emerald-400" />
                <span>Corte Boxy Oversize contemporáneo • Talla estándar</span>
              </div>
            </div>

            {/* Botones de Acción y Stepper de Cantidad */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Stepper */}
                <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 overflow-hidden px-2">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="h-10 w-8 text-white/60 hover:text-white font-mono text-sm transition"
                  >
                    −
                  </button>
                  <span className="font-mono text-sm font-bold text-white px-2">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    className="h-10 w-8 text-white/60 hover:text-white font-mono text-sm transition"
                  >
                    +
                  </button>
                </div>

                {/* Botón Añadir al Carrito */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white/10 border border-white/20 px-6 py-4 text-xs font-black text-white hover:bg-white/20 transition cursor-pointer shadow-md"
                >
                  <ShoppingBag size={17} />
                  <span>AÑADIR AL CARRITO</span>
                </button>
              </div>

              {/* Botón COMPRAR AHORA CON WOMPI */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-4 text-xs font-black text-black hover:bg-neutral-200 shadow-xl transition cursor-pointer"
              >
                <Zap size={17} />
                <span>COMPRAR AHORA CON WOMPI →</span>
              </button>
            </div>

            {/* Banner de Garantías en Colombia */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 space-y-2.5 text-xs text-white/80">
              <div className="flex items-center gap-2.5 text-white font-bold">
                <Truck size={16} className="text-emerald-400" />
                <span>Despacho desde Bodega Central Kamil Shop • Importación Original EE.UU.</span>
              </div>
              <p className="text-xs leading-relaxed pl-6 text-white/75">
                Envíos asegurados a toda Colombia (24 a 48 horas hábiles) con Coordinadora, Servientrega e Inter Rapidísimo.
              </p>
              <div className="flex items-center gap-2.5 text-white font-bold pt-1 border-t border-white/10">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Garantía Oficial de 30 Días para Cambios de Talla</span>
              </div>
            </div>

            {/* Arma tu Outfit / Combo Builder con Descuento */}
            {comboPartner && (
              <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={15} className="text-emerald-400" />
                    <span>Arma tu Outfit Completo</span>
                  </span>
                  <span className="font-mono text-[10px] font-black text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                    15% OFF EN COMBO
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={comboPartner.image}
                    alt={comboPartner.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-white/15"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-bold text-white block truncate">+ {comboPartner.name}</span>
                    <span className="font-mono text-white/50 text-xs">{formatUSD(comboPartner.price)} (≈ {formatCOP(comboPartner.price)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddComboToCart}
                    className="px-4 py-2.5 rounded-xl bg-white text-black font-black text-xs hover:bg-neutral-200 transition cursor-pointer shadow-md"
                  >
                    Llevar Combo
                  </button>
                </div>
              </div>
            )}

            {/* Pestañas de Especificaciones / Acordeón */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden divide-y divide-white/5 text-xs">
              
              {/* Pestaña 1: Ficha Técnica */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                  className="w-full flex items-center justify-between p-4 font-bold text-white hover:bg-white/5 transition"
                >
                  <span className="flex items-center gap-2">
                    <Layers size={15} className="text-white/70" />
                    <span>Ficha Técnica y Confección Textil</span>
                  </span>
                  {activeAccordion === 'specs' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === 'specs' && (
                  <div className="p-4 pt-0 text-white/70 space-y-1.5 leading-relaxed text-[11px]">
                    <p>• <strong>Tejido / Material:</strong> {product.specs || '100% Algodón Peinado de alta densidad (480 GSM).'}</p>
                    {product.categoryAttributes?.fit && <p>• <strong>Fit / Silueta:</strong> {product.categoryAttributes.fit}</p>}
                    {product.categoryAttributes?.cut && <p>• <strong>Corte:</strong> {product.categoryAttributes.cut}</p>}
                    {product.categoryAttributes?.rise && <p>• <strong>Tiro:</strong> {product.categoryAttributes.rise}</p>}
                    {product.categoryAttributes?.sole_type && <p>• <strong>Tipo de Suela:</strong> {product.categoryAttributes.sole_type}</p>}
                    {product.categoryAttributes?.shaft && <p>• <strong>Altura de Caña:</strong> {product.categoryAttributes.shaft}</p>}
                    {product.categoryAttributes?.closure && <p>• <strong>Tipo de Cierre:</strong> {product.categoryAttributes.closure}</p>}
                    {product.categoryAttributes?.gsm && <p>• <strong>Gramaje Textil:</strong> {product.categoryAttributes.gsm}</p>}
                    <p>• <strong>Tratamiento:</strong> Lavado mineral al frío para tacto suave y acabado mate.</p>
                    <p>• <strong>Confección:</strong> Costuras francesas reforzadas en hombros y cuello ribeteado.</p>
                    <p>• <strong>Origen:</strong> Ropa y calzado importado directamente de EE.UU. (Original USA) • Envíos a todo el país.</p>
                  </div>
                )}
              </div>

              {/* Pestaña 2: Cuidados de Lavado */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                  className="w-full flex items-center justify-between p-4 font-bold text-white hover:bg-white/5 transition"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw size={15} className="text-white/70" />
                    <span>Guía de Cuidados de la Prenda</span>
                  </span>
                  {activeAccordion === 'care' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === 'care' && (
                  <div className="p-4 pt-0 text-white/70 space-y-1.5 leading-relaxed text-[11px]">
                    <p>• Lavar a máquina con agua fría (máximo 30°C) en ciclo suave.</p>
                    <p>• Lavar la prenda al revés para proteger el color y las fibras.</p>
                    <p>• No utilizar blanqueador ni productos clorados.</p>
                    <p>• Secar a la sombra tendido horizontalmente. No usar secadora caliente.</p>
                  </div>
                )}
              </div>

              {/* Pestaña 3: Métodos de Pago Wompi */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex items-center justify-between p-4 font-bold text-white hover:bg-white/5 transition"
                >
                  <span className="flex items-center gap-2">
                    <Package size={15} className="text-white/70" />
                    <span>Medios de Pago Aceptados (Wompi)</span>
                  </span>
                  {activeAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="p-4 pt-0 text-white/70 space-y-1.5 leading-relaxed text-[11px]">
                    <p>• <strong>Bancolombia:</strong> Débito directo desde App o botón Bancolombia.</p>
                    <p>• <strong>PSE:</strong> Todos los bancos de Colombia (Davivienda, Bogotá, BBVA, etc.).</p>
                    <p>• <strong>Nequi:</strong> Pago push inmediato a tu número celular.</p>
                    <p>• <strong>Tarjetas:</strong> Visa, Mastercard, American Express hasta 24 cuotas.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SECCIÓN INFERIOR: PRENDAS RELACIONADAS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  Prendas Similares de la Colección
                </h3>
                <p className="text-xs text-white/50">
                  Explora otros estilos que combinan perfectamente con este outfit
                </p>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-white hover:underline cursor-pointer"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowLeft size={14} className="rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <article
                  key={rel.id}
                  onClick={() => {
                    setQuickViewProduct(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-2 hover:border-white/30 transition cursor-pointer group"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-[#141414]">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
                    />
                    <span className="absolute top-2 left-2 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white">
                      {rel.badge || 'DROP'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase block">
                      {rel.category}
                    </span>
                    <h4 className="font-bold text-white truncate group-hover:text-white transition">
                      {rel.name}
                    </h4>
                    <div className="font-mono text-xs font-bold text-white/90">
                      <div>{formatUSD(rel.price)}</div>
                      <div className="text-[10px] text-emerald-400 font-normal">≈ {formatCOP(rel.price)}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center pt-8">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/15 text-xs font-black text-white hover:bg-white/20 transition cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>VOLVER AL CATÁLOGO COMPLETO DE ROPA</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
