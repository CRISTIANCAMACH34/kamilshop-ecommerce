import React, { useState } from 'react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  FileSpreadsheet,
  History,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminHelpBadge } from './AdminHelpBadge';
import { useCart } from '../../context/CartContext';
import { formatThousands, formatUSD, formatCOP } from '../../services/currencyService';

const STORAGE_KEY_KARDEX = 'kamil_shop_kardex_v1';

const DEFAULT_KARDEX = [
  {
    id: 'kdx-01',
    date: '2026-09-28T10:00:00Z',
    productName: 'Lote Prendas Importación EE.UU.',
    size: 'Todas',
    type: 'IN',
    qty: 50,
    reason: 'Ingreso inicial a Bodega Central Kamil Shop (Lote Miami)',
    prevStock: 0,
    newStock: 50,
    responsible: 'Bodega Central Kamil Shop',
  }
];

/**
 * AdminInventoryView - Control de Inventario y Kardex Ultra-Sencillo
 */
export function AdminInventoryView({
  products = [],
  brands = [],
  garmentTypes = [],
  colorsList = [],
  onAdjustStock,
  onOpenEditProduct,
  onDeleteProduct,
}) {
  const { showToast } = useCart();
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'kardex'
  const [kardexList, setKardexList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KARDEX);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_KARDEX;
  });
  const [activeCategoryTab, setActiveCategoryTab] = useState('todas'); // 'todas' | 'hoodies' | 'camisetas' | 'pantalones' | 'calzado' | 'chaquetas' | 'accesorios'
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('TODAS');
  const [selectedType, setSelectedType] = useState('TODOS');
  const [selectedGender, setSelectedGender] = useState('TODOS');
  const [selectedColor, setSelectedColor] = useState('TODOS');
  const [productToDelete, setProductToDelete] = useState(null);

  // Categorías estándar para organización de inventario
  const CATEGORY_TABS = [
    { id: 'todas', label: 'Todas las Prendas' },
    { id: 'hoodies', label: 'Hoodies & Buzos' },
    { id: 'camisetas', label: 'Camisetas & Tops' },
    { id: 'pantalones', label: 'Pantalones & Jeans' },
    { id: 'calzado', label: 'Zapatillas & Sneakers' },
    { id: 'chaquetas', label: 'Chaquetas & Blazers' },
    { id: 'accesorios', label: 'Accesorios & Gorras' },
  ];

  // Normalizador de categoría
  const normalizeCategory = (cat) => {
    if (!cat) return 'camisetas';
    const c = cat.toLowerCase();
    if (c.includes('hoodie') || c.includes('buzo') || c.includes('sweater')) return 'hoodies';
    if (c.includes('camiseta') || c.includes('tee') || c.includes('top')) return 'camisetas';
    if (c.includes('pantal') || c.includes('jean') || c.includes('cargo') || c.includes('trouser')) return 'pantalones';
    if (c.includes('calzado') || c.includes('zapatilla') || c.includes('sneaker')) return 'calzado';
    if (c.includes('chaqueta') || c.includes('blazer') || c.includes('abrigo') || c.includes('outerwear')) return 'chaquetas';
    if (c.includes('accesorio') || c.includes('gorra') || c.includes('bolso') || c.includes('cap')) return 'accesorios';
    return c;
  };

  // Filtrado de prendas
  const filteredProducts = products.filter((p) => {
    const pCatNormalized = normalizeCategory(p.garmentType || p.category || '');
    if (activeCategoryTab !== 'todas' && pCatNormalized !== activeCategoryTab) {
      return false;
    }
    if (selectedBrand !== 'TODAS') {
      const bName = (p.brand || '').toLowerCase();
      if (!bName.includes(selectedBrand.toLowerCase())) return false;
    }
    if (selectedType !== 'TODOS') {
      const pCat = (p.garmentType || p.category || '').toLowerCase();
      if (!pCat.includes(selectedType.toLowerCase())) return false;
    }
    if (selectedGender !== 'TODOS') {
      const g = (p.gender || 'unisex').toLowerCase();
      if (selectedGender.toLowerCase() === 'unisex' && g !== 'unisex') return false;
      if (selectedGender.toLowerCase() === 'masculino' && g !== 'masculino' && g !== 'hombre') return false;
      if (selectedGender.toLowerCase() === 'femenino' && g !== 'femenino' && g !== 'mujer') return false;
    }
    if (selectedColor !== 'TODOS') {
      const c = (p.colorName || '').toLowerCase();
      if (!c.includes(selectedColor.toLowerCase())) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + (Number(p.cost || p.price * 0.45 || 40) * (p.stock || 0)), 0);
  const lowStockCount = products.filter(p => (p.stock || 0) <= 5).length;

  // Exportar Excel (CSV)
  const handleExportCSV = () => {
    const headers = ['Prenda', 'SKU', 'Marca', 'Categoría', 'Género', 'Color', 'Stock Actual', 'Costo Unitario ($)', 'Precio Venta ($)', 'Valor Total Stock ($)'];
    const rows = filteredProducts.map((p) => {
      const cost = Number(p.cost || p.price * 0.45 || 40);
      const price = Number(p.price || 95);
      const stock = Number(p.stock || 0);
      return [
        `"${p.name}"`,
        p.sku || `TTL-00${p.id}`,
        `"${p.brand || 'Kamil Shop'}"`,
        `"${p.garmentType || p.category || 'Prendas'}"`,
        p.gender || 'Unisex',
        `"${p.colorName || 'Neutro'}"`,
        stock,
        cost.toFixed(2),
        price.toFixed(2),
        (cost * stock).toFixed(2),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_kamil_shop_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Inventario exportado a Excel (CSV) con éxito', 'info');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Control de Existencias • KAMIL SHOP
            </p>
            <AdminHelpBadge
              title="¿Para qué es el Inventario?"
              text="Aquí ves cuántas prendas te quedan en bodega. Cuando haces una venta o llega nueva ropa, aquí se actualiza todo para que nunca vendas lo que no tienes."
            />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Inventario & Kardex ({filteredProducts.length} prendas)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Pestañas de Vista */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'stock' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Existencias por Prenda
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kardex')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'kardex' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History size={13} />
              <span>Movimientos (Kardex)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards Explicadas y Responsivas */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Unidades</span>
            <AdminHelpBadge text="Es la suma total de todas las prendas que tienes físicamente guardadas en bodega." />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{formatThousands(totalUnits)}</p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 font-medium truncate">Prendas en estanterías</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Valor en Bodega</span>
            <AdminHelpBadge text="Cuánto dinero tienes invertido en la ropa que está en bodega a precio de costo de fábrica." />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{formatUSD(totalValue)}</p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-600 font-bold truncate">≈ {formatCOP(totalValue)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Agotados</span>
            <AdminHelpBadge text="Prendas que tienen 5 o menos unidades. Te avisa para que mandes a confeccionar más antes de que se acaben." />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-rose-600">{formatThousands(lowStockCount)}</p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 font-medium truncate">Prendas stock bajo</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Bodega Central</span>
            <AdminHelpBadge text="El centro principal de distribución desde donde se empacan y despachan los pedidos nacionales." />
          </div>
          <p className="mt-1 text-sm sm:text-base font-black text-slate-900 truncate">Kamil Shop Fulfillment</p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-600 font-bold">100% Operativa • Envíos Colombia</p>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* Navegación por Categorías de Prenda */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORY_TABS.map((tab) => {
                const count = tab.id === 'todas'
                  ? products.length
                  : products.filter(p => normalizeCategory(p.garmentType || p.category || '') === tab.id).length;
                const units = tab.id === 'todas'
                  ? totalUnits
                  : products.filter(p => normalizeCategory(p.garmentType || p.category || '') === tab.id).reduce((s, p) => s + (p.stock || 0), 0);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategoryTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      activeCategoryTab === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] ${
                      activeCategoryTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count} ({formatThousands(units)})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Alternador de Modo de Visualización */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Ver organizado en bloques por categoría"
              >
                Por Categorías
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Ver tabla continua tradicional"
              >
                Tabla Continua
              </button>
            </div>
          </div>

          {/* Filtros Sencillos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="grid gap-3 sm:grid-cols-5">
              <div className="relative sm:col-span-2">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar prenda por nombre o código SKU..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="TODAS">Todas las Marcas</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="TODOS">Todos los Tipos</option>
                  {garmentTypes.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="TODOS">Cualquier Género</option>
                  <option value="unisex">Unisex</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Renderizado de Inventario: Modo Agrupado o Tabla Continua */}
          {viewMode === 'grouped' && activeCategoryTab === 'todas' ? (
            <div className="space-y-6">
              {CATEGORY_TABS.filter(t => t.id !== 'todas').map(catTab => {
                const catProducts = filteredProducts.filter(p => normalizeCategory(p.garmentType || p.category || '') === catTab.id);
                if (catProducts.length === 0) return null;

                const catUnits = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
                const catValue = catProducts.reduce((sum, p) => sum + (Number(p.cost || p.price * 0.45 || 40) * (p.stock || 0)), 0);

                return (
                  <div key={catTab.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {/* Header de la Categoría */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-white">
                          <Boxes size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900">{catTab.label}</h3>
                          <p className="text-[10px] font-mono text-slate-400">
                            {catProducts.length} referencias en stock • {formatThousands(catUnits)} unidades totales
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          Valor: {formatUSD(catValue)} (≈ {formatCOP(catValue)})
                        </span>
                      </div>
                    </div>

                    {/* Tabla de Productos de esta Categoría */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="px-5 py-3">Prenda & Referencia</th>
                            <th className="px-4 py-3">Marca</th>
                            <th className="px-4 py-3">Color</th>
                            <th className="px-4 py-3">Desglose de Tallas US</th>
                            <th className="px-4 py-3 text-center">Stock Total</th>
                            <th className="px-4 py-3 text-right">Ajuste (+/-)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {catProducts.map((p) => {
                            const sizeStockEntries = p.size_stock ? Object.entries(p.size_stock) : [];
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/60 transition">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    {p.image ? (
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                        <ImageIcon size={16} />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-black text-slate-900">{p.name}</p>
                                      <p className="font-mono text-[10px] text-slate-400">{p.sku || `TTL-00${p.id}`}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3 font-bold text-slate-800">
                                  {p.brand || 'Kamil Shop'}
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-3.5 w-3.5 rounded-full border border-slate-300"
                                      style={{ backgroundColor: p.colorHex || p.color_hex || '#0a0a0a' }}
                                    />
                                    <span className="font-medium text-slate-700">{p.colorName || p.color_name || 'Estándar'}</span>
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  {sizeStockEntries.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      {sizeStockEntries.map(([sz, qty]) => (
                                        <span
                                          key={sz}
                                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                                            Number(qty) <= 0
                                              ? 'bg-rose-50 text-rose-500 border-rose-200 line-through'
                                              : 'bg-slate-100 text-slate-700 border-slate-200 font-bold'
                                          }`}
                                        >
                                          {sz}: {formatThousands(qty)}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {(p.sizes || []).join(', ') || 'Talla Única'}
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`inline-block font-mono font-black text-xs px-2.5 py-0.5 rounded-full ${
                                      (p.stock || 0) <= 3
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : (p.stock || 0) <= 8
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                    }`}
                                  >
                                    {formatThousands(p.stock || 0)} un
                                  </span>
                                </td>

                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => onAdjustStock?.(p.id, -1)}
                                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                                      title="Restar 1 unidad"
                                    >
                                      <Minus size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onAdjustStock?.(p.id, 1)}
                                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-slate-900 text-white hover:bg-black cursor-pointer shadow-xs"
                                      title="Sumar 1 unidad"
                                    >
                                      <Plus size={13} />
                                    </button>
                                    {onOpenEditProduct && (
                                      <button
                                        type="button"
                                        onClick={() => onOpenEditProduct(p)}
                                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                                        title={`Editar ${p.name}`}
                                      >
                                        <Edit size={13} />
                                      </button>
                                    )}
                                    {onDeleteProduct && (
                                      <button
                                        type="button"
                                        onClick={() => setProductToDelete(p)}
                                        className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                        title={`Eliminar ${p.name}`}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Vista de Tabla Continua Tradicional */
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">Prenda & SKU</th>
                      <th className="px-4 py-3.5">Marca</th>
                      <th className="px-4 py-3.5">Tipo / Categoría</th>
                      <th className="px-4 py-3.5">Desglose Tallas US</th>
                      <th className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <span>Stock Disponible</span>
                          <AdminHelpBadge text="Cantidad de prendas listas para vender." />
                        </div>
                      </th>
                      <th className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <span>Ajustar Stock (+/-)</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs font-semibold text-slate-400">
                          No se encontraron prendas con los filtros seleccionados
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const sizeStockEntries = p.size_stock ? Object.entries(p.size_stock) : [];
                        return (
                          <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                    <ImageIcon size={16} />
                                  </div>
                                )}
                                <div>
                                  <p className="font-black text-slate-900">{p.name}</p>
                                  <p className="font-mono text-[11px] text-slate-400">{p.sku || `TTL-00${p.id}`}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 font-bold text-slate-800">
                              {p.brand || 'Kamil Shop'}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                {p.garmentType || p.category || 'Prendas'}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              {sizeStockEntries.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {sizeStockEntries.map(([sz, qty]) => (
                                    <span
                                      key={sz}
                                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                                        Number(qty) <= 0
                                          ? 'bg-rose-50 text-rose-500 border-rose-200 line-through'
                                          : 'bg-slate-100 text-slate-700 border-slate-200 font-bold'
                                      }`}
                                    >
                                      {sz}: {formatThousands(qty)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400">
                                  {(p.sizes || []).join(', ') || 'Talla Única'}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`inline-block font-mono font-black text-xs px-2.5 py-0.5 rounded-full ${
                                  (p.stock || 0) <= 3
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : (p.stock || 0) <= 8
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                }`}
                              >
                                {formatThousands(p.stock ?? 20)} un
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onAdjustStock?.(p.id, -1)}
                                  className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  title="Restar 1 unidad"
                                >
                                  <Minus size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onAdjustStock?.(p.id, 1)}
                                  className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-slate-900 text-white hover:bg-black cursor-pointer shadow-xs"
                                  title="Sumar 1 unidad"
                                >
                                  <Plus size={13} />
                                </button>
                                {onOpenEditProduct && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenEditProduct(p)}
                                    className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    title={`Editar ${p.name}`}
                                  >
                                    <Edit size={13} />
                                  </button>
                                )}
                                {onDeleteProduct && (
                                  <button
                                    type="button"
                                    onClick={() => setProductToDelete(p)}
                                    className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                    title={`Eliminar ${p.name}`}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Vista de Kardex y Movimientos */
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Historial de Entradas y Salidas (Kardex)</h3>
              <p className="text-xs text-slate-500">
                Registro transparente de por qué sube o baja el stock de cada prenda.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-400">
                  <th className="px-5 py-3.5">Fecha & Hora</th>
                  <th className="px-4 py-3.5">Prenda & Talla</th>
                  <th className="px-4 py-3.5 text-center">Tipo de Movimiento</th>
                  <th className="px-4 py-3.5">Motivo de la Entrada o Salida</th>
                  <th className="px-4 py-3.5 text-center">Saldo Anterior → Nuevo</th>
                  <th className="px-4 py-3.5">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kardexList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 text-slate-500 font-mono">
                      {new Date(k.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-black text-slate-900">{k.productName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Talla: {k.size}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {k.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-800 border border-emerald-200">
                          <TrendingUp size={12} />
                          <span>+ {k.qty} Entraron</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-black text-rose-800 border border-rose-200">
                          <TrendingDown size={12} />
                          <span>- {k.qty} Salieron</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {k.reason}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                      {k.prevStock} un → <span className="font-black text-slate-950">{k.newStock} un</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {k.responsible}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    
      {/* Modal Confirmación Borrar Prenda */}
      <ConfirmDeleteModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            onDeleteProduct?.(productToDelete);
            setProductToDelete(null);
          }
        }}
        title="¿Estás seguro de eliminar esta prenda?"
        itemName={productToDelete?.name}
        description="Esta acción eliminará permanentemente la prenda y sus variantes de tu catálogo de Kamil Shop."
      />

    </div>
  );
}
