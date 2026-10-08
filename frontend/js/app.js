/**
 * TITULO E-Commerce - Inicializador Principal de la Aplicación
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar Lenis Smooth Scroll
  let lenisInstance = null;
  if (typeof Lenis !== "undefined") {
    try {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2
      });

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      window.lenis = lenisInstance;
    } catch (e) {
      console.warn("Lenis initialization error", e);
    }
  }

  // 2. Reloj en Vivo en el Header
  const updateClock = () => {
    const timeEl = document.getElementById("headerLiveTime");
    if (!timeEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    timeEl.textContent = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };
  updateClock();
  setInterval(updateClock, 1000);

  // 3. Menú Móvil
  const hamburgerBtn = document.getElementById("mobileMenuBtn");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const closeMobileMenu = document.getElementById("btnCloseMobileMenu");

  const toggleMobileMenu = (open) => {
    if (!mobileMenuOverlay) return;
    const shouldOpen = open !== undefined ? open : !mobileMenuOverlay.classList.contains("active");
    mobileMenuOverlay.classList.toggle("active", shouldOpen);
    if (hamburgerBtn) hamburgerBtn.classList.toggle("open", shouldOpen);
    document.body.classList.toggle("menu-open", shouldOpen);
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", () => toggleMobileMenu());
  if (closeMobileMenu) closeMobileMenu.addEventListener("click", () => toggleMobileMenu(false));

  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => toggleMobileMenu(false));
  });

  // 4. Scroll suave hacia anclas
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: -60 });
        } else {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // 5. Botón Volver Arriba
  const toTopBtn = document.getElementById("btnBackToTop");
  if (toTopBtn) {
    toTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (lenisInstance) {
        lenisInstance.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // 6. Inicializar módulos del sistema
  if (window.CartManager) window.CartManager.init();
  if (window.CatalogRender) window.CatalogRender.init();
  if (window.InfiniteSlider) window.InfiniteSlider.init();
  if (window.StatueController) window.StatueController.init();
  if (window.AudioController) window.AudioController.init();
  if (window.AdminController) window.AdminController.init();

  // 7. Año actual en el Footer
  const yearEl = document.getElementById("footerCurrentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 8. Formulario de Newsletter
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector("input[type='email']");
      if (input && input.value) {
        if (window.CartManager) {
          window.CartManager.showToast("¡Te has suscrito con éxito a los drops exclusivos de TITULO!");
        }
        input.value = "";
      }
    });
  }

  console.log("TITULO E-Commerce iniciado correctamente.");
});
