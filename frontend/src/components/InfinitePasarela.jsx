import React, { useRef, useEffect, useState } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';

export const InfinitePasarela = () => {
  const { pasarelaItems, products, setQuickViewProduct } = useProducts();
  const { showToast } = useCart();
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const handleExploreItem = (item) => {
    const found = products.find(p => p.id === item.productId);
    if (found) {
      setQuickViewProduct(found);
    } else {
      const priceNum = parseFloat((item.price || '').replace(/[^0-9.]/g, '')) || 50;
      setQuickViewProduct({
        id: item.id,
        name: item.title,
        price: priceNum,
        category: item.category,
        description: item.desc,
        specs: `${item.tag} • Packaging & Confección Especial`,
        sizes: ["Única", "S", "M", "L"],
        image: item.image,
        badge: item.tag,
        badgeType: "new"
      });
    }
  };

  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 2 sets de items para bucle continuo CSS con translate3d(-50%, 0, 0) sin costo de CPU
  const safeItems = Array.isArray(pasarelaItems) ? pasarelaItems : [];
  const itemsDuplicated = [...safeItems, ...safeItems];

  return (
    <section className="pasarela-section" id="pasarela">
      <div className="pasarela-header">
        <div className="pasarela-title-wrap">
          <span className="pasarela-section-label">01 // INNOVACIÓN & PACKAGING</span>
          <h2 className="pasarela-heading">Pasarela de Productos</h2>
        </div>

        <div className="pasarela-drag-hint">
          <span>PAUSA AL PASAR EL CURSOR</span>
          <span>⟷</span>
        </div>
      </div>

      <div
        className="pasarela-container"
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`pasarela-track ${(!isVisible || isPaused) ? 'is-paused' : ''}`}>
          {itemsDuplicated.map((item, idx) => (
            <div className="pasarela-card" key={`${item.id}-${idx}`}>
              <div className="pasarela-card-inner">
                <div className="pasarela-badge">{item.tag}</div>
                <div className="pasarela-img-box">
                  <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="pasarela-img" />
                </div>
                <div className="pasarela-card-meta">
                  <span className="pasarela-category">{item.category}</span>
                  <h4 className="pasarela-title">{item.title}</h4>
                  <p className="pasarela-desc">{item.desc}</p>
                  <div className="pasarela-price-row">
                    <span className="pasarela-price">{item.price}</span>
                    <button
                      type="button"
                      className="btn-pasarela-add"
                      onClick={() => handleExploreItem(item)}
                    >
                      EXPLORAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
