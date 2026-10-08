import { useEffect } from 'react';

/**
 * useBodyScrollLock - Bloquea el scroll del fondo cuando un modal o drawer está abierto
 * Evita que la página de atrás se mueva al hacer scroll dentro del modal.
 */
export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    // Calcular ancho de la barra de desplazamiento para evitar saltos de layout
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalPaddingRight = document.body.style.paddingRight;

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
};
