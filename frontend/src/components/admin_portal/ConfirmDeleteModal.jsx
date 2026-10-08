import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro de eliminar este registro?",
  description = "Esta acción eliminará permanentemente la información de tu catálogo y no se podrá deshacer.",
  itemName = "",
  confirmText = "Eliminar permanentemente",
  cancelText = "Cancelar",
  isDanger = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Container del modal */}
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar X */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Encabezado con Ícono Glowing */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
            {isDanger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {title}
            </h3>
            {itemName && (
              <p className="text-sm font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-lg px-2.5 py-1 inline-block">
                "{itemName}"
              </p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {description}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-900/30 hover:from-rose-500 hover:to-red-500 active:scale-95 transition cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
