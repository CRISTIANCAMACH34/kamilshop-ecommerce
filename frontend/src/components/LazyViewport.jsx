import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyViewport Component
 * Solo renderiza/carga el contenido cuando entra al rango visual (Viewport).
 * Si sale del viewport, descarga componentes pesados para mantener el uso de CPU y Memoria al mínimo.
 */
export const LazyViewport = ({
  children,
  minHeight = '250px',
  rootMargin = '250px 0px',
  className = '',
  keepMounted = false
}) => {
  const [isInViewport, setIsInViewport] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          setHasBeenSeen(true);
        } else {
          if (!keepMounted) {
            setIsInViewport(false);
          }
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, keepMounted]);

  const shouldRender = keepMounted ? (isInViewport || hasBeenSeen) : isInViewport;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: shouldRender ? undefined : minHeight,
        width: '100%'
      }}
    >
      {shouldRender ? (
        children
      ) : (
        <div
          style={{
            height: minHeight,
            width: '100%',
            background: 'rgba(255,255,255,0.01)',
            borderRadius: '8px'
          }}
        />
      )}
    </div>
  );
};
