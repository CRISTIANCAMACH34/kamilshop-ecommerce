/**
 * TITULO E-Commerce - Controlador de la Escultura 3D (Lottie / Scroll Rig)
 * Sincroniza la rotación de la estatua clásica con el scroll y movimiento del cursor.
 */

const StatueController = {
  anim: null,
  container: null,
  totalFrames: 100,
  isReady: false,

  init() {
    this.container = document.getElementById("statueContainer");
    if (!this.container) return;

    this.loadLottie();
    this.bindScroll();
    this.bindMouseTilt();
  },

  loadLottie() {
    if (typeof lottie === "undefined") {
      console.warn("Lottie library no detectada, esperando...");
      return;
    }

    try {
      this.anim = lottie.loadAnimation({
        container: this.container,
        renderer: "canvas",
        loop: false,
        autoplay: false,
        path: "assets/statue/statue.json"
      });

      this.anim.addEventListener("DOMLoaded", () => {
        this.isReady = true;
        this.totalFrames = this.anim.totalFrames || 100;
        this.updateFrameByScroll();
        this.container.classList.add("loaded");
      });

      this.anim.addEventListener("data_failed", () => {
        console.warn("Fallo cargando Lottie JSON, aplicando fallback visual");
        this.container.classList.add("statue-fallback");
      });
    } catch (e) {
      console.error("Error inicializando estatua 3D", e);
    }
  },

  updateFrameByScroll() {
    if (!this.anim || !this.isReady) return;

    const hero = document.getElementById("heroSection");
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const scrollProgress = Math.min(Math.max(-rect.top / (heroHeight * 0.9), 0), 1);

    const frame = Math.floor(scrollProgress * (this.totalFrames - 1));
    this.anim.goToAndStop(frame, true);
  },

  bindScroll() {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateFrameByScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  bindMouseTilt() {
    const hero = document.getElementById("heroSection");
    if (!hero) return;

    hero.addEventListener("mousemove", (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;

      if (this.container) {
        this.container.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`;
      }
    });

    hero.addEventListener("mouseleave", () => {
      if (this.container) {
        this.container.style.transform = `translate3d(0, 0, 0) scale(1)`;
      }
    });
  }
};

window.StatueController = StatueController;
