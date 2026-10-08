import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

/**
 * HeroStatue - Escultura Fotorrealista de Alta Definición (Secuencia de Fotogramas Original de Monolith Studio)
 * Carga suavemente el Lottie fotorrealista original mediante canvas optimizado, controlado por el scroll de la página.
 */
export const HeroStatue = ({ onOpenRunway }) => {
  const statueRef = useRef(null);
  const animRef = useRef(null);
  const videoRef = useRef(null);
  const isVisibleRef = useRef(true);

  const handleScrollToSection = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!statueRef.current) return;

    const heroEl = document.getElementById('heroSection');
    let lastFrame = -1;

    const loadLottieInstance = () => {
      if (animRef.current || !statueRef.current) return;
      try {
        const anim = lottie.loadAnimation({
          container: statueRef.current,
          renderer: 'canvas',
          loop: false,
          autoplay: false,
          path: 'assets/statue/statue.json'
        });
        anim.addEventListener('DOMLoaded', () => {
          anim.goToAndStop(0, true);
        });
        animRef.current = anim;
      } catch (e) {
        console.warn("Lottie error", e);
      }
    };

    const destroyLottieInstance = () => {
      if (animRef.current) {
        try {
          animRef.current.destroy();
        } catch (e) {}
        animRef.current = null;
        lastFrame = -1;
      }
    };

    // IntersectionObserver para activar/destruir Lottie y controlar reproducción del video de fondo
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          loadLottieInstance();
          if (videoRef.current && window.scrollY < 200) {
            videoRef.current.play().catch(() => {});
          }
        } else {
          destroyLottieInstance();
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.02 }
    );

    if (heroEl) observer.observe(heroEl);

    // Cargar inmediatamente si la sección Hero está visible al montar
    if (window.scrollY < 400) {
      loadLottieInstance();
    }

    let scrollTicking = false;
    const handleScroll = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;

          if (videoRef.current) {
            if (scrollY > 150 && !videoRef.current.paused) {
              videoRef.current.pause();
            } else if (scrollY <= 150 && isVisibleRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
            }
          }

          if (animRef.current && isVisibleRef.current) {
            const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
            if (scrollY <= heroHeight * 1.05) {
              const total = animRef.current.totalFrames || 100;
              const progress = Math.min(Math.max(scrollY / (heroHeight * 0.9), 0), 1);
              const frame = Math.floor(progress * (total - 1));
              if (frame !== lastFrame) {
                lastFrame = frame;
                animRef.current.goToAndStop(frame, true);
              }
            }
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Parallax de mouse en dispositivos no táctiles
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    let mouseTicking = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e) => {
      if (!mouseTicking && isVisibleRef.current && !isTouch) {
        window.requestAnimationFrame(() => {
          if (statueRef.current) {
            const x = Math.round((e.clientX / window.innerWidth - 0.5) * 12);
            const y = Math.round((e.clientY / window.innerHeight - 0.5) * 12);
            if (Math.abs(x - lastX) >= 1 || Math.abs(y - lastY) >= 1) {
              lastX = x;
              lastY = y;
              statueRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
          }
          mouseTicking = false;
        });
        mouseTicking = true;
      }
    };

    const handleMouseLeave = () => {
      if (!statueRef.current) return;
      statueRef.current.style.transform = 'translate3d(0, 0, 0)';
    };

    if (heroEl && !isTouch) {
      heroEl.addEventListener('mousemove', handleMouseMove, { passive: true });
      heroEl.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (heroEl) {
        heroEl.removeEventListener('mousemove', handleMouseMove);
        heroEl.removeEventListener('mouseleave', handleMouseLeave);
        observer.disconnect();
      }
      destroyLottieInstance();
    };
  }, []);

  return (
    <section className="hero-section" id="heroSection">
      {/* Fondo de Video con Niebla */}
      <video
        ref={videoRef}
        className="hero-video-bg"
        autoPlay
        loop
        muted
        playsInline
        poster="assets/video/fog-poster.avif"
      >
        <source src="assets/video/fog.mp4" type="video/mp4" />
      </video>

      {/* Sombras y Degradados Atmosféricos */}
      <div className="hero-overlay-top"></div>
      <div className="hero-overlay-bottom"></div>

      {/* Tipografía Monumental de Fondo */}
      <div className="hero-giant-title-wrap">
        <h1 className="hero-giant-title" style={{ fontSize: 'clamp(2rem, 9.5vw, 8.5rem)', letterSpacing: '0.04em' }}>
          KAMIL SHOP
        </h1>
      </div>

      {/* Escultura Fotorrealista Original (Secuencia Lottie Canvas) */}
      <div className="hero-statue-wrap">
        <div ref={statueRef} className="statue-container"></div>
      </div>

      {/* Contenido de la Sección Hero */}
      <div className="hero-captions-container">
        <div className="hero-caption-top"></div>

        <div className="hero-caption-bottom">
          <div className="hero-tagline">
            KAMIL SHOP // MODA CONTEMPORÁNEA & DARK STORE DIGITAL COLOMBIA.
          </div>

          <div className="hero-action-buttons">
            <button
              type="button"
              onClick={() => handleScrollToSection('catalogo')}
              className="hero-action-btn-primary"
            >
              EXPLORAR CATÁLOGO ↓
            </button>

            <button
              type="button"
              onClick={onOpenRunway}
              className="hero-action-btn-secondary"
            >
              VER RUNWAY / LOOKBOOK ↗
            </button>
          </div>

          <div
            className="hero-scroll-indicator"
            onClick={() => handleScrollToSection('pasarela')}
            style={{ cursor: 'pointer' }}
            title="Ir a pasarela"
          >
            <span>SCROLL PARA EXPLORAR</span>
            <svg className="scroll-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
