/**
 * ecommerceUtils.js - Utilidades Centralizadas (DRY & SOLID)
 * Centraliza formateo financiero, fechas, exportación a Excel y enlaces de WhatsApp.
 */

import {
  formatThousands,
  formatNumber,
  formatCOP,
  formatUSD,
  formatPriceDual
} from '../services/currencyService';

export { formatThousands, formatNumber, formatCOP, formatUSD, formatPriceDual };

/**
 * Formatea valores monetarios garantizando separadores de miles
 */
export function formatCurrency(amount, currency = 'USD') {
  if (currency === 'COP') return formatCOP(amount);
  return formatUSD(amount);
}

/**
 * Formatea fechas a formato legible local
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return includeTime
      ? d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
      : d.toLocaleDateString('es-CO');
  } catch {
    return dateString;
  }
}

/**
 * Exporta datos tabulares a un archivo CSV compatible 100% con Microsoft Excel (con BOM UTF-8)
 */
export function exportToCsv(filename, headers = [], rows = []) {
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera enlaces seguros y limpios a WhatsApp Web o Móvil
 */
export function buildWhatsAppLink(rawPhone, message = '') {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  const cleanPhone = digits.startsWith('57') ? digits : `57${digits || '3008421920'}`;
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Mapeo de estados de órdenes con estilo visual y descripciones para humanos
 */
export const ORDER_STATUS_CONFIG = {
  NUEVA: {
    label: 'Recibida en Tienda',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'El cliente realizó la compra en la tienda online y el pago fue verificado.',
  },
  EN_PICKING: {
    label: 'En Alistamiento (Picking)',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Las prendas están siendo empacadas en el Centro de Despacho Digital.',
  },
  DESPACHADA: {
    label: 'En Ruta / Despachada',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
    description: 'El paquete va en camino con transportadora o mensajería hacia el domicilio.',
  },
  ENTREGADA: {
    label: 'Entregada al Cliente',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'El comprador confirmó que recibió su pedido a satisfacción.',
  },
  CON_INCIDENCIA: {
    label: 'Incidencia Logística',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    description: 'Reporte de retraso o problema en la dirección de entrega.',
  },
};
