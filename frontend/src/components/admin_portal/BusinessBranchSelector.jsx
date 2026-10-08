import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Check } from 'lucide-react';

/**
 * BusinessBranchSelector - Selector de sedes / dark stores
 * Copiado exactamente de Rapi_turbo/src/modules/business/components/BusinessBranchSelector.tsx
 */
export function BusinessBranchSelector({
  branches = [],
  value,
  onChange,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedBranch = branches.find((b) => b.name === value) || branches[0] || { name: 'Sede Principal' };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
      >
        <Store size={15} className="text-slate-400" />
        <span className="max-w-[150px] truncate sm:max-w-[220px]">
          {selectedBranch.name || 'Tienda Online (Dark Store Principal)'}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
          <div className="px-3 pb-1 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Operación 100% Online (Escalable)
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Centro de despacho activo de la tienda digital
            </p>
          </div>
          <div className="space-y-0.5">
            {branches.map((b) => {
              const isSelected = b.name === selectedBranch.name;
              return (
                <button
                  key={b.id || b.name}
                  type="button"
                  onClick={() => {
                    onChange?.(b.name);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-slate-100 text-slate-950 font-black'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  {isSelected && <Check size={14} className="shrink-0 text-slate-950" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
