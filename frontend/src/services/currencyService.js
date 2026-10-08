/**
 * Servicio de Tasa de Cambio en Tiempo Real (USD / COP)
 * Consulta apis públicas financieras en vivo (exchangerate-api) con caché y fallback automático.
 */

const FALLBACK_COP_RATE = 4200;
const CACHE_KEY = 'titulo_usd_cop_rate_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de caché

let currentRate = FALLBACK_COP_RATE;
let isFetching = false;
let listeners = [];

/**
 * Carga inicial desde caché local si existe y no ha expirado
 */
try {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed && parsed.rate && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL_MS)) {
      currentRate = parsed.rate;
    }
  }
} catch (e) {}

/**
 * Obtiene la tasa de cambio TRM USD->COP en tiempo real desde la red
 */
export async function fetchLiveUsdCopRate() {
  if (isFetching) return currentRate;
  isFetching = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.COP) {
        const liveRate = Math.round(data.rates.COP);
        currentRate = liveRate;
        
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            rate: liveRate,
            timestamp: Date.now()
          }));
        } catch (e) {}

        // Notificar a los listeners activos
        listeners.forEach(fn => fn(liveRate));
        isFetching = false;
        return liveRate;
      }
    }
  } catch (err) {
    // Intentar endpoint de respaldo si falla el primero
    try {
      const resBackup = await fetch('https://open.er-api.com/v6/latest/USD');
      if (resBackup.ok) {
        const dataBackup = await resBackup.json();
        if (dataBackup && dataBackup.rates && dataBackup.rates.COP) {
          const liveRate = Math.round(dataBackup.rates.COP);
          currentRate = liveRate;
          listeners.forEach(fn => fn(liveRate));
          isFetching = false;
          return liveRate;
        }
      }
    } catch (e) {}
  }

  isFetching = false;
  return currentRate;
}

/**
 * Obtiene síncronamente la tasa actual en memoria
 */
export function getUsdCopRate() {
  return currentRate;
}

/**
 * Formatea un entero o cantidad con puntos de miles (ej: 1250 -> "1.250", 399000 -> "399.000")
 */
export function formatThousands(val) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const num = Math.round(Number(val));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formatea cualquier valor numérico con puntos de miles y decimales opcionales
 */
export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const num = Number(val);
  if (decimals === 0) {
    return formatThousands(num);
  }
  const parts = num.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intPart},${parts[1]}`;
}

/**
 * Formatea un monto a Pesos Colombianos (COP) garantizando puntos de miles y sin decimales.
 * Ej: 399000 -> "$ 399.000 COP"
 * Si el monto es menor a 1000 (probablemente en USD), se convierte automáticamente a COP usando la TRM.
 */
export function formatCOP(amount, customRate = null) {
  const rate = customRate || currentRate || FALLBACK_COP_RATE;
  const rawNum = typeof amount === 'number'
    ? amount
    : parseFloat(String(amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
  
  if (rawNum <= 0) return '$ 0 COP';

  // Si rawNum >= 1000 ya es una cifra en COP. Si es < 1000 asumimos USD y multiplicamos por la TRM.
  const copAmount = rawNum >= 1000 ? Math.round(rawNum) : Math.round(rawNum * rate);
  return `$ ${formatThousands(copAmount)} COP`;
}

/**
 * Formatea un monto en Dólares (USD) con separadores de miles y dos decimales.
 * Ej: 95 -> "$95.00 USD", 1250 -> "$1.250,00 USD" (o en formato internacional)
 * Si el monto es mayor a 1000 (probablemente en COP), se convierte automáticamente a USD usando la TRM.
 */
export function formatUSD(amount, customRate = null) {
  const rate = customRate || currentRate || FALLBACK_COP_RATE;
  const rawNum = typeof amount === 'number'
    ? amount
    : parseFloat(String(amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
  
  if (rawNum <= 0) return '$0.00 USD';

  const usdAmount = rawNum >= 1000 ? (rawNum / rate) : rawNum;
  const parts = usdAmount.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${intPart}.${parts[1]} USD`;
}

/**
 * Formato Dual: Muestra USD y el equivalente aproximado en COP con puntos de miles
 * Si el precio base es USD (< 1000): "$95.00 USD (≈ $ 399.000 COP)"
 * Si el precio base es COP (>= 1000): "$ 390.000 COP (≈ $92.86 USD)"
 */
export function formatPriceDual(amount, customRate = null) {
  const rawNum = typeof amount === 'number'
    ? amount
    : parseFloat(String(amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
  
  if (rawNum >= 1000) {
    return `${formatCOP(rawNum, customRate)} (≈ ${formatUSD(rawNum, customRate)})`;
  }
  return `${formatUSD(rawNum, customRate)} (≈ ${formatCOP(rawNum, customRate)})`;
}

/**
 * Suscribe un componente a cambios en la tasa en tiempo real
 */
export function subscribeCurrencyRate(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(fn => fn !== callback);
  };
}

// Iniciar búsqueda automática al cargar el módulo
fetchLiveUsdCopRate();
