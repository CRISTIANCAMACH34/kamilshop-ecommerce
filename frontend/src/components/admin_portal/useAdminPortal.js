import { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { apiClient } from '../../services/apiClient';

const STORAGE_KEY_BRANDS = 'kamil_shop_brands_v2';
const STORAGE_KEY_TYPES = 'kamil_shop_types_v2';
const STORAGE_KEY_SIZES = 'kamil_shop_sizes_v2';
const STORAGE_KEY_COLORS = 'kamil_shop_colors_v2';
const STORAGE_KEY_BRANCHES = 'kamil_shop_branches_v2';

// Purga inmediata de claves antiguas con nombres desactualizados
try {
  ['titulo_admin_brands_v1', 'titulo_admin_types_v1', 'titulo_admin_sizes_v1', 'titulo_admin_colors_v1', 'titulo_admin_branches_v1'].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch (e) {}

const sanitizeData = (item) => {
  if (!item) return item;
  try {
    let str = JSON.stringify(item);
    str = str.replace(/Camila\s*(&|y)\s*T[ií]o/gi, 'Kamil Shop');
    str = str.replace(/Camila/gi, 'Kamil');
    str = str.replace(/Chic[oó](\s*Norte)?/gi, 'Centro Logístico');
    const parsed = JSON.parse(str);
    if (parsed.initials === 'CT') parsed.initials = 'KS';
    return parsed;
  } catch (e) {
    return item;
  }
};

const INITIAL_BRANDS = [
  {
    id: "br-01",
    name: "TITULO Studio",
    initials: "TT",
    tier: "Línea Principal / Luxury",
    country: "Bogotá, Colombia",
    description: "Colección principal contemporánea que combina siluetas arquitectónicas, acabados brutales y confección artesanal.",
    productsCount: 6,
    status: "Activa"
  },
  {
    id: "br-02",
    name: "Noir Archive",
    initials: "NA",
    tier: "Streetwear Heavyweight",
    country: "Medellín, Colombia",
    description: "Prendas confeccionadas en algodón francés de 480 GSM con teñido al frío y lavados minerales.",
    productsCount: 4,
    status: "Activa"
  },
  {
    id: "br-03",
    name: "Atelier Kamil Shop",
    initials: "KS",
    tier: "Alta Costura & Sastrería",
    country: "Importación USA",
    description: "Sastrería desestructurada de tirajes ultralimitados con forros de cupro y lanas frías importadas.",
    productsCount: 3,
    status: "Activa"
  },
  {
    id: "br-04",
    name: "Minimalist Techwear",
    initials: "MT",
    tier: "Funcional & DWR",
    country: "Cali, Colombia",
    description: "Siluetas utilitarias impermeables con cierres termosellados y nylon balístico micro-ripstop.",
    productsCount: 2,
    status: "Activa"
  }
];

const INITIAL_GARMENT_TYPES = [
  {
    id: "typ-01",
    name: "Hoodies & Buzos",
    category: "Prendas Superiores",
    brandName: "TITULO Studio",
    gender: "Unisex",
    suggestedSizes: ["S", "M", "L", "XL", "XXL"],
    textileSpecs: "100% Algodón Francés • 480 GSM • Tratamiento Stonewash",
    productsCount: 4,
    status: "Activo"
  },
  {
    id: "typ-02",
    name: "Chaquetas & Abrigos",
    category: "Abrigos & Outerwear",
    brandName: "Atelier Kamil Shop",
    gender: "Unisex",
    suggestedSizes: ["S", "M", "L", "XL"],
    textileSpecs: "Cuero Vacuno / Nylon Balístico 3L • Membrana DWR",
    productsCount: 3,
    status: "Activo"
  },
  {
    id: "typ-03",
    name: "Camisetas Heavyweight",
    category: "Prendas Superiores",
    brandName: "Noir Archive",
    gender: "Hombre / Mujer",
    suggestedSizes: ["XS", "S", "M", "L", "XL"],
    textileSpecs: "100% Algodón Peinado • 260 GSM • Cuello rib 3cm",
    productsCount: 5,
    status: "Activo"
  },
  {
    id: "typ-04",
    name: "Pantalones & Cargos",
    category: "Prendas Inferiores",
    brandName: "Minimalist Techwear",
    gender: "Unisex",
    suggestedSizes: ["S", "M", "L", "XL"],
    textileSpecs: "Sarga Reforzada 380 GSM • Broches Magnéticos",
    productsCount: 4,
    status: "Activo"
  },
  {
    id: "typ-05",
    name: "Zapatillas Deportivas",
    category: "Calzado Deportivo",
    brandName: "Minimalist Techwear",
    gender: "Unisex",
    suggestedSizes: ["38", "39", "40", "41", "42", "43", "44"],
    textileSpecs: "Cuero Napa y Malla Técnica Transpirable • Suela Vibram",
    productsCount: 2,
    status: "Activo"
  },
  {
    id: "typ-06",
    name: "Ropa Deportiva & Pantalonetas",
    category: "Deportivo & Athleisure",
    brandName: "TITULO Studio",
    gender: "Unisex",
    suggestedSizes: ["S", "M", "L", "XL"],
    textileSpecs: "Poliéster Dry-Fit Elástico 4 Vías • Secado Rápido",
    productsCount: 3,
    status: "Activo"
  }
];

const INITIAL_SIZES = [
  { id: 'sz-01', group: 'Tallas de Ropa (Superior / Inferior)', name: 'Textil Estándar', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], status: 'Activa' },
  { id: 'sz-02', group: 'Calzado & Zapatillas', name: 'Zapatillas Deportivas', sizes: ['38', '39', '40', '41', '42', '43', '44'], status: 'Activa' },
  { id: 'sz-03', group: 'Pantalones & Denim', name: 'Numéricas Cintura', sizes: ['28', '30', '32', '34', '36'], status: 'Activa' },
  { id: 'sz-04', group: 'Accesorios & Gorras', name: 'Talla Única', sizes: ['ÚNICA'], status: 'Activa' }
];

const INITIAL_COLORS = [
  { id: 'col-01', name: 'Noir Obsidian', hex: '#0a0a0a', palette: 'Neutros & Obscure', itemsCount: 12 },
  { id: 'col-02', name: 'Blanco Crudo / Hueso', hex: '#f8f8f6', palette: 'Neutros & Obscure', itemsCount: 8 },
  { id: 'col-03', name: 'Gris Asfalto Mineral', hex: '#4b5563', palette: 'Neutros & Obscure', itemsCount: 6 },
  { id: 'col-04', name: 'Verde Militar Vintage', hex: '#4d5d43', palette: 'Tierras & Colección', itemsCount: 5 },
  { id: 'col-05', name: 'Tierra Arcilla', hex: '#9a5b42', palette: 'Tierras & Colección', itemsCount: 4 },
  { id: 'col-06', name: 'Azul Petróleo Profundo', hex: '#16384c', palette: 'Colección Runway', itemsCount: 3 },
  { id: 'col-07', name: 'Beige Arena', hex: '#d9cdb8', palette: 'Básicos Contemporáneos', itemsCount: 7 }
];

const INITIAL_BRANCHES = [
  {
    id: "hub-01",
    name: "Bodega Central Kamil Shop — Despacho Nacional",
    type: "Centro de Despacho & Fulfillment (Importaciones USA)",
    status: "100% Operando Online",
    address: "Centro Logístico de Despachos Nacionales",
    sla: "24h despacho nacional",
    capacity: "Alta (Cobertura Nacional en toda Colombia)",
    statusBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    isPrimary: true,
  }
];

/**
 * useAdminPortal - Hook desacoplado para orquestación de estado administrativo (SRP & DIP)
 * Conectado con OrdersContext para sincronización bidireccional Tienda <-> Portal.
 */
export const useAdminPortal = () => {
  const { products, setProducts, deleteProduct: deleteProductGlobal } = useProducts();
  const { showToast } = useCart();
  const { 
    orders, 
    advanceOrderStatus: advanceOrderStatusGlobal, 
    dispatchOrder: dispatchOrderGlobal,
    confirmCustomerDelivery: confirmCustomerDeliveryGlobal,
    reportIncident: reportIncidentGlobal, 
    createOrder, 
    customerNotifications 
  } = useOrders();

  // Estados de Configuración y Navegación
  const [activeMenu, setActiveMenu] = useState('resumen');
  const [storeOnline, setStoreOnline] = useState(true);
  const [selectedHub, setSelectedHub] = useState('Bodega Central Kamil Shop — Despacho Nacional');
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('TODOS');

  // Modales y Drawers Operacionales
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);

  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal de Despacho (Local vs Nacional)
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [selectedBranchForEdit, setSelectedBranchForEdit] = useState(null);
  const [branches, setBranches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BRANCHES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeData);
      }
    } catch (e) {}
    return INITIAL_BRANCHES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(branches));
    } catch (e) {}
  }, [branches]);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedCouponForEdit, setSelectedCouponForEdit] = useState(null);

  const [teamModalOpen, setTeamModalOpen] = useState(false);

  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedIncidentOrder, setSelectedIncidentOrder] = useState(null);

  // Marcas de Moda Persistentes (CRUD)
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [selectedBrandForEdit, setSelectedBrandForEdit] = useState(null);
  const [brands, setBrands] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BRANDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeData);
      }
    } catch (e) {}
    return INITIAL_BRANDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
    } catch (e) {}
  }, [brands]);

  // Tipos y Categorías de Prenda Persistentes (CRUD)
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [selectedTypeForEdit, setSelectedTypeForEdit] = useState(null);
  const [garmentTypes, setGarmentTypes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TYPES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeData);
      }
    } catch (e) {}
    return INITIAL_GARMENT_TYPES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TYPES, JSON.stringify(garmentTypes));
    } catch (e) {}
  }, [garmentTypes]);

  // Tallas y Opciones Persistentes (CRUD)
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedSizeForEdit, setSelectedSizeForEdit] = useState(null);
  const [sizesList, setSizesList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIZES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeData);
      }
    } catch (e) {}
    return INITIAL_SIZES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SIZES, JSON.stringify(sizesList));
    } catch (e) {}
  }, [sizesList]);

  // Colores Persistentes (CRUD)
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [selectedColorForEdit, setSelectedColorForEdit] = useState(null);
  const [colorsList, setColorsList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeData);
      }
    } catch (e) {}
    return INITIAL_COLORS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLORS, JSON.stringify(colorsList));
    } catch (e) {}
  }, [colorsList]);

  // Directorio de Clientes Reales (Cargado directamente de la Base de Datos o calculado de órdenes reales)
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const loadRealCustomers = async () => {
      try {
        const realCust = await apiClient.getCustomers();
        if (Array.isArray(realCust) && realCust.length > 0) {
          setCustomers(realCust);
          return;
        }
      } catch (e) {
        console.warn("Error cargando clientes del backend:", e);
      }

      // Si aún no hay clientes en la tabla dedicada, derivar de las órdenes reales que existan
      if (Array.isArray(orders) && orders.length > 0) {
        const custMap = {};
        orders.forEach((o) => {
          const em = (o.email || o.customer_email || '').toLowerCase();
          if (!em) return;
          if (!custMap[em]) {
            custMap[em] = {
              id: `cust-${em.replace(/[^a-zA-Z0-9]/g, '')}`,
              name: o.customer || o.customer_name || 'Cliente',
              email: em,
              phone: o.phone || '',
              city: o.city || 'Bogotá',
              provider: o.provider || 'store_guest',
              tier: (o.total || 0) > 300 ? 'Black Member' : 'Standard',
              totalSpent: 0,
              ordersCount: 0,
            };
          }
          custMap[em].totalSpent += Number(o.total || 0);
          custMap[em].ordersCount += 1;
        });
        setCustomers(Object.values(custMap));
      } else {
        setCustomers([]);
      }
    };

    loadRealCustomers();
  }, [orders]);

  // Avanzar estado de la orden con feedback toast
  const advanceOrderStatus = (orderId) => {
    advanceOrderStatusGlobal(orderId);
    showToast?.("Estado de la orden actualizado en comanda", "info");
  };

  // Reportar Incidencia
  const openIncidentModal = (order) => {
    setSelectedIncidentOrder(order);
    setIncidentModalOpen(true);
  };

  const closeIncidentModal = () => {
    setSelectedIncidentOrder(null);
    setIncidentModalOpen(false);
  };

  const handleReportIncident = (orderId, reason) => {
    reportIncidentGlobal(orderId, reason);
    showToast?.("Incidencia registrada. Pedido reportado a soporte", "info");
  };

  // Simulación de nueva orden
  const simulateIncomingOrder = () => {
    const firstProduct = products[0] || { name: "Prenda TITULO", sku: "TTL-GEN-01" };
    const created = createOrder({
      name: "Cliente VIP Showroom",
      email: "cliente.vip@gmail.com",
      provider: "google",
      address: "Carrera 15 #88-21, Bogotá",
      items: [{ name: firstProduct.name, size: "M", sku: firstProduct.sku || "TTL-GEN-01", qty: 1, price: 95.00 }],
      total: 95.00
    });
    showToast?.(`Nueva orden ${created.code} recibida en bodega`, "success");
  };

  // Handlers para Modal de Producto
  const openCreateProductModal = () => {
    setSelectedProductForEdit(null);
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setSelectedProductForEdit(product);
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setSelectedProductForEdit(null);
  };

  const saveProduct = (productData) => {
    setProducts((prev) => {
      // Si la prenda tiene múltiples variantes de color configuradas con group_id
      if (productData.color_variants && productData.color_variants.length > 1 && productData.group_id) {
        // Remover productos previos pertenecientes a este ID o group_id
        const filtered = prev.filter((p) => p.id !== productData.id && p.group_id !== productData.group_id);

        // Crear una entrada en el catálogo para cada variante de color enlazada por group_id
        const variantItems = productData.color_variants.map((v, idx) => ({
          ...productData,
          id: idx === 0 ? productData.id : `${productData.id}-${v.color_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          group_id: productData.group_id,
          name: productData.name,
          color_name: v.color_name,
          colorName: v.color_name,
          color_hex: v.color_hex,
          colorHex: v.color_hex,
          image: v.image,
          size_stock: v.size_stock,
          stock: v.stock,
          color_variants: productData.color_variants
        }));

        showToast?.(`Prenda "${productData.name}" (${variantItems.length} colores) guardada en catálogo`, 'success');
        return [...variantItems, ...filtered];
      }

      const exists = prev.some((p) => p.id === productData.id);
      if (exists) {
        showToast?.(`Prenda "${productData.name}" actualizada con éxito`, 'success');
        return prev.map((p) => (p.id === productData.id ? { ...p, ...productData } : p));
      }
      showToast?.(`Prenda "${productData.name}" agregada al catálogo`, 'success');
      return [productData, ...prev];
    });
  };

  const deleteProduct = async (productOrId) => {
    const id = typeof productOrId === 'object' ? productOrId.id : productOrId;
    const name = typeof productOrId === 'object' ? productOrId.name : 'la prenda';

    if (deleteProductGlobal) {
      deleteProductGlobal(id);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id && p.group_id !== id));
    }

    try {
      await apiClient.deleteAdminProduct(id);
    } catch (err) {
      console.warn('Error eliminando en backend:', err);
    }

    showToast?.(`Prenda "${name}" eliminada del catálogo`, 'info');
  };

  // Handlers para Drawer de Orden
  const openOrderDrawer = (order) => {
    setSelectedOrder(order);
    setOrderDrawerOpen(true);
  };

  const closeOrderDrawer = () => {
    setOrderDrawerOpen(false);
    setSelectedOrder(null);
  };

  // Handlers para Modal de Sede / Bodega (CRUD)
  const openCreateBranchModal = () => {
    setSelectedBranchForEdit(null);
    setBranchModalOpen(true);
  };
  const openBranchModal = openCreateBranchModal;

  const openEditBranchModal = (branch) => {
    setSelectedBranchForEdit(branch);
    setBranchModalOpen(true);
  };

  const closeBranchModal = () => {
    setSelectedBranchForEdit(null);
    setBranchModalOpen(false);
  };

  const saveBranch = (branchData) => {
    setBranches((prev) => {
      const exists = prev.some((b) => b.id === branchData.id);
      if (exists) {
        showToast?.(`Centro logístico "${branchData.name}" actualizado con éxito`, 'success');
        return prev.map((b) => (b.id === branchData.id ? { ...b, ...branchData } : b));
      }
      showToast?.(`Centro logístico "${branchData.name}" agregado a la red`, 'success');
      return [branchData, ...prev];
    });
  };

  const deleteBranch = (branchId) => {
    setBranches((prev) => {
      if (prev.length <= 1) {
        showToast?.('No puedes eliminar el único centro logístico de despacho activo', 'error');
        return prev;
      }
      const target = prev.find((b) => b.id === branchId);
      const name = target ? target.name : 'la sede';
      showToast?.(`Sede logística "${name}" eliminada de la red`, 'info');
      return prev.filter((b) => b.id !== branchId);
    });
  };

  // Handlers para Miembros de Equipo
  const saveTeamMember = (newMember) => {
    setCustomers((prev) => [newMember, ...prev]);
    showToast?.(`Miembro ${newMember.name} registrado con rol ${newMember.tier}`, 'success');
  };

  // Handlers para Marcas de Moda (CRUD)
  const openCreateBrandModal = () => {
    setSelectedBrandForEdit(null);
    setBrandModalOpen(true);
  };
  const openBrandModal = openCreateBrandModal;

  const openEditBrandModal = (brand) => {
    setSelectedBrandForEdit(brand);
    setBrandModalOpen(true);
  };

  const closeBrandModal = () => {
    setSelectedBrandForEdit(null);
    setBrandModalOpen(false);
  };

  const saveBrand = (brandData) => {
    setBrands((prev) => {
      const exists = prev.some((b) => b.id === brandData.id);
      if (exists) {
        showToast?.(`Marca "${brandData.name}" actualizada con éxito`, 'success');
        return prev.map((b) => (b.id === brandData.id ? { ...b, ...brandData } : b));
      }
      showToast?.(`Marca "${brandData.name}" agregada al portafolio`, 'success');
      return [brandData, ...prev];
    });
  };

  const deleteBrand = (brandId) => {
    setBrands((prev) => {
      const target = prev.find((b) => b.id === brandId);
      const name = target ? target.name : 'la marca';
      showToast?.(`Marca "${name}" eliminada del portafolio`, 'info');
      return prev.filter((b) => b.id !== brandId);
    });
  };

  // Handlers para Tipos y Categorías de Prenda (CRUD)
  const openCreateTypeModal = () => {
    setSelectedTypeForEdit(null);
    setTypeModalOpen(true);
  };
  const openTypeModal = openCreateTypeModal;

  const openEditTypeModal = (type) => {
    setSelectedTypeForEdit(type);
    setTypeModalOpen(true);
  };

  const closeTypeModal = () => {
    setSelectedTypeForEdit(null);
    setTypeModalOpen(false);
  };

  const saveGarmentType = (typeData) => {
    setGarmentTypes((prev) => {
      const exists = prev.some((t) => t.id === typeData.id);
      if (exists) {
        showToast?.(`Categoría "${typeData.name}" actualizada con éxito`, 'success');
        return prev.map((t) => (t.id === typeData.id ? { ...t, ...typeData } : t));
      }
      showToast?.(`Categoría "${typeData.name}" creada exitosamente`, 'success');
      return [typeData, ...prev];
    });
  };

  const deleteGarmentType = (typeId) => {
    setGarmentTypes((prev) => {
      const target = prev.find((t) => t.id === typeId);
      const name = target ? target.name : 'la categoría';
      showToast?.(`Categoría "${name}" eliminada del catálogo`, 'info');
      return prev.filter((t) => t.id !== typeId);
    });
  };

  // Toggle de Disponibilidad de SKU
  const toggleProductAvailability = (productId) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const nextState = prod.status === 'out_of_stock' ? 'active' : 'out_of_stock';
          showToast?.(
            `Producto ${prod.name}: ${nextState === 'active' ? 'Disponible' : 'Agotado'}`,
            'info'
          );
          return { ...prod, status: nextState };
        }
        return prod;
      })
    );
  };

  // Ajuste rápido de Stock
  const adjustStock = (productId, delta) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const newStock = Math.max(0, (prod.stock || 0) + delta);
          return {
            ...prod,
            stock: newStock,
            status: newStock === 0 ? 'out_of_stock' : 'active',
          };
        }
        return prod;
      })
    );
  };

  const pendingOrders = orders.filter((o) => o.status === 'NUEVA').length;
  const inPrepOrders = orders.filter((o) => o.status === 'EN_PICKING').length;
  const incidentOrders = orders.filter((o) => o.status === 'CON_INCIDENCIA').length;

  // Handlers para Despacho de Orden
  const openDispatchModal = (order) => {
    setSelectedOrderForDispatch(order);
    setDispatchModalOpen(true);
  };

  const closeDispatchModal = () => {
    setSelectedOrderForDispatch(null);
    setDispatchModalOpen(false);
  };

  const handleConfirmDispatch = (orderId, dispatchInfo) => {
    dispatchOrderGlobal(orderId, dispatchInfo);
    closeDispatchModal();
    showToast?.(`Orden despachada con éxito vía ${dispatchInfo.carrier}`, 'success');
  };

  // Handlers para Tallas (CRUD)
  const openCreateSizeModal = () => {
    setSelectedSizeForEdit(null);
    setSizeModalOpen(true);
  };
  const openSizeModal = openCreateSizeModal;

  const openEditSizeModal = (sizeGroup) => {
    setSelectedSizeForEdit(sizeGroup);
    setSizeModalOpen(true);
  };

  const closeSizeModal = () => {
    setSelectedSizeForEdit(null);
    setSizeModalOpen(false);
  };

  const saveSizeGroup = (sizeData) => {
    setSizesList((prev) => {
      const exists = prev.some((s) => s.id === sizeData.id);
      if (exists) {
        showToast?.(`Escala de tallas "${sizeData.name}" actualizada`, 'success');
        return prev.map((s) => (s.id === sizeData.id ? { ...s, ...sizeData } : s));
      }
      showToast?.(`Tipo de talla "${sizeData.name}" registrado con éxito`, 'success');
      return [sizeData, ...prev];
    });
  };

  const deleteSizeGroup = (sizeId) => {
    setSizesList((prev) => {
      const target = prev.find((s) => s.id === sizeId);
      const name = target ? target.name : 'la escala de tallas';
      showToast?.(`Escala de tallas "${name}" eliminada`, 'info');
      return prev.filter((s) => s.id !== sizeId);
    });
  };

  // Handlers para Colores (CRUD)
  const openCreateColorModal = () => {
    setSelectedColorForEdit(null);
    setColorModalOpen(true);
  };
  const openColorModal = openCreateColorModal;

  const openEditColorModal = (color) => {
    setSelectedColorForEdit(color);
    setColorModalOpen(true);
  };

  const closeColorModal = () => {
    setSelectedColorForEdit(null);
    setColorModalOpen(false);
  };

  const saveColor = (colorData) => {
    setColorsList((prev) => {
      const exists = prev.some((c) => c.id === colorData.id);
      if (exists) {
        showToast?.(`Color "${colorData.name}" actualizado con éxito`, 'success');
        return prev.map((c) => (c.id === colorData.id ? { ...c, ...colorData } : c));
      }
      showToast?.(`Color "${colorData.name}" agregado a la paleta`, 'success');
      return [colorData, ...prev];
    });
  };

  const deleteColor = (colorId) => {
    setColorsList((prev) => {
      const target = prev.find((c) => c.id === colorId);
      const name = target ? target.name : 'el color';
      showToast?.(`Color "${name}" eliminado de la paleta`, 'info');
      return prev.filter((c) => c.id !== colorId);
    });
  };

  // Handlers para Cupones y Promociones (CRUD)
  const openCreateCouponModal = () => {
    setSelectedCouponForEdit(null);
    setCouponModalOpen(true);
  };

  const openEditCouponModal = (coupon) => {
    setSelectedCouponForEdit(coupon);
    setCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setSelectedCouponForEdit(null);
    setCouponModalOpen(false);
  };

  return {
    activeMenu,
    setActiveMenu,
    storeOnline,
    setStoreOnline,
    selectedHub,
    setSelectedHub,
    isMinimized,
    setIsMinimized,
    searchTerm,
    setSearchTerm,
    orderStatusFilter,
    setOrderStatusFilter,
    orders,
    customers,
    branches,
    pendingOrders,
    inPrepOrders,
    incidentOrders,
    advanceOrderStatus,
    simulateIncomingOrder,
    toggleProductAvailability,
    adjustStock,

    // Modales y Drawers de Producto
    productModalOpen,
    selectedProductForEdit,
    openCreateProductModal,
    openEditProductModal,
    closeProductModal,
    saveProduct,
    deleteProduct,

    orderDrawerOpen,
    selectedOrder,
    openOrderDrawer,
    closeOrderDrawer,

    // Modal de Despacho
    dispatchModalOpen,
    selectedOrderForDispatch,
    openDispatchModal,
    closeDispatchModal,
    handleConfirmDispatch,

    // Sedes y Bodegas (Almacén Digital)
    branchModalOpen,
    selectedBranchForEdit,
    openBranchModal,
    openCreateBranchModal,
    openEditBranchModal,
    closeBranchModal,
    saveBranch,
    deleteBranch,

    notificationsOpen,
    setNotificationsOpen,
    customerNotifications,

    // Promociones / Cupones
    couponModalOpen,
    selectedCouponForEdit,
    setCouponModalOpen,
    openCreateCouponModal,
    openEditCouponModal,
    closeCouponModal,

    teamModalOpen,
    setTeamModalOpen,
    saveTeamMember,

    incidentModalOpen,
    selectedIncidentOrder,
    openIncidentModal,
    closeIncidentModal,
    handleReportIncident,

    // Marcas (CRUD Completo)
    brands,
    brandModalOpen,
    selectedBrandForEdit,
    openBrandModal,
    openCreateBrandModal,
    openEditBrandModal,
    closeBrandModal,
    saveBrand,
    deleteBrand,

    // Tipos y Categorías (CRUD Completo)
    garmentTypes,
    typeModalOpen,
    selectedTypeForEdit,
    openTypeModal,
    openCreateTypeModal,
    openEditTypeModal,
    closeTypeModal,
    saveGarmentType,
    deleteGarmentType,

    // Tallas y Colores (CRUD Completo)
    sizesList,
    sizeModalOpen,
    selectedSizeForEdit,
    openSizeModal,
    openCreateSizeModal,
    openEditSizeModal,
    closeSizeModal,
    saveSizeGroup,
    deleteSizeGroup,

    colorsList,
    colorModalOpen,
    selectedColorForEdit,
    openColorModal,
    openCreateColorModal,
    openEditColorModal,
    closeColorModal,
    saveColor,
    deleteColor,
  };
};

