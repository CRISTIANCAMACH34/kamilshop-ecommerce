import React, { useState } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { formatUSD, formatCOP } from '../services/currencyService';

const RUNWAY_LOOKS = [
  {
    id: 'look-1',
    title: 'Look 01 // Neo-Brutalist Outerwear',
    season: 'Otoño / Invierno 2026',
    model: 'Sasha V. en Pasarela Kamil Shop Studio',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80',
    description: 'Chaqueta de cuero tratada con pátina vintage combinada con silueta holgada y proporciones desestructuradas. Inspirada en la arquitectura de concreto visto y el brutalismo.',
    garmentName: 'Chaqueta Oversize Leather',
    price: 155.00,
    productId: 'app-w1',
    tags: ['PIEZA EMBLEMÁTICA', 'PASARELA OFICIAL']
  },
  {
    id: 'look-2',
    title: 'Look 02 // Streetwear Monolith Noir',
    season: 'Drop Cero Uno',
    model: 'Liam K. en Showroom Central Kamil Shop',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&auto=format&fit=crop&q=80',
    description: 'Hoodie heavyweight de 480 gramos con lavado mineral y hombros ultra-caídos. El balance exacto entre confort supremo y presencia escénica.',
    garmentName: 'Kamil Shop Heavyweight Boxy Hoodie',
    price: 95.00,
    productId: 'app-m1',
    tags: ['BEST SELLER', 'ALGODÓN FRANCÉS']
  },
  {
    id: 'look-3',
    title: 'Look 03 // Fluid Architecture Silk',
    season: 'Alta Costura Contemporánea',
    model: 'Elena R. en Pasarela Medellín',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
    description: 'Sastrería asimétrica con solapa esculpida y forro de cupro transpirable. Pensado para transitar del día a la noche sin perder sobriedad.',
    garmentName: 'Kamil Shop Sculptural Asymmetrical Blazer',
    price: 155.00,
    productId: 'app-w1',
    tags: ['EDICIÓN LIMITADA', 'SASTRERÍA']
  }
];

export const RunwayModal = ({ open, onClose }) => {
  useBodyScrollLock(open);
  const [currentIdx, setCurrentIdx] = useState(0);
  const { products, setQuickViewProduct } = useProducts();
  const { addItem, showToast } = useCart();

  if (!open) return null;

  const currentLook = RUNWAY_LOOKS[currentIdx];

  const handleBuyLook = () => {
    const product = products.find(p => p.id === currentLook.productId) || products[0];
    if (product) {
      setQuickViewProduct(product);
      onClose();
    } else {
      showToast(`Prenda ${currentLook.garmentName} seleccionada`);
    }
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % RUNWAY_LOOKS.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + RUNWAY_LOOKS.length) % RUNWAY_LOOKS.length);
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1200 }}>
      <div
        className="modal-window"
        style={{
          maxWidth: 960,
          padding: 0,
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.15)',
          overflow: 'hidden',
          borderRadius: 8
        }}
      >
        <button
          type="button"
          className="btn-close-modal"
          onClick={onClose}
          aria-label="Cerrar pasarela"
          style={{ zIndex: 30, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
          {/* Imagen de Lookbook */}
          <div style={{ position: 'relative', height: 'clamp(260px, 45vh, 520px)', background: '#050505', overflow: 'hidden' }}>
            <img
              src={currentLook.image}
              alt={currentLook.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px 20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.14em',
                  color: '#e5e5e5',
                  textTransform: 'uppercase'
                }}
              >
                {currentLook.model}
              </span>
            </div>

            {/* Controles de Navegación de Diapositiva */}
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}>
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Información Editorial */}
          <div style={{ padding: 'clamp(18px, 4vw, 36px) clamp(16px, 4vw, 32px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#ffffff',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase'
                  }}
                >
                  RUNWAY EDITORIAL // {currentLook.season}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#737373' }}>
                  {currentIdx + 1} / {RUNWAY_LOOKS.length}
                </span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.6rem)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', lineHeight: 1.2 }}>
                {currentLook.title}
              </h2>

              <p style={{ color: '#a3a3a3', fontSize: '0.88rem', lineHeight: 1.6, marginTop: 14 }}>
                {currentLook.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                {currentLook.tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      letterSpacing: '0.08em',
                      padding: '4px 10px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#e5e5e5'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#737373', textTransform: 'uppercase' }}>
                  Prenda Principal del Look:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{currentLook.garmentName}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#4ade80', fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>{formatUSD(currentLook.price)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#86efac', fontFamily: 'var(--font-mono)' }}>≈ {formatCOP(currentLook.price)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleBuyLook}
                style={{
                  flex: '1 1 140px',
                  padding: '12px 18px',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                COMPRAR ESTE LOOK →
              </button>

              <button
                type="button"
                onClick={() => {
                  const catEl = document.getElementById('catalogo');
                  if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
                  onClose();
                }}
                style={{
                  flex: '1 1 120px',
                  padding: '12px 18px',
                  background: 'transparent',
                  color: '#a3a3a3',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                VER CATÁLOGO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
