import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detectar si el usuario ya descartó el prompt en esta sesión
    if (sessionStorage.getItem('pwa_prompt_dismissed')) return;

    // Detectar dispositivos iOS (Safari no emite 'beforeinstallprompt')
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Mostrar banner tras 4 segundos en iOS
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    }

    // Para Android y Chrome Desktop: Evento 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[9999] bg-[#121212]/95 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
            <Smartphone size={20} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white tracking-wide uppercase">
              INSTALAR APLICACIÓN ATELIER
            </div>
            <div className="text-[11px] text-white/60 leading-tight mt-0.5">
              Acceso directo desde tu pantalla de inicio en Android o iPhone.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-white/40 hover:text-white transition p-1"
          aria-label="Cerrar banner"
        >
          <X size={16} />
        </button>
      </div>

      {isIos ? (
        <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-white/70 flex items-center gap-2">
          <span>Para instalar en tu iPhone: pulsa</span>
          <Share size={14} className="text-blue-400" />
          <span>y selecciona <strong>"Agregar al inicio"</strong></span>
          <PlusSquare size={14} className="text-white" />
        </div>
      ) : (
        <div className="mt-3 pt-2 flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-white/60 hover:text-white transition"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white text-black hover:bg-white/90 transition flex items-center gap-1.5"
          >
            <Download size={13} />
            INSTALAR APP
          </button>
        </div>
      )}
    </div>
  );
};
