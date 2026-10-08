/**
 * TITULO E-Commerce - Pasarela de Productos Estilo Infinite
 * Marquee continuo con soporte de arrastre (drag), pausado en hover y vista de detalles.
 */

const InfiniteSlider = {
  isDragging: false,
  startX: 0,
  scrollLeft: 0,
  animationId: null,
  speed: 0.8,
  currentOffset: 0,
  isPaused: false,

  init() {
    this.render();
    this.setupMarquee();
    this.bindEvents();
  },

  render() {
    const track = document.getElementById("pasarelaTrack");
    if (!track) return;

    const items = window.ProductsStore ? window.ProductsStore.getPasarelaItems() : [];
    // Duplicamos los elementos para garantizar un loop continuo infinito sin saltos
    const repeatedItems = [...items, ...items, ...items];

    track.innerHTML = repeatedItems.map((item, idx) => `
      <div class="pasarela-card" data-idx="${idx}" data-id="${item.id}">
        <div class="pasarela-card-inner">
          <div class="pasarela-badge">${item.tag}</div>
          <div class="pasarela-img-box">
            <img src="${item.image}" alt="${item.title}" loading="lazy" class="pasarela-img" />
          </div>
          <div class="pasarela-card-meta">
            <span class="pasarela-category">${item.category}</span>
            <h4 class="pasarela-title">${item.title}</h4>
            <p class="pasarela-desc">${item.desc}</p>
            <div class="pasarela-price-row">
              <span class="pasarela-price">${item.price}</span>
              <button type="button" class="btn-pasarela-add" onclick="InfiniteSlider.quickAddPasarela('${item.id}')">
                EXPLORAR
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  },

  setupMarquee() {
    const container = document.getElementById("pasarelaContainer");
    const track = document.getElementById("pasarelaTrack");
    if (!container || !track) return;

    const step = () => {
      if (!this.isPaused && !this.isDragging) {
        this.currentOffset += this.speed;
        const halfWidth = track.scrollWidth / 3;
        if (this.currentOffset >= halfWidth) {
          this.currentOffset -= halfWidth;
        }
        track.style.transform = `translateX(-${this.currentOffset}px)`;
      }
      this.animationId = requestAnimationFrame(step);
    };

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(step);
  },

  quickAddPasarela(itemId) {
    const items = window.ProductsStore.getPasarelaItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Abrir vista rápida o agregar producto representativo
    if (window.CartManager) {
      window.CartManager.showToast(`Producto de la pasarela: "${item.title}"`);
    }
  },

  bindEvents() {
    const container = document.getElementById("pasarelaContainer");
    const track = document.getElementById("pasarelaTrack");
    if (!container || !track) return;

    container.addEventListener("mouseenter", () => {
      this.isPaused = true;
    });

    container.addEventListener("mouseleave", () => {
      this.isPaused = false;
      this.isDragging = false;
      container.classList.remove("dragging");
    });

    // Mouse drag
    container.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.startX = e.pageX;
      this.scrollLeft = this.currentOffset;
      container.classList.add("dragging");
    });

    window.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        container.classList.remove("dragging");
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - this.startX) * 1.5;
      this.currentOffset = Math.max(0, this.scrollLeft - walk);
      track.style.transform = `translateX(-${this.currentOffset}px)`;
    });

    // Touch support para móviles
    container.addEventListener("touchstart", (e) => {
      this.isDragging = true;
      this.isPaused = true;
      this.startX = e.touches[0].pageX;
      this.scrollLeft = this.currentOffset;
    }, { passive: true });

    container.addEventListener("touchend", () => {
      this.isDragging = false;
      this.isPaused = false;
    });

    container.addEventListener("touchmove", (e) => {
      if (!this.isDragging) return;
      const x = e.touches[0].pageX;
      const walk = (x - this.startX) * 1.5;
      this.currentOffset = Math.max(0, this.scrollLeft - walk);
      track.style.transform = `translateX(-${this.currentOffset}px)`;
    }, { passive: true });
  }
};

window.InfiniteSlider = InfiniteSlider;
