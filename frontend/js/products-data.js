/**
 * TITULO E-Commerce - Inventario y Capa de Datos de Ropa
 * Permite persistencia en localStorage para que el Administrador gestione el catálogo.
 */

const DEFAULT_APPAREL = [
  {
    id: "app-1",
    name: "TITULO Heavyweight Boxy Hoodie",
    category: "hoodies",
    price: 95.00,
    badge: "NUEVO DROP",
    badgeType: "new",
    description: "Hoodie de corte oversized contemporáneo confeccionado en algodón francés de 480 GSM. Detalle de costuras caídas, bolsillo canguro oculto y tacto aterciopelado prémium.",
    specs: "100% Algodón Francés • 480 GSM • Lavado con piedras • Hecho a mano",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/products/apparel-hoodie-cream.jpg",
    featured: true,
    stock: 18
  },
  {
    id: "app-2",
    name: "TITULO Minimal Vintage Washed Tee",
    category: "camisetas",
    price: 55.00,
    badge: "BEST SELLER",
    badgeType: "hot",
    description: "Camiseta de cuello cerrado y caída estructurada. Tintura en prenda con tratamiento de desgaste suave que aporta carácter único a cada pieza.",
    specs: "100% Algodón Peinado • 260 GSM • Cuello rib de 2.5cm",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/products/apparel-tee-black.jpg",
    featured: true,
    stock: 25
  },
  {
    id: "app-3",
    name: "TITULO Hybrid Technical Jacket",
    category: "chaquetas",
    price: 145.00,
    badge: "EDICIÓN LIMITADA",
    badgeType: "limited",
    description: "Chaqueta impermeable ligera con paneles modulares y cierres termosellados. Diseñada para proteger del viento y la lluvia con estética brutalista.",
    specs: "Nylon Ripstop 3L • Membrana DWR • Cierres YKK Aquaguard",
    sizes: ["M", "L", "XL"],
    image: "assets/products/apparel-jacket-tech.jpg",
    featured: true,
    stock: 8
  },
  {
    id: "app-4",
    name: "TITULO Monochrome Archival Crewneck",
    category: "hoodies",
    price: 85.00,
    badge: "COLECCIÓN PERMANENTE",
    badgeType: "permanent",
    description: "Sudadera clásica cuello redondo con remates elásticos reforzados. Logotipo sutil grabado en relieve de bajo perfil en la parte posterior.",
    specs: "Algodón Orgánico Certificado • 420 GSM • Puños con elastano",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/products/apparel-crewneck-grey.jpg",
    featured: true,
    stock: 14
  },
  {
    id: "app-5",
    name: "TITULO Sculptural Relaxed Cargo",
    category: "pantalones",
    price: 110.00,
    badge: "NUEVO DROP",
    badgeType: "new",
    description: "Pantalón técnico con pinzas articuladas en rodillas y seis bolsillos ergonómicos. Cintura ajustable mediante cordón técnico interno.",
    specs: "Sarga de Algodón Pesado • Costuras triples • Botones metálicos mate",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/products/apparel-cargo-pants.jpg",
    featured: true,
    stock: 12
  },
  {
    id: "app-6",
    name: "TITULO Raw Edge Drop-Shoulder Tee",
    category: "camisetas",
    price: 60.00,
    badge: "EXCLUSIVO",
    badgeType: "exclusive",
    description: "Silueta ancha inspirada en la sastrería urbana japonesa con dobladillos sin rematar y caída geométrica pesada.",
    specs: "Algodón Texturizado • 280 GSM • Tratamiento anti-encogimiento",
    sizes: ["S", "M", "L", "XL"],
    image: "assets/products/apparel-oversized-tee.jpg",
    featured: false,
    stock: 20
  },
  {
    id: "app-7",
    name: "TITULO Modular Utility Vest",
    category: "chaquetas",
    price: 90.00,
    badge: "EDICIÓN LIMITADA",
    badgeType: "limited",
    description: "Chaleco utilitario con arnés de hombros regulable y anillas tácticas. Ideal para superposiciones en capas sobre hoodies o camisetas.",
    specs: "Cordura 500D • Cintas militares • Hebillas magnéticas",
    sizes: ["M", "L"],
    image: "assets/products/apparel-vest-street.jpg",
    featured: false,
    stock: 6
  },
  {
    id: "app-8",
    name: "TITULO Monogram Washed Cap",
    category: "accesorios",
    price: 40.00,
    badge: "ACCESORIO",
    badgeType: "permanent",
    description: "Gorra de perfil bajo sin estructura rígida, sarga de algodón lavado y hebilla metálica trasera con grabado láser.",
    specs: "100% Sarga de Algodón • 6 paneles • Talla ajustable",
    sizes: ["Única"],
    image: "assets/products/apparel-cap-black.jpg",
    featured: false,
    stock: 30
  }
];

const PASARELA_ITEMS = [
  {
    id: "pas-1",
    title: "Granola Bio Natural Oats",
    category: "Pack Sostenible // 01",
    tag: "100% RECICLABLE",
    image: "assets/products/pasarela-oatmeal.jpg",
    desc: "Empaque de barrera ultra-alta elaborado en papel sustentable con acabado mate libre de plásticos multicapa.",
    price: "$14.50 USD"
  },
  {
    id: "pas-2",
    title: "Barista Oat Organic Drink",
    category: "Envase Hermético // 02",
    tag: "BARRERA AL OXÍGENO",
    image: "assets/products/pasarela-milk.jpg",
    desc: "Estructura para líquidos con sellado hermético por dispersión base agua. Amigable con compostaje industrial.",
    price: "$8.00 USD"
  },
  {
    id: "pas-3",
    title: "Extra Patate Crisp & Crunch",
    category: "Bolsa Snack // 03",
    tag: "TERMOSELLABLE",
    image: "assets/products/pasarela-chips.jpg",
    desc: "Bolsa para snacks con resistencia extrema a grasas y conservación prolongada de crocancia.",
    price: "$6.50 USD"
  },
  {
    id: "pas-4",
    title: "Peanuts Protein Snack Bar",
    category: "Flow-Wrap // 04",
    tag: "GRADO ALIMENTARIO",
    image: "assets/products/pasarela-snack.jpg",
    desc: "Envoltorio de alta velocidad para barras energéticas. Mantiene nutrientes y frescura sin foil de aluminio.",
    price: "$4.00 USD"
  },
  {
    id: "pas-5",
    title: "Ultra Performance Energy Gel",
    category: "Monodosis // 05",
    tag: "CERO RESIDUOS",
    image: "assets/products/pasarela-gel.jpg",
    desc: "Sachet de papel hidrofóbico flexible diseñado para suplementación deportiva de alto rendimiento.",
    price: "$3.50 USD"
  }
];

const STORAGE_KEY = "titulo_apparel_catalog_v1";

const ProductsStore = {
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error leyendo catálogo de localStorage, usando predeterminado", e);
    }
    this.save(DEFAULT_APPAREL);
    return [...DEFAULT_APPAREL];
  },

  getById(id) {
    const list = this.getAll();
    return list.find(item => item.id === id) || null;
  },

  save(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent("titulo:products-updated", { detail: { products } }));
    } catch (e) {
      console.error("Error guardando en localStorage", e);
    }
  },

  add(productData) {
    const list = this.getAll();
    const newProduct = {
      id: "app-" + Date.now(),
      name: productData.name.trim(),
      category: productData.category || "camisetas",
      price: parseFloat(productData.price) || 0,
      badge: productData.badge ? productData.badge.trim().toUpperCase() : "NUEVO",
      badgeType: productData.badgeType || "new",
      description: productData.description ? productData.description.trim() : "Prenda exclusiva diseñada bajo la estética TITULO.",
      specs: productData.specs ? productData.specs.trim() : "Material seleccionado • Edición especial",
      sizes: Array.isArray(productData.sizes) && productData.sizes.length ? productData.sizes : ["S", "M", "L", "XL"],
      image: productData.image && productData.image.trim() ? productData.image.trim() : "assets/products/apparel-tee-black.jpg",
      featured: Boolean(productData.featured),
      stock: parseInt(productData.stock) || 10
    };
    list.unshift(newProduct);
    this.save(list);
    return newProduct;
  },

  update(id, updatedData) {
    const list = this.getAll();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updatedData,
      id
    };
    this.save(list);
    return list[index];
  },

  remove(id) {
    const list = this.getAll();
    const filtered = list.filter(p => p.id !== id);
    this.save(filtered);
    return filtered;
  },

  reset() {
    this.save([...DEFAULT_APPAREL]);
    return [...DEFAULT_APPAREL];
  },

  getPasarelaItems() {
    return PASARELA_ITEMS;
  }
};

window.ProductsStore = ProductsStore;
