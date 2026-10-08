import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

/**
 * AdminHelpBadge - Componente de Ayuda Ultra-Sencilla
 * Muestra un icono (?) amigable que al pasar el mouse o hacer clic despliega
 * una explicación clara, corta y en lenguaje humano de para qué sirve el dato o campo.
 */
export function AdminHelpBadge({ text, title = '¿Para qué sirve esto?' }) {
  const [show, setShow] = useState(false);

  if (!text) return null;

  return (
    <span className="relative inline-flex items-center ml-1 align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(!show);
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-help focus:outline-none"
        title="Clic para ver explicación"
      >
        <HelpCircle size={12} />
      </button>

      {show && (
        <div
          role="tooltip"
          className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-1.5 z-50 w-52 sm:w-64 max-w-[85vw] rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white shadow-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          {title && (
            <p className="text-[10px] font-black uppercase tracking-wider text-white mb-0.5">
              {title}
            </p>
          )}
          <p className="text-[11px] font-medium leading-relaxed text-slate-200">
            {text}
          </p>
          <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
}
