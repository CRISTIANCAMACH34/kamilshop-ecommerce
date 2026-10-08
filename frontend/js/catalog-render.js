/**
 * TITULO E-Commerce - Renderizador del Catálogo de Ropa (Ex-Artistas Monolith)
 * Filtros de categoría, ordenamiento, selección de tallas y vista rápida.
 */

const CatalogRender = {
  currentCategory: "todos",
  currentSort: "destacados",
  adminMode: false,

  init() {
    this.bindEvents();
    this.render();
  },

  setCategory(category) {
    this.currentCategory = category;
    document.querySelectorAll(".category-filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.category === category);
    });
    this.render();
  },

  setSort(sortValue) {
    this.currentSort = sortValue;
    this.render();
  },

  toggleAdminMode(enabled) {
    this.adminMode = enabled !== undefined ? enabled : !this.adminMode;
    const body = document.body;
    body.classList.toggle("admin-mode-active", this.adminMode);
    this.render();
  },

  getFilteredProducts() {
    let products = window.ProductsStore ? window.ProductsStore.getAll() : [];

    if (this.currentCategory !== "todos") {
      products = products.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    if (this.currentSort === "precio-bajo") {
      products.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === "precio-alto") {
      products.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === "nombre") {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // destacados / default
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return products;
  },

  render() {
    const grid = document.getElementById("apparelGrid");
    const countBadge = document.getElementById("catalogCountBadge");
    if (!grid) return;

    const products = this.getFilteredProducts();

    if (countBadge) {
      countBadge.textContent = `${products.length} ${products.length === 1 ? "PRENDA" : "PRENDAS"}`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty">
          <p>No se encontraron prendas en esta categoría.</p>
          ${this.adminMode ? `<button class="btn-primary" onclick="AdminController.openModal()">+ Agregar Prenda Ahora</button>` : ""}
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(product => {
      const defaultSize = product.sizes && product.sizes.length ? product.sizes[0] : "M";
      return `
        <article class="apparel-card" data-id="${product.id}" data-category="${product.category}">
          <div class="card-media-wrapper">
            <div class="card-badge badge-${product.badgeType || 'default'}">${product.badge}</div>
            
            ${this.adminMode ? `
              <div class="admin-card-actions">
                <button type="button" class="btn-admin-card btn-edit" onclick="AdminController.openEdit('${product.id}')" title="Editar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button type="button" class="btn-admin-card btn-delete" onclick="AdminController.confirmDelete('${product.id}')" title="Eliminar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ` : ""}

            <div class="card-image-box" onclick="CatalogRender.openQuickView('${product.id}')">
              <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='assets/products/apparel-tee-black.jpg'" class="card-img" />
              <div class="card-hover-overlay">
                <span class="btn-quick-look">VISTA RÁPIDA</span>
              </div>
            </div>
          </div>

          <div class="card-content">
            <div class="card-header-row">
              <span class="card-category-label">${product.category.toUpperCase()}</span>
              <span class="card-price">$${product.price.toFixed(2)} USD</span>
            </div>

            <h3 class="card-title" onclick="CatalogRender.openQuickView('${product.id}')">${product.name}</h3>
            
            <p class="card-specs">${product.specs || product.description.slice(0, 70) + "..."}</p>

            <div class="card-size-selector" data-selected-size="${defaultSize}">
              <span class="size-label">Talla:</span>
              <div class="sizes-pills">
                ${product.sizes.map((s, idx) => `
                  <button type="button" class="size-pill ${idx === 0 ? 'selected' : ''}" onclick="CatalogRender.selectCardSize(this, '${s}')">${s}</button>
                `).join("")}
              </div>
            </div>

            <div class="card-actions-row">
              <button type="button" class="btn-add-to-cart" onclick="CatalogRender.quickAddToCart('${product.id}', this)">
                <span class="btn-text">AÑADIR AL CARRITO</span>
                <span class="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </span>
              </button>
              
              <button type="button" class="btn-view-details" onclick="CatalogRender.openQuickView('${product.id}')" title="Detalle">
                <img src="assets/icons/668bf5037aeabfaa5b4b48ed_footer_arrow.svg" alt="Arrow" class="icon-arrow" />
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  },

  selectCardSize(buttonEl, size) {
    const parent = buttonEl.closest(".card-size-selector");
    if (!parent) return;
    parent.querySelectorAll(".size-pill").forEach(p => p.classList.remove("selected"));
    buttonEl.classList.add("selected");
    parent.dataset.selectedSize = size;
  },

  quickAddToCart(productId, buttonEl) {
    const product = window.ProductsStore.getById(productId);
    if (!product) return;

    const card = buttonEl.closest(".apparel-card");
    const sizeSelector = card ? card.querySelector(".card-size-selector") : null;
    const size = sizeSelector ? sizeSelector.dataset.selectedSize : (product.sizes[0] || "M");

    window.CartManager.addItem(product, size, 1);

    // Animación de feedback en el botón
    buttonEl.classList.add("added");
    const originalText = buttonEl.querySelector(".btn-text").textContent;
    buttonEl.querySelector(".btn-text").textContent = "¡AGREGADO!";
    setTimeout(() => {
      buttonEl.classList.remove("added");
      buttonEl.querySelector(".btn-text").textContent = originalText;
    }, 1200);
  },

  openQuickView(productId) {
    const product = window.ProductsStore.getById(productId);
    if (!product) return;

    const modal = document.getElementById("quickViewModal");
    if (!modal) return;

    modal.dataset.productId = product.id;
    document.getElementById("qvTitle").textContent = product.name;
    document.getElementById("qvPrice").textContent = `$${product.price.toFixed(2)} USD`;
    document.getElementById("qvCategory").textContent = product.category.toUpperCase();
    document.getElementById("qvBadge").textContent = product.badge;
    document.getElementById("qvDescription").textContent = product.description;
    document.getElementById("qvSpecs").textContent = product.specs;
    document.getElementById("qvImage").src = product.image;

    const sizesContainer = document.getElementById("qvSizesList");
    if (sizesContainer) {
      sizesContainer.innerHTML = product.sizes.map((s, idx) => `
        <button type="button" class="qv-size-btn ${idx === 0 ? 'active' : ''}" onclick="CatalogRender.selectQvSize(this, '${s}')">${s}</button>
      `).join("");
      sizesContainer.dataset.selectedSize = product.sizes[0] || "M";
    }

    const qtyInput = document.getElementById("qvQuantity");
    if (qtyInput) qtyInput.value = 1;

    modal.classList.add("active");
  },

  selectQvSize(buttonEl, size) {
    const parent = buttonEl.closest("#qvSizesList");
    if (!parent) return;
    parent.querySelectorAll(".qv-size-btn").forEach(b => b.classList.remove("active"));
    buttonEl.classList.add("active");
    parent.dataset.selectedSize = size;
  },

  closeQuickView() {
    const modal = document.getElementById("quickViewModal");
    if (modal) modal.classList.remove("active");
  },

  bindEvents() {
    window.addEventListener("titulo:products-updated", () => {
      this.render();
    });

    document.querySelectorAll(".category-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.setCategory(btn.dataset.category);
      });
    });

    const sortSelect = document.getElementById("catalogSortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.setSort(e.target.value);
      });
    }

    const closeQv = document.getElementById("btnCloseQuickView");
    if (closeQv) {
      closeQv.addEventListener("click", () => this.closeQuickView());
    }

    const qvOverlay = document.getElementById("qvOverlay");
    if (qvOverlay) {
      qvOverlay.addEventListener("click", () => this.closeQuickView());
    }

    const btnQvAddToCart = document.getElementById("btnQvAddToCart");
    if (btnQvAddToCart) {
      btnQvAddToCart.addEventListener("click", () => {
        const modal = document.getElementById("quickViewModal");
        if (!modal) return;
        const productId = modal.dataset.productId;
        const product = window.ProductsStore.getById(productId);
        if (!product) return;

        const sizesContainer = document.getElementById("qvSizesList");
        const size = sizesContainer ? sizesContainer.dataset.selectedSize : "M";
        const qtyInput = document.getElementById("qvQuantity");
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        window.CartManager.addItem(product, size, quantity);
        this.closeQuickView();
      });
    }
  }
};

window.CatalogRender = CatalogRender;
