import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductsProvider, useProducts } from './context/ProductsContext';
import { PromotionsProvider } from './context/PromotionsContext';
import { OrdersProvider, useOrders } from './context/OrdersContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { HeroStatue } from './components/HeroStatue';
import { InfinitePasarela } from './components/InfinitePasarela';
import { ApparelCatalog } from './components/ApparelCatalog';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { LazyViewport } from './components/LazyViewport';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { initNativeFeatures } from './services/nativeBridge';
import { soundEngine } from './services/audio';

// Lazy loading diferido para componentes secundarios y portal administrativo
const AdminPortalDashboard = React.lazy(() =>
  import('./components/admin_portal/AdminPortalDashboard').then(m => ({ default: m.AdminPortalDashboard }))
);
const ProductDetailWindow = React.lazy(() =>
  import('./components/ProductDetailWindow').then(m => ({ default: m.ProductDetailWindow }))
);
const CheckoutModal = React.lazy(() =>
  import('./components/CheckoutModal').then(m => ({ default: m.CheckoutModal }))
);
const AdminModal = React.lazy(() =>
  import('./components/AdminModal').then(m => ({ default: m.AdminModal }))
);
const CustomerAuthModal = React.lazy(() =>
  import('./components/CustomerAuthModal').then(m => ({ default: m.CustomerAuthModal }))
);
const AdminLoginModal = React.lazy(() =>
  import('./components/AdminLoginModal').then(m => ({ default: m.AdminLoginModal }))
);
const RunwayModal = React.lazy(() =>
  import('./components/RunwayModal').then(m => ({ default: m.RunwayModal }))
);
const OrderTrackingModal = React.lazy(() =>
  import('./components/OrderTrackingModal').then(m => ({ default: m.OrderTrackingModal }))
);
const CustomerAccountDrawer = React.lazy(() =>
  import('./components/CustomerAccountDrawer').then(m => ({ default: m.CustomerAccountDrawer }))
);
const StoreInfoModal = React.lazy(() =>
  import('./components/StoreInfoModal').then(m => ({ default: m.StoreInfoModal }))
);
const WishlistModal = React.lazy(() =>
  import('./components/WishlistModal').then(m => ({ default: m.WishlistModal }))
);
const SizeGuideModal = React.lazy(() =>
  import('./components/SizeGuideModal').then(m => ({ default: m.SizeGuideModal }))
);

const ToastNotification = () => {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className={`titulo-toast show ${toast.type}`}>
      {toast.message}
    </div>
  );
};

const MainContent = () => {
  const { viewMode, isAdmin, setIsAdminAuthOpen, isAdminAuthOpen, isCustomerAuthOpen } = useAuth();
  const { isTrackingModalOpen, activeTrackingCode, closeTracking, openTracking } = useOrders();
  const { quickViewProduct, setQuickViewProduct, isAdminModalOpen } = useProducts();
  const { isCheckoutOpen, isWishlistOpen, isSizeGuideOpen } = useCart();

  // Estados de modales de la tienda pública
  const [isRunwayOpen, setIsRunwayOpen] = useState(false);
  const [isCustomerAccountOpen, setIsCustomerAccountOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState('tallas');

  useEffect(() => {
    initNativeFeatures();
    soundEngine.init();

    // Acceso administrativo secreto (sin botones públicos para clientes)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminAuthOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (window.location.hash === '#admin-login' || window.location.hash === '#admin') {
      setIsAdminAuthOpen(true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsAdminAuthOpen]);

  const handleOpenInfoModal = (tabKey) => {
    setInfoModalTab(tabKey || 'tallas');
    setIsInfoModalOpen(true);
  };

  // Si el usuario es administrador y está en modo dashboard, renderizar el portal administrativo de TITULO
  if (viewMode === 'admin_dashboard' && isAdmin) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">Iniciando Portal Administrativo...</div>}>
        <AdminPortalDashboard />
        {isAdminModalOpen && <AdminModal />}
        <ToastNotification />
      </React.Suspense>
    );
  }

  // Si el cliente seleccionó una prenda para ver su detalle, mostrar la VENTANA DE PRODUCTO (no un modal)
  if (quickViewProduct) {
    return (
      <div className="app-container">
        <Header
          onOpenCustomerAccount={() => setIsCustomerAccountOpen(true)}
          onOpenTracking={() => openTracking()}
        />

        <main>
          <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-white/50 font-mono">Cargando prenda...</div>}>
            <ProductDetailWindow
              product={quickViewProduct}
              onBack={() => setQuickViewProduct(null)}
            />
          </React.Suspense>
        </main>

        <Footer onOpenInfoModal={handleOpenInfoModal} />

        {/* Componentes modales y overlays de la tienda */}
        <CartDrawer />
        <React.Suspense fallback={null}>
          {isCheckoutOpen && <CheckoutModal />}
          {isCustomerAuthOpen && <CustomerAuthModal />}
          {isAdminAuthOpen && <AdminLoginModal />}
          {isWishlistOpen && <WishlistModal />}
          {isSizeGuideOpen && <SizeGuideModal />}
          {isCustomerAccountOpen && (
            <CustomerAccountDrawer
              open={isCustomerAccountOpen}
              onClose={() => setIsCustomerAccountOpen(false)}
            />
          )}
          {isTrackingModalOpen && (
            <OrderTrackingModal
              open={isTrackingModalOpen}
              code={activeTrackingCode}
              onClose={closeTracking}
            />
          )}
          {isInfoModalOpen && (
            <StoreInfoModal
              open={isInfoModalOpen}
              initialTab={infoModalTab}
              onClose={() => setIsInfoModalOpen(false)}
            />
          )}
        </React.Suspense>
        <ToastNotification />
      </div>
    );
  }

  // Vista Tienda Pública / Cliente
  return (
    <div className="app-container">
      <Header
        onOpenCustomerAccount={() => setIsCustomerAccountOpen(true)}
        onOpenTracking={() => openTracking()}
      />

      <main>
        <HeroStatue onOpenRunway={() => setIsRunwayOpen(true)} />
        <LazyViewport minHeight="300px" rootMargin="350px 0px">
          <InfinitePasarela />
        </LazyViewport>
        <LazyViewport minHeight="600px" rootMargin="450px 0px" keepMounted={true}>
          <ApparelCatalog />
        </LazyViewport>
      </main>

      <LazyViewport minHeight="250px" rootMargin="350px 0px">
        <Footer onOpenInfoModal={handleOpenInfoModal} />
      </LazyViewport>

      {/* Carrito de compra principal (ligero) */}
      <CartDrawer />

      {/* Modales y utilidades cargados bajo demanda / diferidos */}
      <React.Suspense fallback={null}>
        {isCheckoutOpen && <CheckoutModal />}
        {isAdminModalOpen && <AdminModal />}
        {isCustomerAuthOpen && <CustomerAuthModal />}
        {isAdminAuthOpen && <AdminLoginModal />}
        {isRunwayOpen && <RunwayModal open={isRunwayOpen} onClose={() => setIsRunwayOpen(false)} />}
        {isTrackingModalOpen && (
          <OrderTrackingModal
            open={isTrackingModalOpen}
            code={activeTrackingCode}
            onClose={closeTracking}
          />
        )}
        {isCustomerAccountOpen && (
          <CustomerAccountDrawer
            open={isCustomerAccountOpen}
            onClose={() => setIsCustomerAccountOpen(false)}
          />
        )}
        {isInfoModalOpen && (
          <StoreInfoModal
            open={isInfoModalOpen}
            initialTab={infoModalTab}
            onClose={() => setIsInfoModalOpen(false)}
          />
        )}
        {isWishlistOpen && <WishlistModal />}
        {isSizeGuideOpen && <SizeGuideModal />}
      </React.Suspense>
      <PwaInstallPrompt />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <PromotionsProvider>
          <OrdersProvider>
            <CartProvider>
              <MainContent />
            </CartProvider>
          </OrdersProvider>
        </PromotionsProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
