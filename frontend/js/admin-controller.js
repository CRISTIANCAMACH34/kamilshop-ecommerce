/**
 * TITULO E-Commerce - Panel de Administración de Ropa
 * Permite al administrador crear, modificar y eliminar prendas con persistencia real.
 */

const PRESET_IMAGES = [
  { label: "Hoodie Crema Prémium", url: "assets/products/apparel-hoodie-cream.jpg" },
  { label: "Camiseta Negra Clásica", url: "assets/products/apparel-tee-black.jpg" },
  { label: "Chaqueta Técnica Híbrida", url: "assets/products/apparel-jacket-tech.jpg" },
  { label: "Crewneck Gris Melange", url: "assets/products/apparel-crewneck-grey.jpg" },
  { label: "Pantalón Cargo Táctico", url: "assets/products/apparel-cargo-pants.jpg" },
  { label: "Camiseta Boxy Caída", url: "assets/products/apparel-oversized-tee.jpg" },
  { label: "Chaleco Táctico Modular", url: "assets/products/apparel-vest-street.jpg" },
  { label: "Gorra Lavada Monograma", url: "assets/products/apparel-cap-black.jpg" }
];

const AdminController = {
  currentEditId: null,

  init() {
    this.bindEvents();
    this.renderPresets();
  },

  renderPresets() {
    const container = document.getElementById("adminImagePresets");
    if (!container) return;

    container.innerHTML = PRESET_IMAGES.map((preset, idx) => `
      <div class="preset-img-pill ${idx === 0 ? 'active' : ''}" onclick="AdminController.selectPreset('${preset.url}', this)">
        <img src="${preset.url}" alt="${preset.label}" />
        <span>${preset.label}</span>
      </div>
    `).join("");
  },

  selectPreset(url, element) {
    document.querySelectorAll(".preset-img-pill").forEach(p => p.classList.remove("active"));
    if (element) element.classList.add("active");
    const input = document.getElementById("adminProductImage");
    if (input) input.value = url;
    this.updatePreviewImage(url);
  },

  updatePreviewImage(url) {
    const preview = document.getElementById("adminImagePreview");
    if (preview) {
      preview.src = url || "assets/products/apparel-tee-black.jpg";
    }
  },

  openModal(isEdit = false) {
    const modal = document.getElementById("adminModal");
    const form = document.getElementById("adminProductForm");
    const modalTitle = document.getElementById("adminModalTitle");
    const submitBtn = document.getElementById("adminSubmitBtn");

    if (!modal) return;

    if (!isEdit) {
      this.currentEditId = null;
      if (form) form.reset();
      if (modalTitle) modalTitle.textContent = "AGREGAR NUEVA PRENDA AL CATÁLOGO";
      if (submitBtn) submitBtn.textContent = "PUBLICAR PRENDA EN LA TIENDA";
      this.selectPreset(PRESET_IMAGES[0].url, document.querySelector(".preset-img-pill"));
    }

    modal.classList.add("active");
  },

  closeModal() {
    const modal = document.getElementById("adminModal");
    if (modal) modal.classList.remove("active");
    this.currentEditId = null;
  },

  openEdit(productId) {
    const product = window.ProductsStore.getById(productId);
    if (!product) return;

    this.currentEditId = productId;
    const modalTitle = document.getElementById("adminModalTitle");
    const submitBtn = document.getElementById("adminSubmitBtn");

    if (modalTitle) modalTitle.textContent = `EDITAR PRENDA: ${product.name}`;
    if (submitBtn) submitBtn.textContent = "GUARDAR CAMBIOS";

    document.getElementById("adminProductName").value = product.name;
    document.getElementById("adminProductCategory").value = product.category;
    document.getElementById("adminProductPrice").value = product.price;
    document.getElementById("adminProductBadge").value = product.badge;
    document.getElementById("adminProductBadgeType").value = product.badgeType || "new";
    document.getElementById("adminProductSpecs").value = product.specs || "";
    document.getElementById("adminProductDesc").value = product.description || "";
    document.getElementById("adminProductStock").value = product.stock || 10;
    document.getElementById("adminProductImage").value = product.image;
    this.updatePreviewImage(product.image);

    // Tallas
    const sizeCheckboxes = document.querySelectorAll("input[name='adminSizes']");
    sizeCheckboxes.forEach(cb => {
      cb.checked = (product.sizes || []).includes(cb.value);
    });

    this.openModal(true);
  },

  confirmDelete(productId) {
    const product = window.ProductsStore.getById(productId);
    if (!product) return;

    if (confirm(`¿Estás seguro de que deseas eliminar la prenda "${product.name}" del catálogo?`)) {
      window.ProductsStore.remove(productId);
      if (window.CartManager) {
        window.CartManager.showToast(`Prenda "${product.name}" eliminada`);
      }
    }
  },

  saveProduct(e) {
    e.preventDefault();

    const name = document.getElementById("adminProductName").value;
    const category = document.getElementById("adminProductCategory").value;
    const price = parseFloat(document.getElementById("adminProductPrice").value) || 0;
    const badge = document.getElementById("adminProductBadge").value;
    const badgeType = document.getElementById("adminProductBadgeType").value;
    const specs = document.getElementById("adminProductSpecs").value;
    const description = document.getElementById("adminProductDesc").value;
    const stock = parseInt(document.getElementById("adminProductStock").value) || 10;
    const image = document.getElementById("adminProductImage").value;

    const sizes = [];
    document.querySelectorAll("input[name='adminSizes']:checked").forEach(cb => {
      sizes.push(cb.value);
    });

    const productPayload = {
      name,
      category,
      price,
      badge,
      badgeType,
      specs,
      description,
      stock,
      sizes: sizes.length ? sizes : ["S", "M", "L", "XL"],
      image
    };

    if (this.currentEditId) {
      window.ProductsStore.update(this.currentEditId, productPayload);
      if (window.CartManager) {
        window.CartManager.showToast("Prenda actualizada exitosamente");
      }
    } else {
      window.ProductsStore.add(productPayload);
      if (window.CartManager) {
        window.CartManager.showToast("¡Nueva prenda publicada en la tienda!");
      }
    }

    this.closeModal();
  },

  resetCatalog() {
    if (confirm("¿Deseas restaurar el catálogo predeterminado de ropa? Se perderán las prendas agregadas manualmente.")) {
      window.ProductsStore.reset();
      if (window.CartManager) {
        window.CartManager.showToast("Catálogo restaurado a valores iniciales");
      }
    }
  },

  bindEvents() {
    const btnOpenAdmin = document.getElementById("btnTriggerAdminModal");
    if (btnOpenAdmin) {
      btnOpenAdmin.addEventListener("click", (e) => {
        e.preventDefault();
        this.openModal(false);
      });
    }

    const toggleAdminModeBtn = document.getElementById("btnToggleAdminMode");
    if (toggleAdminModeBtn) {
      toggleAdminModeBtn.addEventListener("click", () => {
        window.CatalogRender.toggleAdminMode();
        const isActive = window.CatalogRender.adminMode;
        toggleAdminModeBtn.classList.toggle("active", isActive);
        if (window.CartManager) {
          window.CartManager.showToast(isActive ? "Modo Administrador: ACTIVADO (Puedes editar/eliminar prendas)" : "Modo Administrador: DESACTIVADO");
        }
      });
    }

    const btnClose = document.getElementById("btnCloseAdminModal");
    if (btnClose) btnClose.addEventListener("click", () => this.closeModal());

    const overlay = document.getElementById("adminModalOverlay");
    if (overlay) overlay.addEventListener("click", () => this.closeModal());

    const form = document.getElementById("adminProductForm");
    if (form) form.addEventListener("submit", (e) => this.saveProduct(e));

    const imgInput = document.getElementById("adminProductImage");
    if (imgInput) {
      imgInput.addEventListener("input", (e) => {
        this.updatePreviewImage(e.target.value);
      });
    }

    const btnReset = document.getElementById("btnResetCatalog");
    if (btnReset) {
      btnReset.addEventListener("click", () => this.resetCatalog());
    }
  }
};

window.AdminController = AdminController;
