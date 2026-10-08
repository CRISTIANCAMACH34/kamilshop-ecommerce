import React from 'react';
import { Store, RefreshCw, Bell, Eye, LogOut, Power, Menu } from 'lucide-react';
import { BusinessBranchSelector } from './BusinessBranchSelector';

/**
 * AdminHeader - Barra superior del portal de administración
 * 100% Responsive: hamburguesa en móvil, acciones secundarias ocultas en xs
 */
export function AdminHeader({
  storeName = "KAMIL SHOP",
  selectedHub,
  onSelectHub,
  storeOnline,
  onToggleStoreOnline,
  onSync,
  onOpenNotifications,
  onViewStore,
  onLogout,
  onMobileMenuToggle,
}) {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSyncClick = () => {
    setIsSyncing(true);
    onSync?.();
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  const branchList = [
    { id: 1, name: "Bodega Central Kamil Shop — Despacho Nacional" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5">

        {/* ── Botón hamburguesa solo en móvil (<lg) ── */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          title="Abrir menú"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={17} />
        </button>

        {/* ── Identidad del negocio ── */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="hidden sm:grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-sm ring-1 ring-white/10">
            <Store size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 leading-none">
              PORTAL NEGOCIO • KAMIL SHOP
            </p>
            <h1 className="truncate text-sm sm:text-base font-black text-slate-900 leading-tight mt-0.5 max-w-[140px] sm:max-w-xs">
              {storeName}
            </h1>
          </div>
        </div>

        {/* ── Acciones (derecha) ── */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* Selector de Sede — oculto en xs */}
          <div className="hidden md:block">
            <BusinessBranchSelector
              branches={branchList}
              value={selectedHub}
              onChange={onSelectHub}
            />
          </div>

          {/* Toggle Tienda Abierta */}
          <button
            type="button"
            onClick={onToggleStoreOnline}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all shadow-sm ${
              storeOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Power size={13} className={storeOnline ? 'text-emerald-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">{storeOnline ? 'Abierta' : 'Pausada'}</span>
          </button>

          {/* Actualizar — oculto en xs */}
          <button
            type="button"
            onClick={handleSyncClick}
            className="hidden sm:inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            title="Sincronizar datos"
          >
            <RefreshCw size={14} className={`text-slate-500 ${isSyncing ? 'animate-spin text-slate-900' : ''}`} />
            <span className="hidden lg:inline">{isSyncing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>

          {/* Notificaciones */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            title="Alertas y notificaciones"
          >
            <Bell size={15} />
            <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm">
              5
            </span>
          </button>

          {/* Ver Tienda — oculto en xs */}
          <button
            type="button"
            onClick={onViewStore}
            className="hidden sm:inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            title="Ver la tienda web para clientes"
          >
            <Eye size={14} />
            <span className="hidden md:inline">Ver Tienda</span>
          </button>

          {/* Salir */}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            title="Cerrar Sesión"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
