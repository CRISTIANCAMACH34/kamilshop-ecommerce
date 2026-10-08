/**
 * TITULO E-Commerce - Carrito de Compras Slide-Out & Checkout
 */

const CART_STORAGE_KEY = "titulo_ecommerce_cart_v1";

const CartManager = {
  items: [],
  discountPercent: 0,
  activeCoupon: null,

  init() {
    this.load();
    this.bindEvents();
    this.render();
  },

  load() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      this.items = data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Error cargando carrito", e);
      this.items = [];
    }
  },

  save() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      this.updateBadges();
      this.render();
      window.dispatchEvent(new CustomEvent("titulo:cart-updated", { detail: { items: this.items } }));
    } catch (e) {
      console.error("Error guardando carrito", e);
    }
  },

  addItem(product, size = "M", quantity = 1) {
    if (!product) return;
    const itemKey = `${product.id}_${size}`;
    const existingIndex = this.items.findIndex(it => it.key === itemKey);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        key: itemKey,
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        size: size,
        image: product.image,
        quantity: quantity
      });
    }

    this.save();
    this.openDrawer();
    this.showToast(`"${product.name}" (${size}) agregado al carrito`);
  },

  updateQuantity(itemKey, delta) {
    const item = this.items.find(it => it.key === itemKey);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(itemKey);
    } else {
      this.save();
    }
  },

  removeItem(itemKey) {
    this.items = this.items.filter(it => it.key !== itemKey);
    this.save();
    this.showToast("Prenda eliminada del carrito");
  },

  clear() {
    this.items = [];
    this.activeCoupon = null;
    this.discountPercent = 0;
    this.save();
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = subtotal * (this.discountPercent / 100);
    return Math.max(0, subtotal - discount);
  },

  applyCoupon(code) {
    const clean = (code || "").trim().toUpperCase();
    if (clean === "TITULO10") {
      this.discountPercent = 10;
      this.activeCoupon = "TITULO10";
      this.render();
      this.showToast("Cupón aplicado: 10% de descuento");
      return true;
    } else if (clean === "TITULO20") {
      this.discountPercent = 20;
      this.activeCoupon = "TITULO20";
      this.render();
      this.showToast("Cupón exclusivo: 20% de descuento");
      return true;
    } else {
      this.showToast("Cupón inválido. Prueba con TITULO10", "error");
      return false;
    }
  },

  updateBadges() {
    const count = this.getCount();
    document.querySelectorAll(".cart-count-badge").forEach(el => {
      el.textContent = count;
      if (count > 0) {
        el.classList.add("has-items");
      } else {
        el.classList.remove("has-items");
      }
    });
  },

  openDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer) drawer.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.classList.add("cart-open");
  },

  closeDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer) drawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.classList.remove("cart-open");
  },

  render() {
    const container = document.getElementById("cartItemsList");
    const emptyState = document.getElementById("cartEmptyState");
    const footer = document.getElementById("cartFooter");
    const subtotalEl = document.getElementById("cartSubtotal");
    const totalEl = document.getElementById("cartTotal");
    const discountRow = document.getElementById("cartDiscountRow");
    const discountAmountEl = document.getElementById("cartDiscountAmount");

    this.updateBadges();

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      if (footer) footer.style.display = "none";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (footer) footer.style.display = "block";

    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/products/apparel-tee-black.jpg'" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-meta">Talla: <span>${item.size}</span> • $${item.price.toFixed(2)} USD</div>
          <div class="cart-item-actions">
            <div class="quantity-stepper">
              <button type="button" class="btn-qty-minus" onclick="CartManager.updateQuantity('${item.key}', -1)">−</button>
              <span class="qty-num">${item.quantity}</span>
              <button type="button" class="btn-qty-plus" onclick="CartManager.updateQuantity('${item.key}', 1)">+</button>
            </div>
            <button type="button" class="btn-remove-item" onclick="CartManager.removeItem('${item.key}')" title="Eliminar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="cart-item-total">
          $${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    `).join("");

    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)} USD`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)} USD`;

    if (discountRow) {
      if (this.discountPercent > 0) {
        discountRow.style.display = "flex";
        const discountVal = subtotal * (this.discountPercent / 100);
        if (discountAmountEl) discountAmountEl.textContent = `-$${discountVal.toFixed(2)} (${this.discountPercent}%)`;
      } else {
        discountRow.style.display = "none";
      }
    }
  },

  showToast(message, type = "success") {
    let toast = document.getElementById("tituloToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "tituloToast";
      toast.className = "titulo-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `titulo-toast show ${type}`;

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  },

  openCheckout() {
    if (this.items.length === 0) {
      this.showToast("Tu carrito está vacío", "error");
      return;
    }
    this.closeDrawer();
    const modal = document.getElementById("checkoutModal");
    if (modal) {
      modal.classList.add("active");
      const summaryList = document.getElementById("checkoutSummaryList");
      const checkoutTotal = document.getElementById("checkoutTotalFinal");
      if (summaryList) {
        summaryList.innerHTML = this.items.map(item => `
          <div class="checkout-summary-row">
            <span>${item.name} (${item.size}) x${item.quantity}</span>
            <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        `).join("");
      }
      if (checkoutTotal) {
        checkoutTotal.textContent = `$${this.getTotal().toFixed(2)} USD`;
      }
    }
  },

  closeCheckout() {
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.classList.remove("active");
  },

  processCheckout(formData) {
    const orderNumber = "TITULO-" + Math.floor(100000 + Math.random() * 900000);
    this.closeCheckout();

    const successModal = document.getElementById("orderSuccessModal");
    if (successModal) {
      const orderNumEl = document.getElementById("successOrderNumber");
      if (orderNumEl) orderNumEl.textContent = orderNumber;
      successModal.classList.add("active");
    }

    this.clear();
    this.showToast(`¡Pedido confirmado! #${orderNumber}`);
  },

  bindEvents() {
    document.querySelectorAll(".trigger-cart-open").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    const closeBtn = document.getElementById("btnCartClose");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeDrawer());

    const overlay = document.getElementById("cartOverlay");
    if (overlay) overlay.addEventListener("click", () => this.closeDrawer());

    const couponBtn = document.getElementById("btnApplyCoupon");
    const couponInput = document.getElementById("cartCouponInput");
    if (couponBtn && couponInput) {
      couponBtn.addEventListener("click", () => {
        this.applyCoupon(couponInput.value);
      });
    }

    const checkoutBtn = document.getElementById("btnProceedCheckout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.openCheckout());
    }

    const closeCheckoutBtn = document.getElementById("btnCloseCheckout");
    if (closeCheckoutBtn) {
      closeCheckoutBtn.addEventListener("click", () => this.closeCheckout());
    }

    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(checkoutForm);
        this.processCheckout(data);
      });
    }

    const closeSuccessBtn = document.getElementById("btnCloseSuccess");
    if (closeSuccessBtn) {
      closeSuccessBtn.addEventListener("click", () => {
        const successModal = document.getElementById("orderSuccessModal");
        if (successModal) successModal.classList.remove("active");
      });
    }
  }
};

window.CartManager = CartManager;
