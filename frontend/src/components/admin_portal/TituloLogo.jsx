import React from 'react';

/**
 * TituloLogo - Logotipo corporativo oficial de KAMIL SHOP
 * Diseño impecable en una sola línea (nowrap) sin cortes de línea ni desbordamientos
 */
export function TituloLogo({
  className = '',
  subtitle = '',
  subtitleClassName = 'text-slate-400 font-bold uppercase tracking-[0.16em] text-[10px]',
  size = 'md',
}) {
  const sizeMap = {
    xs: { icon: 'h-6 w-6 text-xs', text: 'text-xs', gap: 'gap-1.5' },
    sm: { icon: 'h-7 w-7 text-xs', text: 'text-xs sm:text-sm', gap: 'gap-2' },
    md: { icon: 'h-8 w-8 text-sm', text: 'text-sm sm:text-base', gap: 'gap-2' },
    lg: { icon: 'h-10 w-10 text-base', text: 'text-lg sm:text-xl', gap: 'gap-2.5' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-start select-none max-w-full overflow-hidden ${className}`}>
      <div className={`flex items-center shrink-0 whitespace-nowrap ${currentSize.gap}`}>
        <div className={`grid place-items-center shrink-0 rounded-lg bg-slate-950 font-black text-white shadow-xs ${currentSize.icon}`}>
          <span>K</span>
        </div>
        <span className={`font-black tracking-tight text-slate-950 whitespace-nowrap leading-none ${currentSize.text}`}>
          KAMIL SHOP
        </span>
      </div>
      {subtitle ? <p className={`whitespace-nowrap leading-none mt-1 ${subtitleClassName}`}>{subtitle}</p> : null}
    </div>
  );
}
