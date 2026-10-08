import React from 'react';
import {
  Home,
  ClipboardList,
  Truck,
  Package,
  Layers,
  Award,
  Sliders,
  Store as StoreIcon,
  Users,
  Boxes,
  ShoppingCart,
  Heart,
  Tag,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  X,
} from 'lucide-react';
import { TituloLogo } from './TituloLogo';

/**
 * AdminSidebar - Barra lateral de navegación 100% adaptada a E-Commerce
 * Responsive: sidebar fijo en desktop, drawer overlay en móvil/tablet (<1024px)
 */
export function AdminSidebar({
  activeMenu,
  onSelectMenu,
  isMinimized,
  onToggleMinimize,
  pendingBadgeCount = 0,
  mobileOpen = false,
  onMobileClose,
}) {
  const menuGroups = [
    {
      title: 'OPERACIÓN',
      items: [
        { id: 'resumen', label: 'Resumen', icon: Home },
        { id: 'orders', label: 'Órdenes', icon: ClipboardList, badge: pendingBadgeCount },
        { id: 'delivery', label: 'Despachos y Envíos', icon: Truck },
        { id: 'returns', label: 'Cambios y Garantías', icon: RotateCcw },
      ],
    },
    {
      title: 'CATÁLOGO',
      items: [
        { id: 'menu', label: 'Catálogo de Ropa', icon: Package },
        { id: 'brands', label: 'Marcas de Moda', icon: Award },
        { id: 'types', label: 'Tipos y Categorías', icon: Layers },
        { id: 'additions', label: 'Tallas y Opciones', icon: Sliders },
      ],
    },
    {
      title: 'OPERACIÓN DIGITAL',
      items: [
        { id: 'stores', label: 'Almacén Digital', icon: StoreIcon },
        // { id: 'team', label: 'Equipo & Staff', icon: Users }, // Oculto a petición del usuario; disponible para reactivación futura
      ],
    },
    {
      title: 'INVENTARIO',
      items: [
        { id: 'inventory', label: 'Inventario', icon: Boxes },
      ],
    },
    {
      title: 'ABASTECIMIENTO',
      items: [
        { id: 'purchases', label: 'Abastecimiento', icon: ShoppingCart },
      ],
    },
    {
      title: 'CLIENTES',
      items: [
        { id: 'crm', label: 'Clientes CRM', icon: Heart },
        { id: 'promotions', label: 'Promociones', icon: Tag },
      ],
    },
    {
      title: 'FINANZAS',
      items: [
        { id: 'analytics', label: 'Resultados y Métricas', icon: BarChart3 },
      ],
    },
  ];

  const handleSelectMenu = (id) => {
    onSelectMenu(id);
    // En móvil, cerrar el drawer al seleccionar una opción
    if (onMobileClose) onMobileClose();
  };

  const sidebarContent = (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 h-full ${
        isMinimized ? 'w-20' : 'w-64'
      }`}
    >
      {/* Encabezado */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
        {isMinimized ? (
          <TituloLogo size="xs" subtitle="" />
        ) : (
          <TituloLogo size="sm" subtitle="" />
        )}
        {/* Botón cerrar en móvil */}
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden ml-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!isMinimized && (
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMenu(item.id)}
                    title={item.label}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-slate-500 group-hover:text-slate-700'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    {!isMinimized && <span className="truncate">{item.label}</span>}
                    {!isMinimized && item.badge ? (
                      <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pie: Minimizar (solo en desktop) */}
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onToggleMinimize}
          className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl p-2 text-xs font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          title={isMinimized ? 'Expandir barra' : 'Minimizar barra'}
        >
          {isMinimized ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!isMinimized && <span>Minimizar Menú</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── DESKTOP: sidebar fijo ─────────────────────────────────── */}
      <div
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col transition-all duration-200 ${
          isMinimized ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </div>

      {/* ── MÓVIL: overlay oscuro + sidebar drawer ────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[1000] flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay oscuro — clic fuera cierra */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer lateral */}
          <div className="relative z-10 flex flex-col w-72 max-w-[85vw] animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
