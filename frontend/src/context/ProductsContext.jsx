import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const STORAGE_KEY = 'kamilshop_apparel_catalog_v5';

export const DEFAULT_APPAREL = [
  // --- HOMBRE: HOODIES CON VARIANTES RELACIONADAS (group_id: grp-hoodie-boxy) ---
  {
    id: "app-m1-cream",
    group_id: "grp-hoodie-boxy",
    name: "Kamil Shop Heavyweight Boxy Hoodie",
    color_name: "Blanco Crudo",
    color_hex: "#F5F5F0",
    gender: "hombre",
    category: "hoodies",
    style: "streetwear",
    brand: "Kuro Archive",
    brand_id: 1,
    brand_code: "KAMIL_SHOP_ATELIER",
    price: 95.00,
    badge: "NUEVO DROP",
    badgeType: "new",
    description: "Hoodie de corte oversized masculino confeccionado en algodón francés de 480 GSM. Detalle de costuras caídas y bolsillo canguro oculto en tono Blanco Crudo.",
    specs: "100% Algodón Francés • 480 GSM • Tratamiento Stonewash",
    sizes: ["S", "M", "L", "XL", "XXL"],
    size_stock: { "S": 4, "M": 6, "L": 5, "XL": 2, "XXL": 1 },
    image: "assets/products/apparel-hoodie-cream.jpg",
    featured: true,
    stock: 18
  },
  {
    id: "app-m1-black",
    group_id: "grp-hoodie-boxy",
    name: "Kamil Shop Heavyweight Boxy Hoodie",
    color_name: "Negro Carbón",
    color_hex: "#111111",
    gender: "hombre",
    category: "hoodies",
    style: "streetwear",
    brand: "Kuro Archive",
    brand_id: 1,
    brand_code: "KAMIL_SHOP_ATELIER",
    price: 95.00,
    badge: "EDICIÓN LIMITADA",
    badgeType: "limited",
    description: "Hoodie de corte oversized masculino confeccionado en algodón francés de 480 GSM en tono Negro Carbón con acabado mate profundo.",
    specs: "100% Algodón Francés • 480 GSM • Tratamiento Stonewash",
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "S": 2, "M": 5, "L": 4, "XL": 1 },
    image: "assets/products/apparel-tee-black.jpg",
    featured: true,
    stock: 12
  },
  {
    id: "app-m1-slate",
    group_id: "grp-hoodie-boxy",
    name: "Kamil Shop Heavyweight Boxy Hoodie",
    color_name: "Gris Grafito",
    color_hex: "#4A4A4A",
    gender: "hombre",
    category: "hoodies",
    style: "streetwear",
    brand: "Kuro Archive",
    brand_id: 1,
    brand_code: "KAMIL_SHOP_ATELIER",
    price: 95.00,
    badge: "BEST SELLER",
    badgeType: "hot",
    description: "Hoodie de corte oversized masculino confeccionado en algodón francés de 480 GSM en tono Gris Grafito industrial.",
    specs: "100% Algodón Francés • 480 GSM • Tratamiento Stonewash",
    sizes: ["M", "L", "XL"],
    size_stock: { "M": 3, "L": 3, "XL": 2 },
    image: "assets/products/apparel-jacket-tech.jpg",
    featured: false,
    stock: 8
  },

  // --- HOMBRE: CAMISETAS CON VARIANTES DE COLOR (group_id: grp-tee-heavy) ---
  {
    id: "app-m2-black",
    group_id: "grp-tee-heavy",
    name: "Kamil Shop Vintage Washed Heavy Tee",
    color_name: "Negro Carbón",
    color_hex: "#111111",
    gender: "hombre",
    category: "camisetas",
    style: "casual",
    brand: "Kuro Archive",
    brand_id: 2,
    brand_code: "KURO_ARCHIVE",
    price: 55.00,
    badge: "BEST SELLER",
    badgeType: "hot",
    description: "Camiseta masculina con cuello cerrado rib de 3cm y hombros estructurados. Tintura al frío en Negro Carbón.",
    specs: "100% Algodón Peinado • 260 GSM • Hombro caído",
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "S": 6, "M": 10, "L": 6, "XL": 3 },
    image: "assets/products/apparel-tee-black.jpg",
    featured: true,
    stock: 25
  },
  {
    id: "app-m2-cream",
    group_id: "grp-tee-heavy",
    name: "Kamil Shop Vintage Washed Heavy Tee",
    color_name: "Blanco Crudo",
    color_hex: "#F5F5F0",
    gender: "hombre",
    category: "camisetas",
    style: "casual",
    brand: "Kuro Archive",
    brand_id: 2,
    brand_code: "KURO_ARCHIVE",
    price: 55.00,
    badge: "NUEVO DROP",
    badgeType: "new",
    description: "Camiseta masculina en algodón de 260 GSM con tintura al frío en Blanco Crudo y caído limpio.",
    specs: "100% Algodón Peinado • 260 GSM • Hombro caído",
    sizes: ["S", "M", "L"],
    size_stock: { "S": 5, "M": 6, "L": 4 },
    image: "assets/products/apparel-oversized-tee.jpg",
    featured: false,
    stock: 15
  },

  // --- HOMBRE: PANTALONES CARGO (group_id: grp-cargo-tactical) ---
  {
    id: "app-m3-militar",
    group_id: "grp-cargo-tactical",
    name: "Kamil Shop Relaxed Tactical Cargo",
    color_name: "Verde Militar",
    color_hex: "#3A4032",
    gender: "hombre",
    category: "pantalones",
    style: "techwear",
    brand: "Acro Studios",
    brand_id: 3,
    brand_code: "ACRO_STUDIOS",
    price: 110.00,
    badge: "EDICIÓN LIMITADA",
    badgeType: "limited",
    description: "Pantalón cargo para hombre con rodillas ergonómicas articuladas y 6 bolsillos utilitarios con broches magnéticos.",
    specs: "Sarga de Algodón 380 GSM • Costura triple reforzada",
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "S": 3, "M": 4, "L": 3, "XL": 2 },
    image: "assets/products/apparel-cargo-pants.jpg",
    featured: true,
    stock: 12
  },
  {
    id: "app-m3-black",
    group_id: "grp-cargo-tactical",
    name: "Kamil Shop Relaxed Tactical Cargo",
    color_name: "Negro Carbón",
    color_hex: "#111111",
    gender: "hombre",
    category: "pantalones",
    style: "techwear",
    brand: "Acro Studios",
    brand_id: 3,
    brand_code: "ACRO_STUDIOS",
    price: 110.00,
    badge: "BEST SELLER",
    badgeType: "hot",
    description: "Pantalón cargo técnico en sarga de alta densidad teñida en Negro Carbón mate.",
    specs: "Sarga de Algodón 380 GSM • Costura triple reforzada",
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "S": 2, "M": 5, "L": 2, "XL": 1 },
    image: "assets/products/apparel-jacket-tech.jpg",
    featured: false,
    stock: 10
  },

  // --- MUJER: BLAZERS (group_id: grp-sculptural-blazer) ---
  {
    id: "app-w1-black",
    group_id: "grp-sculptural-blazer",
    name: "Kamil Shop Sculptural Blazer",
    color_name: "Negro Obsidiana",
    color_hex: "#0F0F0F",
    gender: "mujer",
    category: "chaquetas",
    style: "minimalist",
    brand: "Kuro Archive",
    brand_id: 1,
    brand_code: "KAMIL_SHOP_ATELIER",
    price: 155.00,
    badge: "EXCLUSIVO",
    badgeType: "exclusive",
    description: "Blazer sastre femenino con cierre cruzado asimétrico y solapas en punta. Silueta de hombreras suaves y caída limpia en Negro Obsidiana.",
    specs: "Lana Fría y Viscosa • Forro de Cupro • Botón de cuerno natural",
    sizes: ["XS", "S", "M", "L"],
    size_stock: { "XS": 2, "S": 3, "M": 3, "L": 1 },
    image: "assets/products/apparel-jacket-tech.jpg",
    featured: true,
    stock: 9
  },
  {
    id: "app-w1-cream",
    group_id: "grp-sculptural-blazer",
    name: "Kamil Shop Sculptural Blazer",
    color_name: "Blanco Crudo",
    color_hex: "#F5F5F0",
    gender: "mujer",
    category: "chaquetas",
    style: "minimalist",
    brand: "Kuro Archive",
    brand_id: 1,
    brand_code: "KAMIL_SHOP_ATELIER",
    price: 155.00,
    badge: "NUEVO DROP",
    badgeType: "new",
    description: "Blazer sastre femenino en tono Blanco Crudo marfil con caída escultórica minimalista.",
    specs: "Lana Fría y Viscosa • Forro de Cupro • Botón de cuerno natural",
    sizes: ["XS", "S", "M"],
    size_stock: { "XS": 2, "S": 3, "M": 2 },
    image: "assets/products/apparel-hoodie-cream.jpg",
    featured: false,
    stock: 7
  },

  // --- MUJER: PANTALÓN PALAZZO (group_id: grp-draped-trouser) ---
  {
    id: "app-w2",
    group_id: "grp-draped-trouser",
    name: "Kamil Shop Draped Wide-Leg Trouser",
    color_name: "Beige Arena",
    color_hex: "#C2B69D",
    gender: "mujer",
    category: "pantalones",
    style: "minimalist",
    brand: "Aura Minimal",
    brand_id: 4,
    brand_code: "AURA_MINIMAL",
    price: 120.00,
    badge: "NUEVO DROP",
    badgeType: "new",
    description: "Pantalón femenino de tiro alto con doble pinza frontal y pierna ancha palazzo. Caída fluida y movimiento arquitectónico.",
    specs: "Twill de Tencel y Lino • Cinturilla interior estructurada",
    sizes: ["XS", "S", "M", "L"],
    size_stock: { "XS": 3, "S": 5, "M": 4, "L": 2 },
    image: "assets/products/apparel-cargo-pants.jpg",
    featured: true,
    stock: 14
  },

  // --- MUJER: BABY TEE (group_id: grp-baby-tee) ---
  {
    id: "app-w3-white",
    group_id: "grp-baby-tee",
    name: "Kamil Shop Structured Baby Tee",
    color_name: "Blanco Óptico",
    color_hex: "#FFFFFF",
    gender: "mujer",
    category: "camisetas",
    style: "streetwear",
    brand: "Kuro Archive",
    brand_id: 2,
    brand_code: "KURO_ARCHIVE",
    price: 48.00,
    badge: "BEST SELLER",
    badgeType: "hot",
    description: "Camiseta entallada de punto elástico ribeteado con costuras decorativas contrastadas y bajo micro-cropped en Blanco Óptico.",
    specs: "95% Algodón Supima / 5% Elastano • Tejido 220 GSM",
    sizes: ["XS", "S", "M", "L"],
    size_stock: { "XS": 5, "S": 8, "M": 6, "L": 3 },
    image: "assets/products/apparel-oversized-tee.jpg",
    featured: false,
    stock: 22
  },
  {
    id: "app-w3-black",
    group_id: "grp-baby-tee",
    name: "Kamil Shop Structured Baby Tee",
    color_name: "Negro Carbón",
    color_hex: "#111111",
    gender: "mujer",
    category: "camisetas",
    style: "streetwear",
    brand: "Kuro Archive",
    brand_id: 2,
    brand_code: "KURO_ARCHIVE",
    price: 48.00,
    badge: "EDICIÓN LIMITADA",
    badgeType: "limited",
    description: "Camiseta entallada de punto elástico en Negro Carbón con bajo micro-cropped.",
    specs: "95% Algodón Supima / 5% Elastano • Tejido 220 GSM",
    sizes: ["XS", "S", "M"],
    size_stock: { "XS": 4, "S": 6, "M": 4 },
    image: "assets/products/apparel-tee-black.jpg",
    featured: false,
    stock: 14
  },

  // --- UNISEX ---
  {
    id: "app-u1",
    group_id: "grp-windbreaker",
    name: "Kamil Shop All-Weather Windbreaker",
    color_name: "Negro Técnico",
    color_hex: "#1A1A1A",
    gender: "unisex",
    category: "chaquetas",
    style: "techwear",
    brand: "Acro Studios",
    brand_id: 3,
    brand_code: "ACRO_STUDIOS",
    price: 135.00,
    badge: "TECNOLOGÍA DWR",
    badgeType: "limited",
    description: "Chaqueta impermeable de silueta neutra con capucha oculta y costuras selladas. Apta para cualquier género y clima adverso.",
    specs: "Nylon Micro-Ripstop 3L • Membrana 15k Waterproof • Cierres YKK",
    sizes: ["S", "M", "L", "XL"],
    size_stock: { "S": 2, "M": 4, "L": 3, "XL": 2 },
    image: "assets/products/apparel-jacket-tech.jpg",
    featured: true,
    stock: 11
  },
  {
    id: "app-u2",
    group_id: "grp-monogram-cap",
    name: "Kamil Shop Archive Monogram Cap",
    color_name: "Negro Lavado",
    color_hex: "#222222",
    gender: "unisex",
    category: "accesorios",
    style: "casual",
    brand: "Kuro Archive",
    brand_id: 1,
    brand_code: "KAMIL_SHOP_ATELIER",
    price: 40.00,
    badge: "ACCESORIO",
    badgeType: "permanent",
    description: "Gorra desestructurada de 6 paneles en sarga de algodón lavado a mano. Cierre posterior metálico regulable.",
    specs: "100% Algodón Lavado • Hebilla de Latón Envejecido",
    sizes: ["Única"],
    size_stock: { "Única": 35 },
    image: "assets/products/apparel-cap-black.jpg",
    featured: false,
    stock: 35
  }
];

export const PASARELA_ITEMS = [
  {
    id: "pas-1",
    title: "Kamil Shop Noir Bomber",
    category: "Edición Limitada // 01",
    tag: "ALTA COSTURA",
    image: "assets/products/apparel-jacket-tech.jpg",
    desc: "Chaqueta bomber estructurada en nylon balístico mate con forro térmico acolchado y herrajes de acero inoxidable pulido.",
    price: "$180.00 USD",
    productId: "app-w1-black"
  },
  {
    id: "pas-2",
    title: "Kamil Shop Trench Coat",
    category: "Tailoring Moderno // 02",
    tag: "EXCLUSIVO",
    image: "assets/products/apparel-hoodie-cream.jpg",
    desc: "Abrigo trench de silueta caída en gabardina de algodón impermeabilizado con cinturón de solapa doble.",
    price: "$220.00 USD",
    productId: "app-m1-cream"
  },
  {
    id: "pas-3",
    title: "Kamil Shop Cargo Trousers",
    category: "Techwear // 03",
    tag: "BEST SELLER",
    image: "assets/products/apparel-cargo-pants.jpg",
    desc: "Pantalón cargo de sarga técnica con múltiples bolsillos tridimensionales y bajo ajustable con tanca.",
    price: "$110.00 USD",
    productId: "app-m3-militar"
  }
];

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo catálogo local', e);
    }
    return DEFAULT_APPAREL;
  });

  const [activeGender, setActiveGender] = useState('todos');
  const [activeCategory, setActiveCategory] = useState('todas');
  const [activeStyle, setActiveStyle] = useState('todos');
  const [activeBrand, setActiveBrand] = useState('todas');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Sincronizar catálogo con API o localStorage
  useEffect(() => {
    let isMounted = true;
    apiClient.getProducts()
      .then(res => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
          } catch (err) {}
        }
      })
      .catch(() => {
        // En caso de fallar backend, mantenemos local
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  // Filtrado reactivo de prendas
  const filteredProducts = products.filter(p => {
    if (activeGender !== 'todos' && p.gender !== activeGender && p.gender !== 'unisex') return false;
    if (activeCategory !== 'todas' && p.category !== activeCategory) return false;
    if (activeStyle !== 'todos' && p.style !== activeStyle) return false;
    if (activeBrand !== 'todas' && p.brand !== activeBrand) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = p.name ? p.name.toLowerCase().includes(q) : false;
      const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
      const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
      const matchColor = p.color_name ? p.color_name.toLowerCase().includes(q) : false;
      if (!matchName && !matchDesc && !matchBrand && !matchColor) return false;
    }

    return true;
  });

  const getProductById = (id) => products.find(p => p.id === id);

  /**
   * Obtiene todas las variantes de color (tanto de color_variants embebidos como de group_id de hermanos)
   */
  const getRelatedColorVariants = (product) => {
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
          : (product.sizes || ['S', 'M', 'L', 'XL']),
        stock: v.stock ?? (v.size_stock ? Object.values(v.size_stock).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0) : product.stock)
      }));
    }
    if (product.group_id) {
      const siblings = products.filter(p => p.group_id === product.group_id);
      if (siblings.length > 0) return siblings;
    }
    return [product];
  };

  const addProduct = (newProd) => {
    const created = {
      ...newProd,
      id: newProd.id || `app-${Date.now()}`
    };
    setProducts(prev => [created, ...prev]);
  };

  const updateProduct = (updated) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => {
      const target = prev.find(p => p.id === id);
      let next;
      if (target && target.group_id) {
        next = prev.filter(p => p.id !== id && p.group_id !== target.group_id);
      } else {
        next = prev.filter(p => p.id !== id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    apiClient.deleteAdminProduct(id).catch(() => {});
  };

  return (
    <ProductsContext.Provider value={{
      products,
      setProducts,
      filteredProducts,
      activeGender,
      setActiveGender,
      activeCategory,
      setActiveCategory,
      activeStyle,
      setActiveStyle,
      activeBrand,
      setActiveBrand,
      priceRange,
      setPriceRange,
      searchQuery,
      setSearchQuery,
      quickViewProduct,
      setQuickViewProduct,
      getProductById,
      getRelatedColorVariants,
      pasarelaItems: PASARELA_ITEMS,
      addProduct,
      updateProduct,
      deleteProduct,
      removeProduct: deleteProduct
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de ProductsProvider');
  }
  return context;
};
