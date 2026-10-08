import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { formatUSD, formatCOP, formatThousands } from '../services/currencyService';
import { getCategorySizingOptions } from '../utils/categorySizingConfig';

export const AdminModal = () => {
  const {
    isAdminModalOpen,
    closeAdminModal,
    editingProduct,
    openAdminModal,
    addProduct,
    updateProduct,
    removeProduct,
    resetProducts,
    products
  } = useProducts();

  useBodyScrollLock(isAdminModalOpen);

  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'form'
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del formulario
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('TITULO Atelier');
  const [gender, setGender] = useState('unisex');
  const [category, setCategory] = useState('camisetas');
  const [style, setStyle] = useState('streetwear');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('NUEVO');
  const [badgeType, setBadgeType] = useState('new');
  const [specs, setSpecs] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(0);
  const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL']);
  const [image, setImage] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setActiveTab('form');
      setName(editingProduct.name || '');
      setBrandName(editingProduct.brand?.commercial_name || 'TITULO Atelier');
      setGender(editingProduct.gender || 'unisex');
      setCategory(editingProduct.category || 'camisetas');
      setStyle(editingProduct.style || 'streetwear');
      setPrice(editingProduct.price || '');
      setBadge(editingProduct.badge || 'NUEVO');
      setBadgeType(editingProduct.badgeType || 'new');
      setSpecs(editingProduct.specs || '');
      setDescription(editingProduct.description || '');
      setStock(editingProduct.stock ?? 0);
      setSizes(editingProduct.sizes || ['S', 'M', 'L', 'XL']);
      setImage(editingProduct.image || '');
    } else {
      setName('');
      setBrandName('TITULO Atelier');
      setGender('unisex');
      setCategory('camisetas');
      setStyle('streetwear');
      setPrice('');
      setBadge('NUEVO');
      setBadgeType('new');
      setSpecs('');
      setDescription('');
      setStock(0);
      setSizes(['S', 'M', 'L', 'XL']);
      setImage('');
    }
  }, [editingProduct, isAdminModalOpen]);

  if (!isAdminModalOpen) return null;

  const currentSizing = getCategorySizingOptions(category, gender);
  const availableSizesList = currentSizing.defaultPreset ? currentSizing.defaultPreset.sizes : ['S', 'M', 'L', 'XL'];

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const sizing = getCategorySizingOptions(newCat, gender);
    if (sizing.defaultPreset?.sizes) {
      setSizes(sizing.defaultPreset.sizes);
    }
  };

  const handleGenderChange = (newGen) => {
    setGender(newGen);
    const sizing = getCategorySizingOptions(category, newGen);
    if (sizing.defaultPreset?.sizes) {
      setSizes(sizing.defaultPreset.sizes);
    }
  };

  const handleToggleSize = (s) => {
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleStartCreate = () => {
    openAdminModal(null);
    setActiveTab('form');
  };

  const handleStartEdit = (product) => {
    openAdminModal(product);
    setActiveTab('form');
  };

  const handleDelete = (prod) => {
    if (confirm(`¿Confirma que desea eliminar la prenda "${prod.name}" del catálogo?`)) {
      removeProduct(prod.id);
      showToast(`Prenda "${prod.name}" eliminada`);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name,
      brand: { commercial_name: brandName },
      gender,
      category,
      style,
      price: parseFloat(price) || 0,
      badge,
      badgeType,
      specs,
      description,
      stock: Math.max(0, parseInt(stock, 10) || 0),
      sizes: sizes.length ? sizes : ['S', 'M', 'L', 'XL'],
      image: image || ''
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      showToast('Prenda actualizada exitosamente');
    } else {
      addProduct(payload);
      showToast('¡Nueva prenda agregada a la tienda!');
    }

    setActiveTab('manage');
    closeAdminModal();
  };

  const handleResetCatalog = () => {
    if (confirm('¿Restaurar el catálogo predeterminado de ropa? Se perderán las prendas agregadas manualmente.')) {
      resetProducts();
      showToast('Catálogo restaurado a valores de fábrica');
      setActiveTab('manage');
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.gender?.toLowerCase().includes(term) ||
      p.style?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => { if (e.target === e.currentTarget) closeAdminModal(); }}
    >
      <div className="modal-window admin-modal-window" style={{ maxWidth: 960 }}>
        <button
          type="button"
          className="btn-close-modal"
          onClick={closeAdminModal}
          aria-label="Cerrar modal de admin"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Encabezado del Panel de Control */}
        <div className="admin-header-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="admin-modal-badge">SISTEMA E-COMMERCE // PANEL DE CONTROL</div>
            <h3 className="admin-modal-title" style={{ margin: '4px 0 0' }}>
              ADMINISTRACIÓN DE CATÁLOGO & PRENDAS
            </h3>
          </div>

          {/* Selector de Pestañas */}
          <div style={{ display: 'flex', gap: 8, background: 'var(--bg-secondary)', padding: 4, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className={`category-filter-btn ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
            >
              📋 Ver Catálogo ({products.length})
            </button>
            <button
              type="button"
              className={`category-filter-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={handleStartCreate}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
            >
              {editingProduct ? '✏️ Editando Prenda' : '➕ Crear Prenda'}
            </button>
          </div>
        </div>

        {/* PESTAÑA 1: GESTIÓN Y LISTA DE PRENDAS */}
        {activeTab === 'manage' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar prenda por nombre, estilo o género..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ maxWidth: 360, fontSize: '0.85rem' }}
              />

              <button
                type="button"
                className="btn-admin-submit"
                onClick={handleStartCreate}
                style={{ padding: '8px 18px', fontSize: '0.78rem' }}
              >
                + AGREGAR NUEVA PRENDA
              </button>
            </div>

            {/* Lista de Prendas en Grid */}
            <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 6 }}>
              {filteredProducts.map(prod => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '10px 16px',
                    gap: 14,
                    transition: 'border-color 0.2s'
                  }}
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ width: 48, height: 56, objectFit: 'cover', borderRadius: 4, background: '#1c1c1c' }}
                    onError={e => { e.target.src = 'assets/products/apparel-tee-black.jpg'; }}
                  />

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {prod.name}
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: 2 }}>
                      <span style={{ textTransform: 'uppercase', color: '#ffffff' }}>{prod.gender || 'Unisex'}</span>
                      <span>•</span>
                      <span style={{ textTransform: 'capitalize' }}>{prod.style || 'Streetwear'}</span>
                      <span>•</span>
                      <span>Stock: {formatThousands(prod.stock || 12)}</span>
                    </div>
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {formatUSD(prod.price || 0)}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(prod)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Editar prenda"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(prod)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(230, 57, 70, 0.12)',
                        border: '1px solid rgba(230, 57, 70, 0.3)',
                        borderRadius: 4,
                        color: 'var(--accent-red)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Eliminar prenda"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  No se encontraron prendas que coincidan con la búsqueda.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="btn-admin-reset"
                onClick={handleResetCatalog}
              >
                Restaurar catálogo inicial de fábrica
              </button>
              <button
                type="button"
                onClick={closeAdminModal}
                style={{ padding: '8px 18px', background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}
              >
                CERRAR PANEL
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: FORMULARIO DE ALTA O EDICIÓN */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="form-group full-width">
                <label className="form-label">Nombre de la Prenda *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Ej: TITULO Heavyweight Oversized Tee"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Marca / Casa de Moda</label>
                <select className="form-select" value={brandName} onChange={e => setBrandName(e.target.value)}>
                  <option value="TITULO Atelier">TITULO Atelier (Marca Propia)</option>
                  <option value="Kuro Archive">Kuro Archive (Japón)</option>
                  <option value="Acro Studios">Acro Studios (Francia)</option>
                  <option value="Aura Minimal">Aura Minimal (USA)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Público / Género Antropométrico</label>
                <select className="form-select" value={gender} onChange={e => handleGenderChange(e.target.value)}>
                  <option value="mujer">Mujer (Women)</option>
                  <option value="hombre">Hombre (Men)</option>
                  <option value="unisex">Unisex / Género Neutro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-select" value={category} onChange={e => handleCategoryChange(e.target.value)}>
                  <option value="camisetas">Camisetas & Tops</option>
                  <option value="hoodies">Hoodies / Sudaderas</option>
                  <option value="chaquetas">Chaquetas / Blazers</option>
                  <option value="pantalones">Pantalones & Jeans</option>
                  <option value="calzado">Zapatillas & Sneakers</option>
                  <option value="accesorios">Accesorios & Complementos</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estilo / Estética</label>
                <select className="form-select" value={style} onChange={e => setStyle(e.target.value)}>
                  <option value="streetwear">Streetwear Luxury</option>
                  <option value="minimalist">Minimalist Architecture</option>
                  <option value="techwear">Techwear & Utility</option>
                  <option value="tailoring">Modern Tailoring</option>
                  <option value="avant-garde">Avant-Garde Sculpture</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Precio ($ USD / COP) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  required
                  placeholder="Ej: 95.00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock en Inventario</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Etiqueta / Badge</label>
                <input
                  type="text"
                  className="form-input"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estilo del Badge</label>
                <select className="form-select" value={badgeType} onChange={e => setBadgeType(e.target.value)}>
                  <option value="new">Verde (Nuevo)</option>
                  <option value="limited">Dorado (Edición Limitada)</option>
                  <option value="hot">Rojo (Best Seller)</option>
                  <option value="exclusive">Púrpura (Exclusivo)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Tallas Disponibles ({currentSizing.defaultPreset?.name || 'Estándar'})
                  </label>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 700 }}>
                    {category.toUpperCase()} • {gender.toUpperCase()}
                  </span>
                </div>
                <div className="admin-sizes-checkboxes">
                  {availableSizesList.map(sz => (
                    <label className="admin-size-label" key={sz}>
                      <input
                        type="checkbox"
                        checked={sizes.includes(sz)}
                        onChange={() => handleToggleSize(sz)}
                      />
                      {sz}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Especificaciones Textiles (Fibras / Gramaje GSM)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 100% Algodón Peinado Francés • 480 GSM • Costuras dobles"
                  value={specs}
                  onChange={e => setSpecs(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Descripción de la Prenda</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Detalles de corte, patronaje y textura..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Fotografía de la Prenda</label>
                
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      background: '#ffffff',
                      color: '#000000',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <span>📁 Subir imagen desde tu equipo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(230, 57, 70, 0.15)',
                        border: '1px solid rgba(230, 57, 70, 0.3)',
                        borderRadius: 4,
                        color: '#ff4d4d',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Quitar imagen
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  className="form-input"
                  placeholder="O ingresa la URL de una imagen externa (https://...)"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                />

                <div className="admin-img-preview-box" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                  {image ? (
                    <img
                      className="admin-preview-thumb"
                      src={image}
                      alt="Vista previa"
                      style={{ width: 70, height: 84, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-subtle)' }}
                    />
                  ) : (
                    <div style={{ width: 70, height: 84, borderRadius: 6, border: '1px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', padding: 4 }}>
                      Sin imagen
                    </div>
                  )}
                  <span className="admin-preview-hint">Esta imagen se mostrará en catálogo, pasarela y vista rápida.</span>
                </div>
              </div>
            </div>

            <div className="admin-actions-bar">
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-secondary)',
                  padding: '10px 20px',
                  borderRadius: 4,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ← VOLVER A LA LISTA
              </button>

              <button type="submit" className="btn-admin-submit">
                {editingProduct ? 'GUARDAR CAMBIOS' : 'PUBLICAR PRENDA EN LA TIENDA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
