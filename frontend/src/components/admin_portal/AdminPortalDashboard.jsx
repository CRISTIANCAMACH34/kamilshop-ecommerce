import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import { useAdminPortal } from './useAdminPortal';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

// Vistas Especializadas (100% Adaptadas a E-Commerce)
import { AdminResumenView } from './AdminResumenView';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminShippingView } from './AdminShippingView';
import { AdminCatalogView } from './AdminCatalogView';
import { AdminBrandsView } from './AdminBrandsView';
import { AdminTypesView } from './AdminTypesView';
import { AdminVariantsView } from './AdminVariantsView';
import { AdminStoresView } from './AdminStoresView';
import { AdminInventoryView } from './AdminInventoryView';
import { AdminPurchasesView } from './AdminPurchasesView';
import { AdminTeamView } from './AdminTeamView';
import { AdminCrmView } from './AdminCrmView';
import { AdminReturnsView } from './AdminReturnsView';
import { AdminPromotionsView } from './AdminPromotionsView';
import { AdminAnalyticsView } from './AdminAnalyticsView';

// Modales Especializados (Centrados)
import { ProductFormModal } from './ProductFormModal';
import { BrandFormModal } from './BrandFormModal';
import { TypeFormModal } from './TypeFormModal';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { OrderDispatchModal } from './OrderDispatchModal';
import { SizeFormModal } from './SizeFormModal';
import { ColorFormModal } from './ColorFormModal';
import { BranchFormModal } from './BranchFormModal';
import { AdminNotificationsDrawer } from './AdminNotificationsDrawer';
import { CouponFormModal } from './CouponFormModal';
import { TeamMemberModal } from './TeamMemberModal';
import { OrderIncidentModal } from './OrderIncidentModal';

/**
 * AdminPortalDashboard - Shell orquestador del Portal de Negocio (SOLID & DRY)
 * 100% adaptado al modelo de negocio de KAMIL SHOP
 */
export const AdminPortalDashboard = () => {
  const { logout, setViewMode } = useAuth();
  const { products } = useProducts();
  const { showToast } = useCart();

  // Estado del drawer sidebar en móvil (<1024px)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.documentElement.style.backgroundColor = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#0f172a';
    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.color = prevColor;
    };
  }, []);

  const {
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
    pendingOrders,
    inPrepOrders,
    incidentOrders,
    advanceOrderStatus,
    simulateIncomingOrder,
    toggleProductAvailability,
    adjustStock,

    // Modales
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

    // Despacho
    dispatchModalOpen,
    selectedOrderForDispatch,
    openDispatchModal,
    closeDispatchModal,
    handleConfirmDispatch,

    // Sedes y Bodegas (Almacén Digital)
    branches,
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
  } = useAdminPortal();

  // Router de vistas según el principio Open/Closed
  const renderCurrentView = () => {
    switch (activeMenu) {
      case 'resumen':
        return (
          <AdminResumenView
            products={products}
            orders={orders}
            pendingOrders={pendingOrders}
            inPrepOrders={inPrepOrders}
            incidentOrders={incidentOrders}
            onAddProduct={openCreateProductModal}
            onNavigateOrders={(filter) => {
              if (filter) setOrderStatusFilter(filter);
              setActiveMenu('orders');
            }}
            onNavigateStores={() => setActiveMenu('stores')}
            onNavigateMenu={() => setActiveMenu('menu')}
            onNavigateAnalytics={() => setActiveMenu('analytics')}
          />
        );
      case 'orders':
        return (
          <AdminOrdersView
            orders={orders}
            onAdvanceOrderStatus={advanceOrderStatus}
            onOpenDispatch={openDispatchModal}
            onSimulateOrder={simulateIncomingOrder}
            onViewOrder={openOrderDrawer}
            onReportIncident={openIncidentModal}
          />
        );
      case 'delivery':
        return (
          <AdminShippingView
            orders={orders}
            onOpenDispatch={openDispatchModal}
            onViewOrder={openOrderDrawer}
            products={products}
          />
        );
      case 'returns':
        return <AdminReturnsView orders={orders} />;
      case 'menu':
        return (
          <AdminCatalogView
            products={products}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenCreateProduct={openCreateProductModal}
            onOpenEditProduct={openEditProductModal}
            onDeleteProduct={deleteProduct}
            onToggleAvailability={toggleProductAvailability}
            onStockAdjust={adjustStock}
          />
        );
      case 'brands':
        return (
          <AdminBrandsView
            brands={brands}
            onOpenAddBrand={openCreateBrandModal}
            onEditBrand={openEditBrandModal}
            onDeleteBrand={deleteBrand}
          />
        );
      case 'types':
        return (
          <AdminTypesView
            types={garmentTypes}
            onOpenAddType={openCreateTypeModal}
            onEditType={openEditTypeModal}
            onDeleteType={deleteGarmentType}
          />
        );
      case 'additions':
        return (
          <AdminVariantsView
            sizesList={sizesList}
            colorsList={colorsList}
            onOpenAddSize={openCreateSizeModal}
            onOpenAddColor={openCreateColorModal}
            onEditSize={openEditSizeModal}
            onDeleteSize={deleteSizeGroup}
            onEditColor={openEditColorModal}
            onDeleteColor={deleteColor}
          />
        );
      case 'stores':
        return (
          <AdminStoresView
            stores={branches}
            onOpenAddBranch={openCreateBranchModal}
            onEditBranch={openEditBranchModal}
            onDeleteBranch={deleteBranch}
          />
        );
      case 'inventory':
        return (
          <AdminInventoryView
            products={products}
            brands={brands}
            garmentTypes={garmentTypes}
            colorsList={colorsList}
            onAdjustStock={adjustStock}
            onOpenEditProduct={openEditProductModal}
            onDeleteProduct={deleteProduct}
          />
        );
      case 'purchases':
        return <AdminPurchasesView />;
      case 'crm':
        return (
          <AdminCrmView
            customers={customers}
            orders={orders}
            onViewOrder={openOrderDrawer}
            onOpenDispatch={openDispatchModal}
          />
        );
      case 'team':
        return (
          <AdminTeamView
            customers={customers}
            onOpenAddMember={() => setTeamModalOpen(true)}
          />
        );
      case 'promotions':
        return (
          <AdminPromotionsView
            onOpenCreateCoupon={openCreateCouponModal}
            onEditCoupon={openEditCouponModal}
          />
        );
      case 'analytics':
        return <AdminAnalyticsView />;
      default:
        return (
          <AdminResumenView
            products={products}
            orders={orders}
            pendingOrders={pendingOrders}
            inPrepOrders={inPrepOrders}
            incidentOrders={incidentOrders}
            onAddProduct={openCreateProductModal}
            onNavigateOrders={(filter) => {
              if (filter) setOrderStatusFilter(filter);
              setActiveMenu('orders');
            }}
            onNavigateStores={() => setActiveMenu('stores')}
            onNavigateMenu={() => setActiveMenu('menu')}
            onNavigateAnalytics={() => setActiveMenu('analytics')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans">
      {/* 1. Barra Lateral Oficial */}
      <AdminSidebar
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        pendingBadgeCount={pendingOrders + inPrepOrders}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Área de Contenido Principal y Header */}
      <div
        className={`min-h-screen transition-all duration-200 ${
          isMinimized ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AdminHeader
          storeName="KAMIL SHOP"
          selectedHub={selectedHub}
          onSelectHub={setSelectedHub}
          storeOnline={storeOnline}
          onToggleStoreOnline={() => setStoreOnline(!storeOnline)}
          onSync={() => {
            showToast?.('Datos y catálogos sincronizados en tiempo real', 'info');
          }}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onViewStore={() => setViewMode('store')}
          onLogout={logout}
          onMobileMenuToggle={() => setMobileSidebarOpen(true)}
        />

        {/* 3. Contenedor de la Vista Activa */}
        <main className="mx-auto max-w-[1440px]">
          {renderCurrentView()}
        </main>
      </div>

      {/* 4. Modales y Drawers Operacionales (Todos Centrados) */}
      <ProductFormModal
        open={productModalOpen}
        product={selectedProductForEdit}
        allProducts={products}
        brands={brands}
        garmentTypes={garmentTypes}
        sizesList={sizesList}
        colorsList={colorsList}
        onClose={closeProductModal}
        onSave={saveProduct}
        onDelete={deleteProduct}
      />

      <BrandFormModal
        open={brandModalOpen}
        brandToEdit={selectedBrandForEdit}
        onClose={closeBrandModal}
        onSave={saveBrand}
      />

      <TypeFormModal
        open={typeModalOpen}
        brands={brands}
        typeToEdit={selectedTypeForEdit}
        onClose={closeTypeModal}
        onSave={saveGarmentType}
      />

      <OrderDetailDrawer
        order={selectedOrder}
        open={orderDrawerOpen}
        onClose={closeOrderDrawer}
        onAdvance={advanceOrderStatus}
        onOpenDispatch={openDispatchModal}
      />

      <OrderDispatchModal
        open={dispatchModalOpen}
        order={selectedOrderForDispatch}
        onClose={closeDispatchModal}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <SizeFormModal
        open={sizeModalOpen}
        sizeToEdit={selectedSizeForEdit}
        onClose={closeSizeModal}
        onSave={saveSizeGroup}
      />

      <ColorFormModal
        open={colorModalOpen}
        colorToEdit={selectedColorForEdit}
        onClose={closeColorModal}
        onSave={saveColor}
      />

      <BranchFormModal
        open={branchModalOpen}
        branchToEdit={selectedBranchForEdit}
        onClose={closeBranchModal}
        onSave={saveBranch}
      />

      <AdminNotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigateOrders={() => setActiveMenu('orders')}
        orders={orders}
        products={products}
      />

      <CouponFormModal
        open={couponModalOpen}
        couponToEdit={selectedCouponForEdit}
        products={products}
        onClose={closeCouponModal}
      />

      <TeamMemberModal
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        onSave={saveTeamMember}
      />

      <OrderIncidentModal
        order={selectedIncidentOrder}
        open={incidentModalOpen}
        onClose={closeIncidentModal}
        onSubmit={handleReportIncident}
      />
    </div>
  );
};
