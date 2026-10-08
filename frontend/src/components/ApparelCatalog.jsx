import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { formatUSD, formatCOP, formatThousands } from '../services/currencyService';
import {
  Heart,
  SlidersHorizontal,
  Search,
  X,
  Layers,
  Flame,
  Shirt,
  Shield,
  Scissors,
  Sparkles,
  Tag,
  ArrowRight,
  RotateCcw,
  Crown
} from 'lucide-react';

const CATEGORY_SYNONYMS = {
  hoodies: ['hoodie', 'sweater', 'sudadera', 'buzo', 'crewneck'],
  camisetas: ['camiseta', 'tee', 'top', 't-shirt'],
  chaquetas: ['chaqueta', 'blazer', 'outerwear', 'bomber', 'windbreaker', 'abrigo'],
  pantalones: ['pantal', 'cargo', 'trouser', 'jean', 'jogger'],
  accesorios: ['accesorio', 'cap', 'gorra', 'bolso', 'cinturón', 'cinturon']
};

const CATEGORY_ICONS = {
  todos: Layers,
  hoodies: Flame,
  camisetas: Shirt,
  chaquetas: Shield,
  pantalones: Scissors,
  accesorios: Sparkles
};

const QUICK_SEARCH_TAGS = [
  { label: '🔥 Heavyweight', query: 'Heavyweight' },
  { label: 'Oversized', query: 'Oversized' },
  { label: 'Cargo', query: 'Cargo' },
  { label: 'Impermeable', query: 'Waterproof' },
  { label: 'Algodón Pima', query: 'Algodón' },
  { label: 'Edición Limitada', query: 'Limitada' }
];

const matchesCategory = (productCat, filterCat) => {
  if (!filterCat || filterCat === 'todos') return true;
  const pCat = (productCat || '').toLowerCase();
  const fCat = filterCat.toLowerCase();
  if (pCat === fCat) return true;
  const synonyms = CATEGORY_SYNONYMS[fCat] || [fCat];
  return synonyms.some(syn => pCat.includes(syn));
};

const matchesBrand = (product, filterBrand) => {
  if (!filterBrand || filterBrand === 'todos') return true;
  const pBrand = (product.brand || '').toLowerCase();
  const pCode = (product.brand_code || '').toLowerCase();
  const pId = String(product.brand_id || '');
  const f = String(filterBrand).toLowerCase();

  if (pBrand === f || pCode === f || pId === f) return true;
  if (f === 'kuro' || f.includes('kuro')) return pBrand.includes('kuro') || pCode.includes('kuro');
  if (f === 'acro' || f.includes('acro')) return pBrand.includes('acro') || pCode.includes('acro');
  if (f === 'aura' || f.includes('aura')) return pBrand.includes('aura') || pCode.includes('aura');
  if (f === 'kamil' || f === 'titulo' || f.includes('atelier')) {
    return pBrand.includes('kamil') || pBrand.includes('atelier') || pBrand.includes('titulo') || pCode.includes('titulo');
  }
  return pBrand.includes(f) || pCode.includes(f);
};

const matchesPrice = (price, filterPrice) => {
  if (!filterPrice || filterPrice === 'todos') return true;
  const p = Number(price) || 0;
  if (filterPrice === 'under-60') return p < 60;
  if (filterPrice === '60-120') return p >= 60 && p <= 120;
  if (filterPrice === 'over-120') return p > 120;
  return true;
};

const matchesStock = (product, inStockOnly) => {
  if (!inStockOnly) return true;
  const stock = Number(product.stock) || 0;
  return stock > 0 && product.badge !== 'AGOTADO';
};

export const ApparelCatalog = () => {
  const {
    products,
    categories,
    brands,
    adminMode,
    openAdminModal,
    removeProduct,
    setQuickViewProduct,
    activeCategoryFilter,
    setActiveCategoryFilter,
    activeBrandFilter,
    setActiveBrandFilter
  } = useProducts();
  const { addItem, showToast, toggleWishlist, isWishlisted } = useCart();

  const [gender, setGender] = useState('todos');
  const [category, setCategory] = useState(activeCategoryFilter || 'todos');
  const [brandFilter, setBrandFilter] = useState(activeBrandFilter || 'todos');
  const [priceFilter, setPriceFilter] = useState('todos');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [styleFilter, setStyleFilter] = useState('todos');
  const [sizeFilter, setSizeFilter] = useState('todos');
  const [colorFilter, setColorFilter] = useState('todos');
  const [sort, setSort] = useState('destacados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [cardActiveVariants, setCardActiveVariants] = useState({});
  const [addedState, setAddedState] = useState({});
  const [showMobileExtraFilters, setShowMobileExtraFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [gender, category, brandFilter, priceFilter, inStockOnly, styleFilter, sizeFilter, colorFilter, searchQuery]);

  useEffect(() => {
    if (activeCategoryFilter) {
      setCategory(activeCategoryFilter);
    }
  }, [activeCategoryFilter]);

  useEffect(() => {
    if (activeBrandFilter) {
      setBrandFilter(activeBrandFilter);
    }
  }, [activeBrandFilter]);

  // Lista consolidada de marcas (backend hexagonal o fallback)
  const brandList = useMemo(() => {
    const defaults = [
      { id: 'todos', code: 'todos', name: 'Todas las Marcas' },
      { id: 1, code: 'TITULO_ATELIER', name: 'Kamil Shop Atelier' },
      { id: 2, code: 'KURO_ARCHIVE', name: 'Kuro Archive' },
      { id: 3, code: 'ACRO_STUDIOS', name: 'Acro Studios' },
      { id: 4, code: 'AURA_MINIMAL', name: 'Aura Minimal' }
    ];
    if (brands && Array.isArray(brands) && brands.length > 0) {
      const mapped = brands.map(b => ({
        id: b.id || b.brand_id,
        code: b.code || b.name,
        name: (b.commercial_name || b.name || '').replace(/^TITULO\s+/i, 'Kamil Shop ')
      }));
      const merged = [{ id: 'todos', code: 'todos', name: 'Todas las Marcas' }];
      mapped.forEach(m => {
        if (!merged.some(x => x.code === m.code || x.name === m.name)) {
          merged.push(m);
        }
      });
      return merged;
    }
    return defaults;
  }, [brands]);

  // Conteo dinámico de prendas por marca
  const brandCounts = useMemo(() => {
    const counts = {};
    counts['todos'] = products.length;
    brandList.forEach(b => {
      if (b.code !== 'todos') {
        counts[b.code] = products.filter(p => matchesBrand(p, b.code)).length;
      }
    });
    return counts;
  }, [products, brandList]);

  // Lista consolidada de categorías (del backend hexagonal o fallback)
  const categoryList = useMemo(() => {
    if (categories && Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    return [
      { id: 'todos', name: 'Todas', slug: 'todos' },
      { id: 'hoodies', name: 'Hoodies & Buzos', slug: 'hoodies' },
      { id: 'camisetas', name: 'Camisetas & Tops', slug: 'camisetas' },
      { id: 'chaquetas', name: 'Chaquetas & Blazers', slug: 'chaquetas' },
      { id: 'pantalones', name: 'Pantalones & Cargo', slug: 'pantalones' },
      { id: 'accesorios', name: 'Accesorios & Gorras', slug: 'accesorios' }
    ];
  }, [categories]);

  // Conteo dinámico de prendas por categoría según género actual
  const categoryCounts = useMemo(() => {
    const counts = {};
    const baseList = products.filter(p => {
      if (gender !== 'todos') {
        const pGender = (p.gender || '').toLowerCase();
        if (pGender !== gender && pGender !== 'unisex') return false;
      }
      return true;
    });

    counts['todos'] = baseList.length;

    categoryList.forEach(cat => {
      if (cat.id !== 'todos') {
        counts[cat.id] = baseList.filter(p => matchesCategory(p.category, cat.id)).length;
      }
    });

    return counts;
  }, [products, gender, categoryList]);

  // Filtrado optimizado y memoizado multi-criterio
  const filtered = useMemo(() => {
    const list = products.filter(p => {
      // 1. Género
      if (gender !== 'todos') {
        const pGender = (p.gender || '').toLowerCase();
        if (pGender !== gender && pGender !== 'unisex') return false;
      }

      // 2. Categoría con sinónimos inteligentes
      if (!matchesCategory(p.category, category)) {
        return false;
      }

      // 3. Marca de diseñador
      if (!matchesBrand(p, brandFilter)) {
        return false;
      }

      // 4. Rango de precio
      if (!matchesPrice(p.price, priceFilter)) {
        return false;
      }

      // 5. Disponibilidad / Inventario
      if (!matchesStock(p, inStockOnly)) {
        return false;
      }

      // 6. Estilo estético
      if (styleFilter !== 'todos') {
        const pStyle = (p.style || '').toLowerCase();
        if (pStyle !== styleFilter.toLowerCase()) return false;
      }

      // 7. Talla específica
      if (sizeFilter !== 'todos') {
        const sTarget = sizeFilter.toLowerCase();
        const pSizes = (p.sizes || []).map(s => String(s).toLowerCase());
        const pVariants = (p.variants || []).map(v => String(v.size_label || v.size || '').toLowerCase());
        if (!pSizes.includes(sTarget) && !pVariants.includes(sTarget)) {
          return false;
        }
      }

      // 8. Tono o Color
      if (colorFilter !== 'todos') {
        const cTarget = colorFilter.toLowerCase();
        const pColors = (p.colors || []).map(c => (typeof c === 'object' ? (c.name || '') : String(c)).toLowerCase());
        const pVariants = (p.variants || []).map(v => String(v.color_name || v.color || '').toLowerCase());
        const matchesClr = pColors.some(c => c.includes(cTarget)) || pVariants.some(v => v.includes(cTarget));
        if (!matchesClr) return false;
      }

      // 9. Búsqueda libre
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchSpecs = (p.specs || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        const matchStyle = (p.style || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc && !matchSpecs && !matchCat && !matchStyle) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === 'precio-bajo') return a.price - b.price;
      if (sort === 'precio-alto') return b.price - a.price;
      if (sort === 'nombre') return (a.name || '').localeCompare(b.name || '');
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, gender, category, brandFilter, priceFilter, inStockOnly, styleFilter, sizeFilter, colorFilter, searchQuery, sort]);

  const handleSelectSize = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || 'M';
    addItem(product, size, 1);

    setAddedState(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedState(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  const handleDelete = (product) => {
    if (confirm(`¿Eliminar "${product.name}" del catálogo?`)) {
      removeProduct(product.id);
      showToast(`Prenda eliminada: "${product.name}"`);
    }
  };

  const handleClearAllFilters = () => {
    setGender('todos');
    setCategory('todos');
    setBrandFilter('todos');
    setPriceFilter('todos');
    setInStockOnly(false);
    setStyleFilter('todos');
    setSizeFilter('todos');
    setColorFilter('todos');
    setSearchQuery('');
    setSort('destacados');
    if (setActiveCategoryFilter) setActiveCategoryFilter('todos');
    if (setActiveBrandFilter) setActiveBrandFilter('todos');
  };

  const handleSelectQuickTag = (tagQuery) => {
    if (searchQuery === tagQuery) {
      setSearchQuery('');
    } else {
      setSearchQuery(tagQuery);
    }
  };

  const hasActiveFilters =
    gender !== 'todos' ||
    category !== 'todos' ||
    brandFilter !== 'todos' ||
    priceFilter !== 'todos' ||
    inStockOnly ||
    styleFilter !== 'todos' ||
    sizeFilter !== 'todos' ||
    colorFilter !== 'todos' ||
    searchQuery.trim() !== '';

  const currentCategoryObj = categoryList.find(c => c.id === category);

  return (
    <section className="catalog-section" id="catalogo">
      <div className="catalog-header">
        <div className="catalog-title-group">
          <h2 className="catalog-heading">Colección de Ropa</h2>
          <span className="catalog-count-badge">
            {filtered.length} {filtered.length === 1 ? 'PRENDA' : 'PRENDAS'}
          </span>
        </div>

        <div className="catalog-admin-btn-wrap">
          <button type="button" className="btn-add-product-admin" onClick={() => openAdminModal()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ AGREGAR PRENDA</span>
          </button>
        </div>
      </div>

      {/* Controles de Filtro: Búsqueda, Género, Categorías y Orden */}
      <div className="catalog-controls-bar">
        {/* Barra de Búsqueda y Sugerencias */}
        <div style={{ width: '100%', marginBottom: 12 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
            <input
              type="text"
              placeholder="Buscar por nombre, tejido, estilo o prenda (Ej: Hoodie, Cargo, Algodón)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 40px 11px 40px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 8,
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: searchQuery ? '0 0 16px rgba(255,255,255,0.06)' : 'none'
              }}
            />
            <Search
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.55 }}
              size={15}
              stroke="#fff"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}

            {/* Desplegable de Búsqueda Predictiva en Vivo */}
            {searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-[#121212]/98 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-2.5 max-h-80 overflow-y-auto">
                <div className="text-[10px] font-mono text-white/40 uppercase px-2 py-1 flex items-center justify-between border-b border-white/10 mb-1">
                  <span>Prendas encontradas ({filtered.length})</span>
                  <span className="text-white/30">Clic para vista rápida</span>
                </div>
                {filtered.length === 0 ? (
                  <div className="p-3 text-center text-xs text-white/50 font-mono">
                    No se encontraron prendas con "{searchQuery}"
                  </div>
                ) : (
                  filtered.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setQuickViewProduct(item);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-md border border-white/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-white/50 truncate">
                          {item.brand || 'Kamil Shop Atelier'} • {item.category.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-xs font-mono font-black text-white flex-shrink-0 text-right">
                        <div>{formatUSD(item.price)}</div>
                        <div className="text-[10px] text-emerald-400 font-normal">≈ {formatCOP(item.price)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Etiquetas de Búsqueda Rápida (Trending Tags) */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider mr-1">
              Tendencias:
            </span>
            {QUICK_SEARCH_TAGS.map(tag => (
              <button
                key={tag.label}
                type="button"
                className={`quick-tag-chip ${searchQuery === tag.query ? 'active' : ''}`}
                onClick={() => handleSelectQuickTag(tag.query)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Marcas de Diseñador / Atelier */}
        <div className="brand-filters-wrap w-full mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Crown size={12} className="text-white/60" />
              MARCAS DE DISEÑADOR:
            </span>
            {brandFilter !== 'todos' && (
              <button
                type="button"
                onClick={() => {
                  setBrandFilter('todos');
                  if (setActiveBrandFilter) setActiveBrandFilter('todos');
                }}
                className="text-[11px] font-mono text-white/60 hover:text-white underline cursor-pointer"
              >
                Ver todas las marcas
              </button>
            )}
          </div>
          <div className="brand-filters-list">
            {brandList.map(b => {
              const count = brandCounts[b.code] ?? (b.code === 'todos' ? products.length : 0);
              const isActive = brandFilter === b.code || (b.code === 'todos' && brandFilter === 'todos');

              return (
                <button
                  key={b.code}
                  type="button"
                  className={`brand-filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    const nextVal = isActive && b.code !== 'todos' ? 'todos' : b.code;
                    setBrandFilter(nextVal);
                    if (setActiveBrandFilter) setActiveBrandFilter(nextVal);
                  }}
                  title={`Filtrar por ${b.name} (${count} prendas)`}
                >
                  <span className="brand-pill-name">{b.name}</span>
                  <span className="brand-count-chip">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro de Género */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: '100%', marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            GÉNERO:
          </span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'mujer', label: 'Mujer' },
            { id: 'hombre', label: 'Hombre' },
            { id: 'unisex', label: 'Unisex' }
          ].map(g => (
            <button
              key={g.id}
              type="button"
              className={`category-filter-btn ${gender === g.id ? 'active' : ''}`}
              onClick={() => setGender(g.id)}
              style={{ padding: '6px 14px' }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Barra de Filtro de Categorías con Iconos y Conteo en Vivo */}
        <div className="category-filters-list w-full">
          {categoryList.map(cat => {
            const IconComp = CATEGORY_ICONS[cat.id] || Tag;
            const count = categoryCounts[cat.id] ?? 0;
            const isActive = category === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                className={`category-filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCategory(cat.id);
                  if (setActiveCategoryFilter) setActiveCategoryFilter(cat.id);
                }}
                title={`Filtrar por ${cat.name} (${count} disponibles)`}
              >
                <IconComp size={13} className="shrink-0" />
                <span>{cat.name}</span>
                <span className="category-count-chip">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Resumen de Filtros Activos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap w-full pt-1 pb-1 text-xs">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              FILTROS ACTIVOS:
            </span>

            {brandFilter !== 'todos' && (
              <button
                type="button"
                onClick={() => {
                  setBrandFilter('todos');
                  if (setActiveBrandFilter) setActiveBrandFilter('todos');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar filtro de marca"
              >
                <span>Marca: {brandList.find(b => b.code === brandFilter)?.name || brandFilter}</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {category !== 'todos' && (
              <button
                type="button"
                onClick={() => {
                  setCategory('todos');
                  if (setActiveCategoryFilter) setActiveCategoryFilter('todos');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar filtro de categoría"
              >
                <span>Categoría: {currentCategoryObj?.name || category}</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {gender !== 'todos' && (
              <button
                type="button"
                onClick={() => setGender('todos')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar filtro de género"
              >
                <span>Género: {gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {priceFilter !== 'todos' && (
              <button
                type="button"
                onClick={() => setPriceFilter('todos')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar filtro de precio"
              >
                <span>
                  Precio: {priceFilter === 'under-60' ? '< $60 USD' : priceFilter === '60-120' ? '$60 - $120 USD' : '> $120 USD'}
                </span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {inStockOnly && (
              <button
                type="button"
                onClick={() => setInStockOnly(false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Mostrar todas las prendas"
              >
                <span>Solo en stock</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {styleFilter !== 'todos' && (
              <button
                type="button"
                onClick={() => setStyleFilter('todos')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar filtro de estilo"
              >
                <span>Estilo: {styleFilter}</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {sizeFilter !== 'todos' && (
              <button
                type="button"
                onClick={() => setSizeFilter('todos')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar filtro de talla"
              >
                <span>Talla: {sizeFilter.toUpperCase()}</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {colorFilter !== 'todos' && (
              <button
                type="button"
                onClick={() => setColorFilter('todos')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar filtro de color"
              >
                <span>Color: {colorFilter.charAt(0).toUpperCase() + colorFilter.slice(1)}</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition cursor-pointer"
                title="Quitar búsqueda"
              >
                <span>Búsqueda: "{searchQuery}"</span>
                <X size={11} className="text-white/60 hover:text-white" />
              </button>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-white/60 hover:text-white underline cursor-pointer ml-1 font-mono"
            >
              Limpiar todos
            </button>
          </div>
        )}

        {/* Ordenamiento, Precio, Stock, Talla y Color: Colapsable en móvil para no tapar los productos */}
        <div className="w-full">
          {/* Botón toggle en móvil */}
          <div className="flex md:hidden items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowMobileExtraFilters(!showMobileExtraFilters)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 bg-white/[0.04] text-xs font-mono font-bold text-white hover:bg-white/10 transition cursor-pointer"
            >
              <SlidersHorizontal size={13} />
              <span>Filtros Avanzados & Orden</span>
              <span className="text-[10px] text-white/50">{showMobileExtraFilters ? '▲' : '▼'}</span>
              {(styleFilter !== 'todos' || priceFilter !== 'todos' || sizeFilter !== 'todos' || colorFilter !== 'todos' || inStockOnly || sort !== 'destacados') && (
                <span className="h-2 w-2 rounded-full bg-emerald-400" title="Filtros aplicados" />
              )}
            </button>

            {(styleFilter !== 'todos' || priceFilter !== 'todos' || sizeFilter !== 'todos' || colorFilter !== 'todos' || inStockOnly || sort !== 'destacados') && (
              <button
                type="button"
                onClick={() => {
                  setStyleFilter('todos');
                  setPriceFilter('todos');
                  setSizeFilter('todos');
                  setColorFilter('todos');
                  setInStockOnly(false);
                  setSort('destacados');
                }}
                className="text-[11px] font-mono text-white/60 hover:text-white underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Selectores y Toggles */}
          <div className={`${showMobileExtraFilters ? 'flex' : 'hidden'} md:flex gap-3 items-center flex-wrap mt-2 md:mt-0`}>
            <div className="catalog-sort-box">
              <label htmlFor="sizeSelect">TALLA:</label>
              <select id="sizeSelect" className="catalog-select" value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
                <option value="todos">Todas las Tallas</option>
                <option value="S">Talla S</option>
                <option value="M">Talla M</option>
                <option value="L">Talla L</option>
                <option value="XL">Talla XL</option>
                <option value="XXL">Talla XXL</option>
                <option value="ÚNICA">Talla Única</option>
              </select>
            </div>

            <div className="catalog-sort-box">
              <label htmlFor="colorSelect">COLOR:</label>
              <select id="colorSelect" className="catalog-select" value={colorFilter} onChange={e => setColorFilter(e.target.value)}>
                <option value="todos">Todos los Colores</option>
                <option value="negro">Negro Carbón</option>
                <option value="blanco">Blanco Crudo</option>
                <option value="gris">Gris Grafito</option>
                <option value="beige">Beige Arena</option>
                <option value="rojo">Rojo Terracota</option>
                <option value="azul">Azul Índigo</option>
                <option value="verde">Verde Oliva</option>
              </select>
            </div>

            <div className="catalog-sort-box">
              <label htmlFor="priceSelect">PRECIO:</label>
              <select
                id="priceSelect"
                className="catalog-select"
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
              >
                <option value="todos">Todos los Precios</option>
                <option value="under-60">Menos de $60 USD</option>
                <option value="60-120">$60 - $120 USD</option>
                <option value="over-120">Más de $120 USD</option>
              </select>
            </div>

            <div className="catalog-sort-box">
              <label htmlFor="styleSelect">ESTILO:</label>
              <select id="styleSelect" className="catalog-select" value={styleFilter} onChange={e => setStyleFilter(e.target.value)}>
                <option value="todos">Todos los Estilos</option>
                <option value="streetwear">Streetwear</option>
                <option value="minimalist">Minimalist Luxury</option>
                <option value="techwear">Techwear</option>
                <option value="casual">Casual Essentials</option>
              </select>
            </div>

            <div className="catalog-sort-box">
              <label htmlFor="sortSelect">ORDENAR:</label>
              <select id="sortSelect" className="catalog-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="destacados">Destacados</option>
                <option value="precio-bajo">Precio: Menor a Mayor</option>
                <option value="precio-alto">Precio: Mayor a Menor</option>
                <option value="nombre">Nombre: A - Z</option>
              </select>
            </div>

            <button
              type="button"
              className={`stock-filter-toggle ${inStockOnly ? 'active' : ''}`}
              onClick={() => setInStockOnly(!inStockOnly)}
              title="Mostrar únicamente prendas disponibles con inventario"
            >
              <span className={`stock-status-dot ${inStockOnly ? 'active' : ''}`} />
              <span>SOLO EN STOCK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Ropa o Estado Vacío */}
      {filtered.length === 0 ? (
        <div className="w-full py-16 px-4 text-center border border-white/10 rounded-2xl bg-white/[0.02] my-8 animate-in fade-in duration-300">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No se encontraron prendas</h3>
          <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto mb-6">
            {searchQuery && category !== 'todos' ? (
              <>
                No hay prendas para <span className="text-white font-bold">"{searchQuery}"</span> en la categoría{' '}
                <span className="text-white font-bold">{currentCategoryObj?.name || category}</span>.
              </>
            ) : searchQuery ? (
              <>
                No encontramos prendas que coincidan con la búsqueda <span className="text-white font-bold">"{searchQuery}"</span>.
              </>
            ) : (
              'No hay prendas disponibles que coincidan con la combinación actual de filtros.'
            )}
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center items-center">
            {category !== 'todos' && (
              <button
                type="button"
                onClick={() => {
                  setCategory('todos');
                  if (setActiveCategoryFilter) setActiveCategoryFilter('todos');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-bold font-mono text-xs hover:bg-white/90 transition shadow-lg shadow-white/5 cursor-pointer"
              >
                <span>BUSCAR EN TODAS LAS CATEGORÍAS</span>
                <ArrowRight size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/20 text-white font-mono text-xs hover:bg-white/10 transition cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>REINICIAR TODOS LOS FILTROS</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="apparel-grid">
          {(() => {
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const paginatedList = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            return paginatedList.map(product => {
              const activeVar = cardActiveVariants[product.id] || product;
              const productSizes = (activeVar.size_stock && Object.keys(activeVar.size_stock).length > 0)
                ? Object.keys(activeVar.size_stock)
                : (activeVar.sizes || ['S', 'M', 'L']);
              const currentSize = selectedSizes[product.id] || productSizes[0] || 'M';
              const isAdded = addedState[product.id];

              // Variantes de color enlazadas por color_variants o por group_id
              let cardVariants = [];
              if (product.color_variants && Array.isArray(product.color_variants) && product.color_variants.length > 0) {
                cardVariants = product.color_variants.map((v, idx) => ({
                  ...product,
                  id: v.id || `${product.id}-v-${idx}`,
                  name: product.name,
                  color_name: v.color_name || v.name,
                  color_hex: v.color_hex || v.hex || '#111111',
                  image: v.image || product.image,
                  size_stock: v.size_stock || product.size_stock || {},
                  sizes: (v.size_stock && Object.keys(v.size_stock).length > 0) ? Object.keys(v.size_stock) : product.sizes,
                  stock: v.stock ?? (v.size_stock ? Object.values(v.size_stock).reduce((s, n) => s + (parseInt(n, 10) || 0), 0) : product.stock)
                }));
              } else if (product.group_id) {
                const siblings = products.filter(p => p.group_id === product.group_id);
                if (siblings.length > 0) cardVariants = siblings;
              } else if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
                cardVariants = product.colors.map((c, idx) => ({
                  ...product,
                  id: `${product.id}-c-${idx}`,
                  color_name: typeof c === 'string' ? c : c.name,
                  color_hex: typeof c === 'string' ? '#111' : (c.hex || '#111'),
                  image: product.image,
                  size_stock: product.size_stock || {},
                  sizes: product.sizes,
                  stock: product.stock
                }));
              }

              const handleCardAddToCart = () => {
                const itemToAdd = {
                  ...activeVar,
                  id: activeVar.id || product.id,
                  image: activeVar.image || product.image,
                  color_name: activeVar.color_name || activeVar.colorName || product.color_name || 'Estándar',
                  color_hex: activeVar.color_hex || activeVar.colorHex || product.color_hex || '#111111'
                };
                handleAddToCart(itemToAdd);
              };

          return (
            <article className="apparel-card" key={product.id}>
              <div className="card-media-wrapper">
                <div className={`card-badge badge-${activeVar.badgeType || product.badgeType || 'default'}`}>
                  {activeVar.badge || product.badge}
                </div>

                {/* Botón de Favoritos (Wishlist) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(activeVar);
                  }}
                  className={`absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition cursor-pointer ${
                    isWishlisted(activeVar.id || product.id)
                      ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50'
                      : 'bg-black/50 text-white/60 hover:text-white border border-white/10'
                  }`}
                  title={isWishlisted(activeVar.id || product.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                >
                  <Heart size={14} className={isWishlisted(activeVar.id || product.id) ? 'fill-rose-400' : ''} />
                </button>

                {adminMode && (
                  <div className="admin-card-actions">
                    <button type="button" className="btn-admin-card btn-edit" onClick={() => openAdminModal(product)} title="Editar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button type="button" className="btn-admin-card btn-delete" onClick={() => handleDelete(product)} title="Eliminar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                )}

                <div
                  className="card-image-box cursor-pointer"
                  onClick={() => setQuickViewProduct({ ...activeVar, id: activeVar.id || product.id, image: activeVar.image || product.image })}
                >
                  <img
                    src={activeVar.image || product.image}
                    alt={activeVar.name || product.name}
                    loading="lazy"
                    decoding="async"
                    className="card-img"
                    onError={(e) => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
                  />
                  <div className="card-hover-overlay">
                    <span className="btn-quick-look">VISTA RÁPIDA</span>
                  </div>
                </div>
              </div>

              <div className="card-content">
                <div className="card-header-row">
                  <span className="card-category-label">
                    {((activeVar.gender || product.gender || 'UNISEX')).toUpperCase()} • {((activeVar.category || product.category || 'ROPA')).toUpperCase()}
                  </span>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="card-price text-sm font-black text-white font-mono">
                      {formatUSD(activeVar.price || product.price || 0)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold leading-none mt-0.5">
                      ≈ {formatCOP(activeVar.price || product.price || 0)}
                    </span>
                  </div>
                </div>

                <div className="card-brand-row">
                  <span className="card-brand-label">
                    {activeVar.brand || product.brand || 'Kamil Shop Atelier'}
                  </span>
                  {activeVar.stock > 0 && activeVar.stock <= 5 && (
                    <span className="card-stock-warning">¡ÚLTIMAS {formatThousands(activeVar.stock)}!</span>
                  )}
                </div>

                <h3
                  className="card-title cursor-pointer"
                  onClick={() => setQuickViewProduct({ ...activeVar, id: activeVar.id || product.id, image: activeVar.image || product.image })}
                >
                  {activeVar.name || product.name}
                </h3>
                <p className="card-specs">{activeVar.specs || product.specs || (activeVar.description || product.description || '').slice(0, 70) + '...'}</p>

                {/* Variantes de Color Interactivas en la Tarjeta */}
                {cardVariants.length > 0 && (
                  <div className="flex items-center gap-1.5 py-1 flex-wrap">
                    <span className="text-[10px] font-mono text-white/50 tracking-wider">
                      COLOR:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {cardVariants.map((v, i) => {
                        const isSelected = (activeVar.color_name || activeVar.colorName) === (v.color_name || v.colorName);
                        const hex = v.color_hex || v.colorHex || (v.colors && v.colors[0]?.hex) || '#111111';
                        const isLight = hex === '#FFFFFF' || hex === '#F5F5F0' || hex === '#f8f8f6';

                        return (
                          <button
                            key={v.id || i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardActiveVariants(prev => ({ ...prev, [product.id]: v }));
                              const nextSizes = (v.size_stock && Object.keys(v.size_stock).length > 0) ? Object.keys(v.size_stock) : v.sizes;
                              const curStk = v.size_stock ? (v.size_stock[currentSize] ?? 0) : (v.stock ?? 1);
                              if (curStk <= 0 && nextSizes && nextSizes.length > 0) {
                                const avail = nextSizes.find(sz => (v.size_stock ? (v.size_stock[sz] ?? 0) : (v.stock ?? 1)) > 0);
                                if (avail) {
                                  setSelectedSizes(prev => ({ ...prev, [product.id]: avail }));
                                }
                              }
                            }}
                            className={`h-4 w-4 rounded-full border transition cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'border-white ring-2 ring-white/60 scale-125 shadow-sm'
                                : 'border-white/20 hover:scale-110 opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: hex }}
                            title={`${v.color_name || v.colorName || 'Color'} (${v.name || product.name})`}
                          >
                            {isSelected && (
                              <span className={`block h-1 w-1 rounded-full ${isLight ? 'bg-black' : 'bg-white'}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-mono text-white/70 truncate max-w-[120px]">
                      {activeVar.color_name || activeVar.colorName || ''}
                    </span>
                  </div>
                )}

                {/* Selector de Tallas con Detección de Agotado */}
                <div className="card-size-selector">
                  <span className="size-label">Talla:</span>
                  <div className="sizes-pills">
                    {productSizes.map(s => {
                      const sStock = activeVar.size_stock ? (activeVar.size_stock[s] ?? 0) : (activeVar.stock ?? 1);
                      const isOut = sStock <= 0;

                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={isOut}
                          className={`size-pill ${currentSize === s ? 'selected' : ''} ${isOut ? 'opacity-30 line-through cursor-not-allowed border-white/5' : ''}`}
                          onClick={() => !isOut && handleSelectSize(product.id, s)}
                          title={isOut ? `Talla ${s} agotada en ${activeVar.color_name || 'este color'}` : `Talla ${s} (${sStock} disponibles)`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="card-actions-row">
                  <button
                    type="button"
                    className={`btn-add-to-cart ${isAdded ? 'added' : ''}`}
                    onClick={handleCardAddToCart}
                  >
                    <span className="btn-text">
                      {isAdded ? '¡AGREGADO!' : (
                        <>
                          <span className="hidden sm:inline">AÑADIR AL CARRITO</span>
                          <span className="sm:hidden">AÑADIR</span>
                        </>
                      )}
                    </span>
                    <span className="btn-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="btn-view-details"
                    onClick={() => setQuickViewProduct({ ...activeVar, id: activeVar.id || product.id, image: activeVar.image || product.image })}
                    title="Ver detalle"
                  >
                    <img src="assets/icons/668bf5037aeabfaa5b4b48ed_footer_arrow.svg" alt="Arrow" className="icon-arrow" />
                  </button>
                </div>
              </div>
            </article>
            );
          });
        })()}
      </div>

      {/* Paginación de Prendas (Servidor & Cliente) */}
      {filtered.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-3 mt-10 font-mono text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-20 disabled:pointer-events-none transition text-white font-bold cursor-pointer"
          >
            ← ANTERIOR
          </button>
          
          <span className="text-white/60 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            PÁGINA <strong className="text-white">{currentPage}</strong> DE <strong className="text-white">{Math.ceil(filtered.length / itemsPerPage)}</strong>
          </span>

          <button
            type="button"
            disabled={currentPage >= Math.ceil(filtered.length / itemsPerPage)}
            onClick={() => {
              setCurrentPage(prev => Math.min(Math.ceil(filtered.length / itemsPerPage), prev + 1));
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 disabled:opacity-20 disabled:pointer-events-none transition text-white font-bold cursor-pointer"
          >
            SIGUIENTE →
          </button>
        </div>
      )}
      </>
      )}
    </section>
  );
};
